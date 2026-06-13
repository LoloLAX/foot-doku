// generer_contraintes.js — régénère generateur.js et moteur.js
// Usage : node generer_contraintes.js
// Prérequis : node generer_browser_db.js doit avoir été lancé avant

const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('./players_wc2026.json', 'utf-8'));

const POS_FR = { Goalkeeper: 'Gardien', Defender: 'Défenseur', Midfielder: 'Milieu', Attacker: 'Attaquant' };
const DB = raw.map(p => ({
    name:                   p.name,
    birth_country:          p.birth_country,
    nationality_selection:  p.national_team_name,
    national_confederation: p.national_confederation,
    club_current:           p.current_club_name,
    league_current:         p.current_club_league_name,
    position:               POS_FR[p.position] || p.position,
    caps:                   p.national_caps,
    goals_selection:        p.national_goals,
    age:                    p.age,
    clubs_historique: [...new Set((p.career_history || []).map(e => e.club_name).filter(Boolean))],
}));

// ── Comptages ────────────────────────────────────────────────────────────────

function compter(fn) {
    const counts = {};
    for (const j of DB) { const v = fn(j); if (v) counts[v] = (counts[v] || 0) + 1; }
    return counts;
}

const clubCounts      = compter(j => j.club_current);
const ligueCounts     = compter(j => j.league_current);
const paysCounts      = compter(j => j.nationality_selection);
const naissanceCounts = compter(j => j.birth_country);

const ancienClubCounts = {};
for (const j of DB) {
    for (const c of j.clubs_historique) ancienClubCounts[c] = (ancienClubCounts[c] || 0) + 1;
}

// ── Pools ────────────────────────────────────────────────────────────────────

const CLUBS         = Object.entries(clubCounts).filter(([,n]) => n >= 4).sort((a,b) => b[1]-a[1]).map(([c]) => c);
const ANCIENS_CLUBS = Object.entries(ancienClubCounts).filter(([c,n]) => n >= 8 && !clubCounts[c]).sort((a,b) => b[1]-a[1]).map(([c]) => `Ex-${c}`);
const CHAMPIONNATS  = Object.entries(ligueCounts).filter(([,n]) => n >= 8).sort((a,b) => b[1]-a[1]).map(([c]) => c);
const SELECTIONS    = Object.entries(paysCounts).filter(([,n]) => n >= 10).sort((a,b) => b[1]-a[1]).map(([c]) => c);
const NAISSANCES    = Object.entries(naissanceCounts).filter(([,n]) => n >= 15).sort((a,b) => b[1]-a[1]).map(([c]) => `Né en ${c}`);
const POSTES        = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant'];

// Lettres — n'importe quelle lettre du nom (prénom + nom, accents ignorés)
function nameLetters(name) {
    return [...new Set(name.normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase().split('').filter(l => /[A-Z]/.test(l)))];
}
const letterCounts = {};
for (const j of DB) { for (const l of nameLetters(j.name)) letterCounts[l] = (letterCounts[l]||0)+1; }
const LETTRES = Object.entries(letterCounts).filter(([,n])=>n>=15).sort((a,b)=>a[0].localeCompare(b[0])).map(([l])=>`Lettre ${l}`);

// Stats
const statsDefs = [
    { v: '50+ sélections',     fn: j => (j.caps || 0) >= 50 },
    { v: '100+ sélections',    fn: j => (j.caps || 0) >= 100 },
    { v: '10+ buts sélection', fn: j => (j.goals_selection || 0) >= 10 },
    { v: '30+ buts sélection', fn: j => (j.goals_selection || 0) >= 30 },
    { v: 'Moins de 23 ans',    fn: j => j.age !== null && j.age < 23 },
    { v: '30 ans ou plus',     fn: j => j.age !== null && j.age >= 30 },
];
const STATS = statsDefs.filter(s => DB.filter(s.fn).length >= 15).map(s => s.v);

const LIGNES_POOL   = [...CLUBS, ...ANCIENS_CLUBS, ...CHAMPIONNATS];
const COLONNES_POOL = [...SELECTIONS, ...POSTES, ...NAISSANCES, ...LETTRES, ...STATS];

console.log(`📊 Contraintes :`);
console.log(`   Clubs actuels  : ${CLUBS.length}`);
console.log(`   Anciens clubs  : ${ANCIENS_CLUBS.length}`);
console.log(`   Championnats   : ${CHAMPIONNATS.length}`);
console.log(`   Sélections     : ${SELECTIONS.length}`);
console.log(`   Pays naissance : ${NAISSANCES.length}`);

// ── matchesContrainte ────────────────────────────────────────────────────────

function matchesContrainte(j, c) {
    if (!c) return false;
    if (c.includes(' OU '))      return c.split(' OU ').some(p => matchesContrainte(j, p.trim()));
    if (c.startsWith('Ex-'))     return j.clubs_historique.includes(c.slice(3));
    if (c.startsWith('Né en '))  return j.birth_country === c.slice(6);
    if (c.startsWith('Lettre ')) return nameLetters(j.name).includes(c.slice(7));
    if (c === '50+ sélections')      return (j.caps || 0) >= 50;
    if (c === '100+ sélections')     return (j.caps || 0) >= 100;
    if (c === '10+ buts sélection')  return (j.goals_selection || 0) >= 10;
    if (c === '30+ buts sélection')  return (j.goals_selection || 0) >= 30;
    if (c === 'Moins de 23 ans')     return j.age !== null && j.age < 23;
    if (c === '30 ans ou plus')      return j.age !== null && j.age >= 30;
    return j.club_current === c || j.league_current === c
        || j.nationality_selection === c || j.position === c;
}

function nbSolutions(l, c) {
    return DB.filter(j => matchesContrainte(j, l) && matchesContrainte(j, c)).length;
}

// ── Validation croisée ───────────────────────────────────────────────────────

const MIN_SOL = 1;

const lignesUtiles   = LIGNES_POOL.filter(l => COLONNES_POOL.some(c => nbSolutions(l, c) >= MIN_SOL));
const colonnesUtiles = COLONNES_POOL.filter(c => lignesUtiles.some(l => nbSolutions(l, c) >= MIN_SOL));

console.log(`   Lignes utiles  : ${lignesUtiles.length}`);
console.log(`   Colonnes utiles: ${colonnesUtiles.length}`);

const CLUBS_F      = lignesUtiles.filter(l => clubCounts[l]);
const ANCIENS_F    = lignesUtiles.filter(l => l.startsWith('Ex-'));
const LIGUES_F     = lignesUtiles.filter(l => ligueCounts[l]);
const SELECTIONS_F = colonnesUtiles.filter(c => paysCounts[c]);
const NAISSANCES_F = colonnesUtiles.filter(c => c.startsWith('Né en '));
const LETTRES_F    = colonnesUtiles.filter(c => c.startsWith('Lettre '));
const STATS_F      = colonnesUtiles.filter(c => STATS.includes(c));

// ── Écrire generateur.js ─────────────────────────────────────────────────────

const generateurContent = `// generateur.js — généré automatiquement le ${new Date().toLocaleDateString('fr-FR')}
// Source : players_wc2026.json via generer_contraintes.js
// Usage : node generateur.js [--all]

const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('./players_wc2026.json', 'utf-8'));

const POS_FR = { Goalkeeper: 'Gardien', Defender: 'Défenseur', Midfielder: 'Milieu', Attacker: 'Attaquant' };
const PLAYERS_DB = raw.map(p => ({
    name:                  p.name,
    birth_country:         p.birth_country,
    nationality_selection: p.national_team_name,
    club_current:          p.current_club_name,
    league_current:        p.current_club_league_name,
    position:              POS_FR[p.position] || p.position,
    caps:                  p.national_caps,
    clubs_historique: [...new Set((p.career_history || []).map(e => e.club_name).filter(Boolean))],
}));

const CLUBS         = ${JSON.stringify(CLUBS_F)};
const ANCIENS_CLUBS = ${JSON.stringify(ANCIENS_F)};
const CHAMPIONNATS  = ${JSON.stringify(LIGUES_F)};
const SELECTIONS    = ${JSON.stringify(SELECTIONS_F)};
const NAISSANCES    = ${JSON.stringify(NAISSANCES_F)};
const LETTRES       = ${JSON.stringify(LETTRES_F)};
const STATS         = ${JSON.stringify(STATS_F)};
const POSTES        = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant'];

const LIGNES_POOL   = [...CLUBS, ...ANCIENS_CLUBS, ...CHAMPIONNATS];
const COLONNES_POOL = [...SELECTIONS, ...POSTES, ...NAISSANCES, ...LETTRES, ...STATS];

function _nameLetters(name) { return name.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toUpperCase().split('').filter(l => /[A-Z]/.test(l)); }

function matchesContrainte(j, c) {
    if (!c) return false;
    if (c.startsWith('Ex-'))     return j.clubs_historique.includes(c.slice(3));
    if (c.startsWith('Né en '))  return j.birth_country === c.slice(6);
    if (c.startsWith('Lettre ')) return _nameLetters(j.name).includes(c.slice(7));
    if (c === '50+ sélections')      return (j.caps || 0) >= 50;
    if (c === '100+ sélections')     return (j.caps || 0) >= 100;
    if (c === '10+ buts sélection')  return (j.goals_selection || 0) >= 10;
    if (c === '30+ buts sélection')  return (j.goals_selection || 0) >= 30;
    if (c === 'Moins de 23 ans')     return j.age !== null && j.age < 23;
    if (c === '30 ans ou plus')      return j.age !== null && j.age >= 30;
    return j.club_current === c || j.league_current === c
        || j.nationality_selection === c || j.position === c;
}

function nbSolutions(l, c) {
    return PLAYERS_DB.filter(j => matchesContrainte(j, l) && matchesContrainte(j, c)).length;
}

function getSolutions(l, c) {
    return PLAYERS_DB.filter(j => matchesContrainte(j, l) && matchesContrainte(j, c));
}

// ── Qualité ──────────────────────────────────────────────────────────────────

const MIN_SOL = 3;   // ≥3 solutions par case (minimum publié)
const MAX_SOL = 40;  // ≤40 solutions par case

function typeLigne(l) {
    if (l.startsWith('Ex-'))       return 'ex';
    if (CHAMPIONNATS.includes(l))  return 'ligue';
    return 'club';
}
function typeColonne(c) {
    if (c.startsWith('Né en '))  return 'naissance';
    if (POSTES.includes(c))      return 'poste';
    return 'selection';
}

function diversiteOK(lignes, colonnes) {
    const tl = lignes.map(typeLigne);
    const tc = colonnes.map(typeColonne);
    if (tl.filter(t => t === 'ligue').length === 3) return false;  // 3 ligues trop facile
    if (tc.filter(t => t === 'poste').length >= 3)  return false;  // 3 postes trop facile
    if (!tc.includes('selection'))                  return false;  // toujours au moins 1 sélection
    return true;
}

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

// ── Algo : choisit 3 colonnes, cherche les lignes compatibles ───────────────

function genererGrilleParfaite(nbGrilles = 1) {
    const resultats = [];
    let tentativesTotal = 0;

    for (let g = 0; g < nbGrilles * 200 && resultats.length < nbGrilles; g++) {
        // 1. Tire 3 colonnes
        const colonnes = shuffle(COLONNES_POOL).slice(0, 3);
        if (!diversiteOK(['club','ex','ligue'], colonnes)) continue;  // vérifie colonnes seules

        // 2. Trouve toutes les lignes compatibles avec ces 3 colonnes
        const lignesCompatibles = LIGNES_POOL.filter(l =>
            colonnes.every(c => { const n = nbSolutions(l, c); return n >= MIN_SOL && n <= MAX_SOL; })
        );

        if (lignesCompatibles.length < 3) continue;

        // 3. Tire 3 lignes parmi les compatibles
        const lignesCandidates = shuffle(lignesCompatibles);
        for (let i = 0; i + 2 < lignesCandidates.length; i++) {
            const lignes = lignesCandidates.slice(i, i + 3);
            tentativesTotal++;
            if (!diversiteOK(lignes, colonnes)) continue;

            let minSol = Infinity, maxSol = 0;
            for (const l of lignes) {
                for (const c of colonnes) {
                    const n = nbSolutions(l, c);
                    if (n < minSol) minSol = n;
                    if (n > maxSol) maxSol = n;
                }
            }

            const score = minSol * 2 + (MAX_SOL - maxSol);  // favorise les grilles équilibrées

            resultats.push({ lignes, colonnes, minSol, maxSol, score,
                publieLe: new Date().toLocaleDateString('fr-FR') });
            break;
        }
    }

    if (resultats.length === 0) {
        console.log('⚠️  Aucune grille valide trouvée.');
        return null;
    }

    // Trie par score décroissant, prend la meilleure
    resultats.sort((a, b) => b.score - a.score);
    const best = resultats[0];

    console.log('\\n=== GRILLE (parmi ' + resultats.length + ' candidates) ===');
    console.log('              | ' + best.colonnes.map(c => c.slice(0,16).padEnd(16)).join(' | ') + ' |');
    console.log('-'.repeat(74));
    best.lignes.forEach(l => {
        const sols = best.colonnes.map(c => nbSolutions(l, c));
        console.log(l.slice(0,14).padEnd(14) + ' | ' + sols.map(n => String(n).padEnd(16)).join(' | ') + ' |');
    });
    console.log('Solutions min=' + best.minSol + ' max=' + best.maxSol);

    const grille = { lignes: best.lignes, colonnes: best.colonnes, publieLe: best.publieLe };
    console.log('\\n--- Coller dans la console admin ---');
    console.log("localStorage.setItem('footdoku_grille', " + JSON.stringify(JSON.stringify(grille)) + ")");
    return grille;
}

genererGrilleParfaite();
`;

fs.writeFileSync('./generateur.js', generateurContent);
console.log(`\n✅ generateur.js écrit`);

// ── Écrire moteur.js ─────────────────────────────────────────────────────────

const moteurContent = `// moteur.js — généré automatiquement le ${new Date().toLocaleDateString('fr-FR')}
// Validation des réponses joueur

const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('./players_wc2026.json', 'utf-8'));

const POS_FR = { Goalkeeper: 'Gardien', Defender: 'Défenseur', Midfielder: 'Milieu', Attacker: 'Attaquant' };
const PLAYERS_DB = raw.map(p => ({
    name:                  p.name,
    birth_country:         p.birth_country,
    nationality_selection: p.national_team_name,
    club_current:          p.current_club_name,
    league_current:        p.current_club_league_name,
    position:              POS_FR[p.position] || p.position,
    caps:                  p.national_caps,
    clubs_historique: [...new Set((p.career_history || []).map(e => e.club_name).filter(Boolean))],
}));

function normaliserNom(nom) {
    return nom.toLowerCase()
        .replace(/[àáâãäå]/g,'a').replace(/[èéêë]/g,'e')
        .replace(/[ìíîï]/g,'i').replace(/[òóôõö]/g,'o')
        .replace(/[ùúûü]/g,'u').replace(/[ñ]/g,'n')
        .replace(/[ç]/g,'c').replace(/[ž]/g,'z')
        .replace(/[š]/g,'s').replace(/ø/g,'o')
        .replace(/æ/g,'ae').replace(/[^a-z\\s'-]/g,'').trim();
}

function trouverJoueur(nom) {
    const q = normaliserNom(nom);
    return PLAYERS_DB.find(j => {
        const n = normaliserNom(j.name);
        if (n === q) return true;
        // match nom de famille
        const parts = n.split(' ');
        if (parts[parts.length - 1] === q) return true;
        // contient la query
        if (n.includes(q) || q.includes(n.split(' ').pop())) return true;
        return false;
    });
}

function _nameLetters(name) { return name.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toUpperCase().split('').filter(l => /[A-Z]/.test(l)); }

function matchesContrainte(j, c) {
    if (!c) return false;
    if (c.includes(' OU '))      return c.split(' OU ').some(p => matchesContrainte(j, p.trim()));
    if (c.startsWith('Ex-'))     return j.clubs_historique.includes(c.slice(3));
    if (c.startsWith('Né en '))  return j.birth_country === c.slice(6);
    if (c.startsWith('Lettre ')) return _nameLetters(j.name).includes(c.slice(7));
    if (c === '50+ sélections')      return (j.caps || 0) >= 50;
    if (c === '100+ sélections')     return (j.caps || 0) >= 100;
    if (c === '10+ buts sélection')  return (j.goals_selection || 0) >= 10;
    if (c === '30+ buts sélection')  return (j.goals_selection || 0) >= 30;
    if (c === 'Moins de 23 ans')     return j.age !== null && j.age < 23;
    if (c === '30 ans ou plus')      return j.age !== null && j.age >= 30;
    return j.club_current === c || j.league_current === c
        || j.nationality_selection === c || j.position === c;
}

function verifierReponse(nomJoueur, contrainteLigne, contrainteColonne) {
    const j = trouverJoueur(nomJoueur);
    if (!j) return { succes: false, message: 'Joueur introuvable.' };

    if (matchesContrainte(j, contrainteLigne) && matchesContrainte(j, contrainteColonne)) {
        return { succes: true, message: '✅ ' + j.name + ' (' + j.nationality_selection + ') — ' + j.club_current, joueur: j };
    }
    return { succes: false, message: '❌ ' + j.name + ' ne satisfait pas les deux contraintes.', joueur: j };
}

function getSolutions(l, c) {
    return PLAYERS_DB.filter(j => matchesContrainte(j, l) && matchesContrainte(j, c));
}

module.exports = { verifierReponse, matchesContrainte, getSolutions, PLAYERS_DB };

// --- TEST ---
if (require.main === module) {
    console.log(verifierReponse("Mbappé",     "Real Madrid",          "France"));
    console.log(verifierReponse("Haaland",    "Premier League",       "Norway"));
    console.log(verifierReponse("Thuram",     "Ex-Paris Saint-Germain", "France"));
    console.log(verifierReponse("Griezmann",  "Ex-Atletico Madrid",   "Né en France"));
    console.log(verifierReponse("Lamine Yamal","La Liga",             "Spain"));
}
`;

fs.writeFileSync('./moteur.js', moteurContent);
console.log(`✅ moteur.js écrit`);
console.log(`\n➡️  Lance "node generateur.js" pour générer une grille.`);
