// scraper.js — Foot-Doku CdM 2026
// Installe les dépendances : npm install axios cheerio
// Usage : node scraper.js

const axios  = require('axios');
const cheerio = require('cheerio');
const fs     = require('fs');

const URL = 'https://www.roadtowc.com/official-2026-world-cup-squads-confirmed-players-for-all-48-teams-updated-list/';
const OUTPUT = './database_scrape.js';

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
};

const POSITION_MAP = {
    'Goalkeepers': 'Gardien',
    'Defenders':   'Défenseur',
    'Midfielders': 'Milieu',
    'Forwards':    'Attaquant',
};

// Mapping noms de pays (page EN) → standard jeu
const NOM_SELECTION = {
    'Argentina':               'Argentina',
    'Brazil':                  'Brazil',
    'Colombia':                'Colombia',
    'Mexico':                  'Mexico',
    'United States':           'USA',
    'Canada':                  'Canada',
    'Panama':                  'Panama',
    'Haiti':                   'Haiti',
    'Curaçao':                 'Curaçao',
    'France':                  'France',
    'Germany':                 'Germany',
    'Portugal':                'Portugal',
    'England':                 'England',
    'Spain':                   'Spain',
    'Netherlands':             'Netherlands',
    'Belgium':                 'Belgium',
    'Croatia':                 'Croatia',
    'Switzerland':             'Switzerland',
    'Austria':                 'Austria',
    'Norway':                  'Norway',
    'Scotland':                'Scotland',
    'Czechia':                 'Czech Republic',
    'Sweden':                  'Sweden',
    'Bosnia and Herzegovina':  'Bosnia & Herzegovina',
    'Japan':                   'Japan',
    'South Korea':             'South Korea',
    'Saudi Arabia':            'Saudi Arabia',
    'Qatar':                   'Qatar',
    'Morocco':                 'Morocco',
    'Senegal':                 'Senegal',
    'Ivory Coast':             'Ivory Coast',
    'Tunisia':                 'Tunisia',
    'Egypt':                   'Egypt',
    'South Africa':            'South Africa',
    'DR Congo':                'Congo DR',
    'Cape Verde':              'Cape Verde',
    'New Zealand':             'New Zealand',
    'Uruguay':                 'Uruguay',
    'Paraguay':                'Paraguay',
    'Ecuador':                 'Ecuador',
    'Australia':               'Australia',
    'Iran':                    'Iran',
    'Iraq':                    'Iraq',
    'Jordan':                  'Jordan',
    'Uzbekistan':              'Uzbekistan',
    'Algeria':                 'Algeria',
    'Ghana':                   'Ghana',
    'Türkiye':                 'Türkiye',
};

function parseTextContent(text) {
    const joueurs = [];
    let selectionActuelle = null;
    let positionActuelle  = null;

    for (const ligne of text.split('\n')) {
        // Détecte "### France squad tracker"
        const matchEquipe = ligne.match(/^#+\s+(.+?)\s+squad tracker/i);
        if (matchEquipe) {
            const nomBrut = matchEquipe[1].trim();
            selectionActuelle = NOM_SELECTION[nomBrut] || nomBrut;
            positionActuelle  = null;
            continue;
        }

        if (!selectionActuelle) continue;

        // Détecte "**Goalkeepers:** Nom1, Nom2, ..."
        const matchPos = ligne.match(/\*\*(Goalkeepers|Defenders|Midfielders|Forwards):\*\*\s*(.+)/);
        if (matchPos) {
            positionActuelle = POSITION_MAP[matchPos[1]];
            const noms = matchPos[2]
                .split(',')
                .map(n => n.replace(/\s*\([^)]*\)/g, '').replace(/\.$/, '').trim())
                .filter(n => n.length > 1);
            for (const nom of noms) {
                joueurs.push({ id: null, name: nom, nationality_selection: selectionActuelle, position: positionActuelle, club_current: null, league_current: null });
            }
        }
    }
    return joueurs;
}

function parseHTML(html) {
    const $ = cheerio.load(html);
    const joueurs = [];
    let selectionActuelle = null;
    let positionActuelle  = null;

    // Parcourt tous les éléments de l'article
    $('h3, h4, p, ul, li, strong').each((_, el) => {
        const tag  = el.tagName.toLowerCase();
        const text = $(el).text().trim();

        if (tag === 'h3' || tag === 'h4') {
            const m = text.match(/^(.+?)\s+squad tracker/i);
            if (m) {
                selectionActuelle = NOM_SELECTION[m[1].trim()] || m[1].trim();
                positionActuelle  = null;
            }
        }

        if (!selectionActuelle) return;

        if (tag === 'strong') {
            const posKey = Object.keys(POSITION_MAP).find(k => text.startsWith(k));
            if (posKey) positionActuelle = POSITION_MAP[posKey];
        }

        if (tag === 'p' && positionActuelle) {
            // Cherche "**Goalkeepers:** Nom1, Nom2"
            const m = text.match(/^(Goalkeepers|Defenders|Midfielders|Forwards):\s*(.+)/);
            if (m) {
                positionActuelle = POSITION_MAP[m[1]];
                const noms = m[2].split(',').map(n => n.replace(/\([^)]*\)/g, '').replace(/\.$/, '').trim()).filter(n => n.length > 1);
                for (const nom of noms) {
                    joueurs.push({ id: null, name: nom, nationality_selection: selectionActuelle, position: positionActuelle, club_current: null, league_current: null });
                }
            }
        }
    });

    return joueurs;
}

function fusionnerAvecExistant(nouveaux) {
    if (!fs.existsSync(OUTPUT)) return nouveaux;

    // Charge l'ancienne DB
    delete require.cache[require.resolve(OUTPUT)];
    let anciens;
    try { anciens = require(OUTPUT); } catch { return nouveaux; }

    // Garde les champs enrichis (club, id, etc.) des entrées déjà traitées
    const indexAnciens = {};
    for (const j of anciens) {
        indexAnciens[j.name + '|' + j.nationality_selection] = j;
    }

    return nouveaux.map(j => {
        const cle = j.name + '|' + j.nationality_selection;
        const ancien = indexAnciens[cle];
        if (ancien && (ancien.club_current || ancien.id)) {
            return { ...j, id: ancien.id, club_current: ancien.club_current, league_current: ancien.league_current };
        }
        return j;
    });
}

async function main() {
    console.log('🌐 Scraping roadtowc.com...');
    const res = await axios.get(URL, { headers: HEADERS, timeout: 15000 });

    // Tente d'abord le parsing HTML, puis fallback texte brut
    let joueurs = parseHTML(res.data);

    if (joueurs.length < 50) {
        console.log('  ⚠️  HTML parsing insuffisant, tentative texte brut...');
        const $ = cheerio.load(res.data);
        const texte = $('body').text();
        joueurs = parseTextContent(texte);
    }

    if (joueurs.length < 50) {
        console.log(`  ❌ Seulement ${joueurs.length} joueurs — la page est probablement rendue côté client.`);
        console.log('  → Ouvre le fichier manuellement ou utilise Claude in Chrome.');
        process.exit(1);
    }

    // Fusionne avec les données enrichies existantes
    const fusionnes = fusionnerAvecExistant(joueurs);

    // Bilan
    const parSelection = {};
    for (const j of fusionnes) parSelection[j.nationality_selection] = (parSelection[j.nationality_selection] || 0) + 1;
    console.log(`\n✅ ${fusionnes.length} joueurs sur ${Object.keys(parSelection).length} sélections`);
    for (const [sel, nb] of Object.entries(parSelection).sort()) {
        console.log(`   ${sel.padEnd(30)} ${nb}`);
    }

    const contenu = `// Effectifs CdM 2026 — source : roadtowc.com
// Mis à jour le : ${new Date().toLocaleDateString('fr-FR')}
// ${fusionnes.length} joueurs — ${Object.keys(parSelection).length} sélections

const PLAYERS_DB = ${JSON.stringify(fusionnes, null, 2)};

module.exports = PLAYERS_DB;
`;
    fs.writeFileSync(OUTPUT, contenu);
    console.log(`\n💾 Sauvegardé dans ${OUTPUT}`);
}

main().catch(err => {
    console.error('❌ Erreur :', err.message);
    process.exit(1);
});
