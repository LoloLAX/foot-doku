/**
 * wiki_enricher.js — Enrichissement via pages Wikipedia individuelles
 *
 * Pour chaque joueur avec caps >= 10, récupère :
 *   - clubs_historique  : tous les clubs pro (array de strings)
 *   - height_cm         : taille en cm
 *   - wc_winner         : a gagné au moins une Coupe du Monde (bool)
 *   - cl_winner         : a gagné au moins une Ligue des Champions (bool)
 *   - ballon_dor        : a gagné un Ballon d'Or (bool)
 *
 * Lance : node wiki_enricher.js
 * Reprend automatiquement là où il s'est arrêté.
 */

const axios  = require('axios');
const fs     = require('fs');
const path   = require('path');

const DB_PATH      = path.join(__dirname, 'database_scrape.js');
const DELAY_MS     = 1000;  // 1 requête/seconde — respecte les limites Wikipedia
const MIN_CAPS     = 10;    // seuil de caps pour tenter l'enrichissement
const BATCH_SIZE   = 20;    // sauvegarder toutes les N enrichissements

// ── Lecture de la DB ──────────────────────────────────────────────────────────

function loadDB() {
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  const match = raw.match(/const PLAYERS_DB\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) throw new Error('PLAYERS_DB introuvable dans database_scrape.js');
  return JSON.parse(match[1]);
}

function saveDB(players) {
  const js = `// Base de données joueurs CdM 2026 — générée automatiquement
// ${players.length} joueurs | enrichissement Wikipedia inclus
const PLAYERS_DB = ${JSON.stringify(players, null, 2)};
`;
  fs.writeFileSync(DB_PATH, js, 'utf8');
}

// ── Récupération du wikitext via l'API Wikipedia ─────────────────────────────

function cleanName(name) {
  return name
    .replace(/\s+(RET|retired|retiré)\s*$/i, '')  // suffixes parasites
    .replace(/[‘’‚‛]/g, "'")   // apostrophes courbes → droites
    .replace(/[–—]/g, '-')                // tirets longs → courts
    .trim();
}

async function fetchWikitext(name) {
  const clean = cleanName(name);

  // Stratégie 1 : titre direct (nom → underscores)
  const slug = clean.replace(/\s+/g, '_');

  // Tentatives avec backoff sur 429
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await axios.get('https://en.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          titles: slug,
          prop: 'revisions',
          rvprop: 'content',
          rvslots: 'main',
          format: 'json',
          redirects: 1
        },
        timeout: 12000,
        headers: { 'User-Agent': 'Foot-Doku/1.0 (educational project)' }
      });

      const pages = r.data.query.pages;
      const page  = Object.values(pages)[0];

      if (page.pageid === -1) return null; // page vraiment inexistante, inutile de retenter

      const wikitext = page.revisions?.[0]?.slots?.main?.['*'] || '';
      if (!wikitext) return null;
      return wikitext;

    } catch (e1) {
      const is429 = e1.response?.status === 429 || e1.message.includes('429');
      if (is429 && attempt < 2) {
        const wait = (attempt + 1) * 5000; // 5s puis 10s
        process.stderr.write(`  [429] attente ${wait/1000}s...\n`);
        await sleep(wait);
        continue;
      }
      if (process.env.DEBUG) process.stderr.write(`  [direct] ${e1.message}\n`);
      break;
    }
  }

  // Stratégie 2 : OpenSearch pour trouver le bon titre
  await sleep(500); // pause supplémentaire avant le fallback
  try {
    const r = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'opensearch',
        search: `${clean} footballer`,
        limit: 3,
        format: 'json',
        redirects: 'resolve'
      },
      timeout: 10000,
      headers: { 'User-Agent': 'Foot-Doku/1.0' }
    });

    const titles = r.data[1];
    if (!titles || titles.length === 0) return null;

    // Prendre le premier résultat non-club
    for (const title of titles) {
      if (/club|f\.c\.|fc |team/i.test(title)) continue;

      const r2 = await axios.get('https://en.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          titles: title,
          prop: 'revisions',
          rvprop: 'content',
          rvslots: 'main',
          format: 'json',
          redirects: 1
        },
        timeout: 12000,
        headers: { 'User-Agent': 'Foot-Doku/1.0' }
      });
      const pages = r2.data.query.pages;
      const page  = Object.values(pages)[0];
      if (page.pageid !== -1) {
        return page.revisions?.[0]?.slots?.main?.['*'] || null;
      }
    }
  } catch { /* rien trouvé */ }

  return null;
}

// ── Parsing du wikitext ───────────────────────────────────────────────────────

function extractWikiLink(str) {
  // [[Lien|Texte affiché]] → "Texte affiché"  /  [[Lien]] → "Lien"
  return str.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, link, display) => display || link)
            .replace(/\{\{[^}]*\}\}/g, '')  // templates
            .replace(/<[^>]+>/g, '')         // balises HTML résiduelles
            .replace(/\s*\(loan\)/gi, '')
            .replace(/\s*\(on loan\)/gi, '')
            .replace(/→/g, '')
            .replace(/\*/g, '')
            .replace(/'/g, "'")
            .trim();
}

function parseClubsHistorique(wikitext) {
  const clubs = [];
  if (!wikitext) return clubs;

  // L'infobox football utilise des paramètres | clubs1 =, | clubs2 =, ...
  // Parfois aussi | youthclubs1 = (on ignore), | clubs = (liste inline)
  const clubPattern = /\|\s*clubs(\d+)\s*=\s*([^\n|]+)/g;
  let m;
  while ((m = clubPattern.exec(wikitext)) !== null) {
    const raw  = m[2];
    const name = extractWikiLink(raw);
    if (!name || name.length < 2) continue;
    if (/\b(II|III|B|U\d{2}|Youth|Reserve|Reserves|Women|Feminin)\b/i.test(name)) continue;
    if (!clubs.includes(name)) clubs.push(name);
  }

  // Fallback : liste inline | clubs = Club A, Club B
  if (clubs.length === 0) {
    const inline = wikitext.match(/\|\s*clubs\s*=\s*([^\n|]+)/);
    if (inline) {
      inline[1].split(/[,;]/).forEach(part => {
        const name = extractWikiLink(part);
        if (name && name.length > 2 && !/\b(II|B|U\d{2}|Youth)\b/i.test(name)) {
          if (!clubs.includes(name)) clubs.push(name);
        }
      });
    }
  }

  return clubs;
}

function parseHeight(wikitext) {
  if (!wikitext) return null;
  // | height = 1.80 ou | height = {{height|1|80}}
  const m = wikitext.match(/\|\s*height\s*=\s*(?:{{[^}]*}}\s*)?1[.,](\d{2})/i);
  if (m) return parseInt('1' + m[1], 10);
  // Format {{convert|180|cm|...}}
  const m2 = wikitext.match(/convert\|(\d{3})\|cm/i);
  if (m2) return parseInt(m2[1], 10);
  return null;
}

function parseAwards(wikitext) {
  if (!wikitext) return { wc_winner: false, cl_winner: false, ballon_dor: false };
  const t = wikitext;
  // La section Honours/Trophées liste les titres
  return {
    wc_winner:  /FIFA World Cup\s*\n[^|]*\|\s*(2018|2022|2026)/i.test(t) ||
                /\[\[20(18|22|26) FIFA World Cup\]\]/i.test(t) && /winner|champion/i.test(t),
    cl_winner:  /UEFA Champions League\s*\n[^|]*\|\s*\d{4}/i.test(t) ||
                /\[\[UEFA Champions League\]\]/i.test(t) && /winner|champion/i.test(t),
    ballon_dor: /Ballon d.Or\s*\n[^|]*\|\s*\d{4}/i.test(t) ||
                /\[\[Ballon d.Or\]\]/i.test(t) && /winner/i.test(t)
  };
}

// ── Boucle principale ─────────────────────────────────────────────────────────

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const players = loadDB();

  // Réinitialiser les joueurs "enrichis" mais sans clubs (premier run avait un bug de parsing)
  let reset = 0;
  for (const p of players) {
    if (p._wiki_enriched === true && (!p.clubs_historique || p.clubs_historique.length === 0)) {
      p._wiki_enriched = undefined;
      reset++;
    }
  }
  if (reset > 0) {
    saveDB(players);
    console.log(`🔄 ${reset} joueurs réinitialisés (enrichis sans clubs — bug de parsing corrigé)\n`);
  }

  // _wiki_enriched: true + clubs présents = OK, skip
  // _wiki_enriched: false = a échoué, retente
  // undefined = jamais tenté ou réinitialisé, tente
  const toEnrich = players.filter(p =>
    (p.caps || 0) >= MIN_CAPS && p._wiki_enriched !== true
  );

  console.log(`\n📖 Wiki Enricher — Clubs historiques & awards`);
  console.log(`Total joueurs DB : ${players.length}`);
  console.log(`Éligibles (caps ≥ ${MIN_CAPS}) : ${players.filter(p => (p.caps||0) >= MIN_CAPS).length}`);
  console.log(`À enrichir : ${toEnrich.length}\n`);

  let enriched = 0;
  let failed   = 0;

  for (let i = 0; i < toEnrich.length; i++) {
    const p = toEnrich[i];
    process.stdout.write(`[${i+1}/${toEnrich.length}] ${p.name} (${p.nationality_selection}, ${p.caps} caps)... `);

    // 1. Récupérer le wikitext (2 appels max : direct + fallback opensearch)
    const wikitext = await fetchWikitext(p.name);
    await sleep(DELAY_MS);

    if (!wikitext) {
      process.stdout.write(`❌ page introuvable\n`);
      failed++;
      const idx = players.findIndex(x => x.name === p.name && x.nationality_selection === p.nationality_selection);
      if (idx !== -1) players[idx]._wiki_enriched = false;
      continue;
    }

    // 2. Parser
    const clubs   = parseClubsHistorique(wikitext);
    const height  = parseHeight(wikitext);
    const awards  = parseAwards(wikitext);

    // 4. Mettre à jour le joueur dans le tableau principal
    const idx = players.findIndex(x => x.name === p.name && x.nationality_selection === p.nationality_selection);
    if (idx !== -1) {
      if (clubs.length > 0) players[idx].clubs_historique = clubs;
      if (height)           players[idx].height_cm = height;
      players[idx].wc_winner   = awards.wc_winner;
      players[idx].cl_winner   = awards.cl_winner;
      players[idx].ballon_dor  = awards.ballon_dor;
      players[idx]._wiki_enriched = true;
    }

    const clubsStr = clubs.length > 0 ? `✅ ${clubs.length} clubs` : `⚠️  0 clubs`;
    const heightStr = height ? `, ${height}cm` : '';
    const awardsStr = [
      awards.wc_winner  ? '🏆WC' : '',
      awards.cl_winner  ? '🏆CL' : '',
      awards.ballon_dor ? '⚽BD' : ''
    ].filter(Boolean).join(' ');

    process.stdout.write(`${clubsStr}${heightStr} ${awardsStr}\n`);
    enriched++;

    // Sauvegarder toutes les BATCH_SIZE enrichissements
    if (enriched % BATCH_SIZE === 0) {
      saveDB(players);
      console.log(`  💾 [${enriched} enrichissements sauvegardés]\n`);
    }
  }

  // Sauvegarde finale
  saveDB(players);

  const withClubs = players.filter(p => p.clubs_historique && p.clubs_historique.length > 0).length;
  const wcWinners = players.filter(p => p.wc_winner).length;
  const clWinners = players.filter(p => p.cl_winner).length;
  const bdWinners = players.filter(p => p.ballon_dor).length;

  console.log(`\n📊 Résumé :`);
  console.log(`   Enrichis ce run      : ${enriched}`);
  console.log(`   Échecs               : ${failed}`);
  console.log(`   Avec clubs histo     : ${withClubs}/${players.length}`);
  console.log(`   Champions du monde   : ${wcWinners}`);
  console.log(`   Vainqueurs CL        : ${clWinners}`);
  console.log(`   Vainqueurs Ballon d'Or : ${bdWinners}`);
  console.log(`\n💾 Sauvegardé dans database_scrape.js`);
  console.log(`➡️  Lance "node generer_browser_db.js" pour mettre à jour data_browser.js`);
  console.log(`➡️  Lance "node generer_contraintes.js" pour recalculer les contraintes\n`);
}

main().catch(console.error);
