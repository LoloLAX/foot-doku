// generer_browser_db.js — génère data_browser.js depuis players_wc2026.json
// Usage : node generer_browser_db.js

const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('./players_wc2026.json', 'utf-8'));

const POS_FR = {
    'Goalkeeper': 'Gardien',
    'Defender':   'Défenseur',
    'Midfielder': 'Milieu',
    'Attacker':   'Attaquant',
};

const PAYS_FR = {
    'Afghanistan': 'Afghanistan', 'Albania': 'Albanie', 'Algeria': 'Algérie', 'Andorra': 'Andorre', 'Angola': 'Angola',
    'Argentina': 'Argentine', 'Armenia': 'Arménie', 'Australia': 'Australie', 'Austria': 'Autriche', 'Azerbaijan': 'Azerbaïdjan',
    'Bahamas': 'Bahamas', 'Bahrain': 'Bahreïn', 'Bangladesh': 'Bangladesh', 'Barbados': 'Barbade', 'Belarus': 'Biélorussie',
    'Belgium': 'Belgique', 'Belize': 'Bélize', 'Benin': 'Bénin', 'Bermuda': 'Bermudes', 'Bhutan': 'Bhoutan',
    'Bolivia': 'Bolivie', 'Bosnia and Herzegovina': 'Bosnie-Herzégovine', 'Botswana': 'Botswana', 'Brazil': 'Brésil', 'Brunei': 'Brunei',
    'Bulgaria': 'Bulgarie', 'Burkina Faso': 'Burkina Faso', 'Burundi': 'Burundi', 'Cambodia': 'Cambodge', 'Cameroon': 'Cameroun',
    'Canada': 'Canada', 'Cape Verde': 'Cap-Vert', 'Central African Republic': 'République Centrafricaine', 'Chad': 'Tchad', 'Chile': 'Chili',
    'China': 'Chine', 'Colombia': 'Colombie', 'Comoros': 'Comores', 'Congo': 'Congo', 'Costa Rica': 'Costa Rica',
    'Croatia': 'Croatie', 'Cuba': 'Cuba', 'Cyprus': 'Chypre', 'Czech Republic': 'Tchéquie', 'Czechia': 'Tchéquie',
    'Denmark': 'Danemark', 'Djibouti': 'Djibouti', 'Dominica': 'Dominique', 'Dominican Republic': 'République Dominicaine',
    'Ecuador': 'Équateur', 'Egypt': 'Égypte', 'El Salvador': 'El Salvador', 'England': 'Angleterre', 'Equatorial Guinea': 'Guinée Équatoriale',
    'Eritrea': 'Érythrée', 'Estonia': 'Estonie', 'Eswatini': 'Eswatini', 'Ethiopia': 'Éthiopie',
    'Fiji': 'Fidji', 'Finland': 'Finlande', 'France': 'France',
    'Gabon': 'Gabon', 'Gambia': 'Gambie', 'Georgia': 'Géorgie', 'Germany': 'Allemagne', 'Ghana': 'Ghana',
    'Gibraltar': 'Gibraltar', 'Greece': 'Grèce', 'Grenada': 'Grenade', 'Guadeloupe': 'Guadeloupe', 'Guam': 'Guam',
    'Guatemala': 'Guatemala', 'Guernsey': 'Guernesey', 'Guinea': 'Guinée', 'Guinea-Bissau': 'Guinée-Bissau', 'Guyana': 'Guyana',
    'Haiti': 'Haïti', 'Honduras': 'Honduras', 'Hong Kong': 'Hong Kong', 'Hungary': 'Hongrie',
    'Iceland': 'Islande', 'India': 'Inde', 'Indonesia': 'Indonésie', 'Iran': 'Iran', 'Iraq': 'Irak',
    'Ireland': 'Irlande', 'Israel': 'Israël', 'Italy': 'Italie', 'Ivory Coast': 'Côte d\'Ivoire',
    'Jamaica': 'Jamaïque', 'Japan': 'Japon', 'Jersey': 'Jersey', 'Jordan': 'Jordanie',
    'Kazakhstan': 'Kazakhstan', 'Kenya': 'Kenya', 'Korea Republic': 'Corée du Sud', 'South Korea': 'Corée du Sud', 'Kosovo': 'Kosovo', 'Kuwait': 'Koweït', 'Kyrgyzstan': 'Kirghizistan',
    'Laos': 'Laos', 'Latvia': 'Lettonie', 'Lebanon': 'Liban', 'Lesotho': 'Lesotho', 'Liberia': 'Liberia', 'Libya': 'Libye',
    'Liechtenstein': 'Liechtenstein', 'Lithuania': 'Lituanie', 'Luxembourg': 'Luxembourg',
    'Macao': 'Macao', 'Madagascar': 'Madagascar', 'Malawi': 'Malawi', 'Malaysia': 'Malaisie', 'Maldives': 'Maldives',
    'Mali': 'Mali', 'Malta': 'Malte', 'Mauritania': 'Mauritanie', 'Mauritius': 'Maurice', 'Mexico': 'Mexique',
    'Moldova': 'Moldavie', 'Monaco': 'Monaco', 'Mongolia': 'Mongolie', 'Montenegro': 'Monténégro', 'Morocco': 'Maroc', 'Mozambique': 'Mozambique', 'Myanmar': 'Birmanie',
    'Namibia': 'Namibie', 'Nepal': 'Népal', 'Netherlands': 'Pays-Bas', 'New Zealand': 'Nouvelle-Zélande', 'Nicaragua': 'Nicaragua',
    'Niger': 'Niger', 'Nigeria': 'Nigéria', 'North Macedonia': 'Macédoine du Nord', 'Northern Ireland': 'Irlande du Nord', 'Norway': 'Norvège',
    'Oman': 'Oman', 'Pakistan': 'Pakistan', 'Palestine': 'Palestine', 'Panama': 'Panama', 'Papua New Guinea': 'Papouasie-Nouvelle-Guinée',
    'Paraguay': 'Paraguay', 'Peru': 'Pérou', 'Philippines': 'Philippines', 'Poland': 'Pologne', 'Portugal': 'Portugal',
    'Qatar': 'Qatar', 'Romania': 'Roumanie', 'Russia': 'Russie', 'Rwanda': 'Rwanda',
    'Saint Kitts and Nevis': 'Saint-Christophe-et-Niévès', 'Saint Lucia': 'Sainte-Lucie', 'Saint Vincent and the Grenadines': 'Saint-Vincent-et-les-Grenadines',
    'Samoa': 'Samoa', 'San Marino': 'Saint-Marin', 'Sao Tome and Principe': 'Sao Tomé-et-Principe', 'Saudi Arabia': 'Arabie Saoudite',
    'Scotland': 'Écosse', 'Senegal': 'Sénégal', 'Serbia': 'Serbie', 'Seychelles': 'Seychelles', 'Sierra Leone': 'Sierra Leone',
    'Singapore': 'Singapour', 'Slovakia': 'Slovaquie', 'Slovenia': 'Slovénie', 'Solomon Islands': 'Îles Salomon', 'Somalia': 'Somalie',
    'South Africa': 'Afrique du Sud', 'South Korea': 'Corée du Sud', 'Spain': 'Espagne', 'Sri Lanka': 'Sri Lanka', 'Sudan': 'Soudan', 'Suriname': 'Suriname', 'Sweden': 'Suède', 'Switzerland': 'Suisse', 'Syria': 'Syrie',
    'Taiwan': 'Taïwan', 'Tajikistan': 'Tadjikistan', 'Tanzania': 'Tanzanie', 'Thailand': 'Thaïlande', 'Timor-Leste': 'Timor Oriental', 'Togo': 'Togo',
    'Tonga': 'Tonga', 'Trinidad and Tobago': 'Trinité-et-Tobago', 'Tunisia': 'Tunisie', 'Turkey': 'Turquie', 'Turkmenistan': 'Turkménistan', 'Turks and Caicos Islands': 'Îles Turques-et-Caïques',
    'Tuvalu': 'Tuvalu', 'Uganda': 'Ouganda', 'Ukraine': 'Ukraine', 'United Arab Emirates': 'Émirats Arabes Unis', 'United States': 'États-Unis', 'Uruguay': 'Uruguay', 'Uzbekistan': 'Ouzbékistan',
    'Vanuatu': 'Vanuatu', 'Venezuela': 'Venezuela', 'Vietnam': 'Viêt Nam', 'Wales': 'Pays de Galles', 'Yemen': 'Yémen', 'Zambia': 'Zambie', 'Zimbabwe': 'Zimbabwe',
};

// ── Normaliser chaque joueur avec des noms de champs rétrocompatibles ────────

const DB = raw.map(p => {
    const clubs_historique = [...new Set(
        (p.career_history || []).map(e => e.club_name).filter(Boolean)
    )];

    return {
        // Identité
        name:                    p.name,
        firstname:               p.firstname,
        lastname:                p.lastname,
        age:                     p.age,
        birth_date:              p.birth_date,
        birth_country:           p.birth_country,
        height:                  p.height,

        // Sélection (noms rétrocompatibles)
        nationality_selection:   p.national_team_name,
        national_confederation:  p.national_confederation,
        caps:                    p.national_caps,
        goals_selection:         p.national_goals,
        jersey_number:           p.jersey_number_national,

        // Club actuel (noms rétrocompatibles)
        club_current:            p.current_club_name,
        league_current:          p.current_club_league_name,

        // Position en français (rétrocompatible)
        position:                POS_FR[p.position] || p.position,

        // Carrière (rétrocompatible + enrichi)
        clubs_historique,
        career_history:          p.career_history || [],
        total_career_club_goals: p.total_career_club_goals,
        shared_dressing_rooms:   p.shared_dressing_rooms || [],
    };
});

// ── Comptages ────────────────────────────────────────────────────────────────

function compter(fn) {
    const counts = {};
    for (const j of DB) {
        const val = fn(j);
        if (val) counts[val] = (counts[val] || 0) + 1;
    }
    return counts;
}

const clubCounts       = compter(j => j.club_current);
const ligueCounts      = compter(j => j.league_current);
const paysCounts       = compter(j => j.nationality_selection);
const naissanceCounts  = compter(j => j.birth_country);

const ancienClubCounts = {};
for (const j of DB) {
    for (const c of (j.clubs_historique || [])) {
        ancienClubCounts[c] = (ancienClubCounts[c] || 0) + 1;
    }
}

// ── Seuils ───────────────────────────────────────────────────────────────────

const MIN_CLUB      = 4;   // ≥4 WC players currently at this club
const MIN_ANCIEN    = 8;   // ≥8 WC players ever played here
const MIN_LIGUE     = 8;   // ≥8 WC players currently in this league
const MIN_PAYS      = 10;  // ≥10 WC players represent this country
const MIN_NAISSANCE = 15;  // ≥15 WC players born in this country

// ── Pools (valeurs brutes, triées par fréquence décroissante) ────────────────

const CLUBS = Object.entries(clubCounts)
    .filter(([, n]) => n >= MIN_CLUB)
    .sort((a, b) => b[1] - a[1])
    .map(([c, n]) => ({ label: `${c} (${n})`, value: c }));

const ANCIENS_CLUBS = Object.entries(ancienClubCounts)
    .filter(([c, n]) => n >= MIN_ANCIEN && !clubCounts[c])
    .sort((a, b) => b[1] - a[1])
    .map(([c, n]) => ({ label: `Ex-${c} (${n})`, value: `Ex-${c}` }));

const CHAMPIONNATS = Object.entries(ligueCounts)
    .filter(([, n]) => n >= MIN_LIGUE)
    .sort((a, b) => b[1] - a[1])
    .map(([c, n]) => ({ label: `${c} (${n})`, value: c }));

const SELECTIONS = Object.entries(paysCounts)
    .filter(([, n]) => n >= MIN_PAYS)
    .sort((a, b) => b[1] - a[1])
    .map(([c, n]) => {
        const label_fr = PAYS_FR[c] || c;  // Utiliser la traduction ou le nom original
        return { label: `${label_fr} (${n})`, value: label_fr };
    });

const NAISSANCES = Object.entries(naissanceCounts)
    .filter(([, n]) => n >= MIN_NAISSANCE)
    .sort((a, b) => b[1] - a[1])
    .map(([c, n]) => {
        const label_fr = PAYS_FR[c] || c;
        return { label: `Né en ${label_fr} (${n})`, value: `Né en ${label_fr}` };
    });

const POSTES = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant']
    .map(p => ({ label: p, value: p }));

// ── Contraintes lettres (première lettre de n'importe quel mot du nom) ────────

function nameLetters(name) {
    // Retourne l'ensemble des premières lettres de chaque mot (prénom, nom, etc.)
    return new Set(
        name.normalize('NFD').replace(/[̀-ͯ]/g, '')
            .split(' ').filter(Boolean)
            .map(w => w[0]?.toUpperCase())
            .filter(l => l && /[A-Z]/.test(l))
    );
}

const letterCounts = {};
for (const j of DB) {
    for (const l of nameLetters(j.name)) {
        letterCounts[l] = (letterCounts[l] || 0) + 1;
    }
}

const MIN_LETTRE = 15;
const LETTRES = Object.entries(letterCounts)
    .filter(([, n]) => n >= MIN_LETTRE)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([l, n]) => ({ label: `Lettre ${l} (${n})`, value: `Lettre ${l}` }));

// ── Contraintes stats ─────────────────────────────────────────────────────────

const STATS_DEFS = [
    { value: '50+ sélections',      fn: j => (j.caps || 0) >= 50 },
    { value: '100+ sélections',     fn: j => (j.caps || 0) >= 100 },
    { value: '10+ buts sélection',  fn: j => (j.goals_selection || 0) >= 10 },
    { value: '30+ buts sélection',  fn: j => (j.goals_selection || 0) >= 30 },
    { value: 'Moins de 23 ans',     fn: j => j.age !== null && j.age < 23 },
    { value: '30 ans ou plus',      fn: j => j.age !== null && j.age >= 30 },
];

const MIN_STATS = 15;
const STATS = STATS_DEFS
    .map(s => ({ ...s, count: DB.filter(s.fn).length }))
    .filter(s => s.count >= MIN_STATS)
    .map(s => ({ label: `${s.value} (${s.count})`, value: s.value }));

// ── Valeurs pures ─────────────────────────────────────────────────────────────

const CLUBS_V         = CLUBS.map(c => c.value);
const ANCIENS_CLUBS_V = ANCIENS_CLUBS.map(c => c.value);
const CHAMPIONNATS_V  = CHAMPIONNATS.map(c => c.value);
const SELECTIONS_V    = SELECTIONS.map(c => c.value);
const NAISSANCES_V    = NAISSANCES.map(c => c.value);
const POSTES_V        = POSTES.map(p => p.value);
const LETTRES_V       = LETTRES.map(l => l.value);
const STATS_V         = STATS.map(s => s.value);

const LIGNES_POOL   = [...CLUBS_V, ...ANCIENS_CLUBS_V, ...CHAMPIONNATS_V];
const COLONNES_POOL = [...SELECTIONS_V, ...POSTES_V, ...NAISSANCES_V, ...LETTRES_V, ...STATS_V];

// ── Résumé console ───────────────────────────────────────────────────────────

console.log(`✅ Joueurs : ${DB.length}`);
console.log(`   Clubs actuels  : ${CLUBS.length}  (seuil ≥${MIN_CLUB})`);
console.log(`   Anciens clubs  : ${ANCIENS_CLUBS.length}  (seuil ≥${MIN_ANCIEN})`);
console.log(`   Championnats   : ${CHAMPIONNATS.length}  (seuil ≥${MIN_LIGUE})`);
console.log(`   Sélections     : ${SELECTIONS.length}  (seuil ≥${MIN_PAYS})`);
console.log(`   Pays naissance : ${NAISSANCES.length}  (seuil ≥${MIN_NAISSANCE})`);
console.log(`   Lettres        : ${LETTRES.length}  (seuil ≥${MIN_LETTRE})`);
console.log(`   Stats          : ${STATS.length}`);
console.log(`   Total colonnes : ${COLONNES_POOL.length}`);

// ── DB light (champs utiles au jeu seulement) ─────────────────────────────────

const DB_LIGHT = DB.map(p => ({
    name:                  p.name,
    birth_country:         PAYS_FR[p.birth_country] || p.birth_country,
    nationality_selection: PAYS_FR[p.nationality_selection] || p.nationality_selection,
    club_current:          p.club_current,
    league_current:        p.league_current,
    position:              p.position,
    caps:                  p.caps,
    goals_selection:       p.goals_selection,
    age:                   p.age,
    clubs_historique:      p.clubs_historique,
}));

// ── Générer data_browser.js ──────────────────────────────────────────────────

const contenu = `// data_browser.js — généré automatiquement le ${new Date().toLocaleDateString('fr-FR')}
// Source : players_wc2026.json
// Ne pas modifier manuellement — relancer : node generer_browser_db.js

const PLAYERS_DB = ${JSON.stringify(DB_LIGHT)};

// Pools de contraintes — format { label, value }
const CLUBS         = ${JSON.stringify(CLUBS)};
const ANCIENS_CLUBS = ${JSON.stringify(ANCIENS_CLUBS)};
const CHAMPIONNATS  = ${JSON.stringify(CHAMPIONNATS)};
const SELECTIONS    = ${JSON.stringify(SELECTIONS)};
const NAISSANCES    = ${JSON.stringify(NAISSANCES)};
const POSTES        = ${JSON.stringify(POSTES)};
const LETTRES       = ${JSON.stringify(LETTRES)};
const STATS         = ${JSON.stringify(STATS)};

// Valeurs pures
const CLUBS_V         = CLUBS.map(c => c.value);
const ANCIENS_CLUBS_V = ANCIENS_CLUBS.map(c => c.value);
const CHAMPIONNATS_V  = CHAMPIONNATS.map(c => c.value);
const SELECTIONS_V    = SELECTIONS.map(c => c.value);
const NAISSANCES_V    = NAISSANCES.map(c => c.value);
const POSTES_V        = POSTES.map(p => p.value);
const LETTRES_V       = LETTRES.map(l => l.value);
const STATS_V         = STATS.map(s => s.value);

const LIGNES_POOL   = [...CLUBS_V, ...ANCIENS_CLUBS_V, ...CHAMPIONNATS_V];
const COLONNES_POOL = [...SELECTIONS_V, ...POSTES_V, ...NAISSANCES_V, ...LETTRES_V, ...STATS_V];

function _nameLetters(name) {
    return name.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '')
        .split(' ').filter(Boolean).map(w => w[0]?.toUpperCase()).filter(Boolean);
}

function matchesContrainte(j, c) {
    if (!c) return false;
    if (c.includes(' OU '))      return c.split(' OU ').some(p => matchesContrainte(j, p.trim()));
    if (c.startsWith('Ex-'))     return Array.isArray(j.clubs_historique) && j.clubs_historique.includes(c.slice(3));
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
`;

fs.writeFileSync('./data_browser.js', contenu);
console.log(`\n💾 data_browser.js écrit (${(contenu.length / 1024).toFixed(0)} KB)`);
console.log(`\n➡️  Lance "node generer_contraintes.js" pour régénérer le générateur.`);
