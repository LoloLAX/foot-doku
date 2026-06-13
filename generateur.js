// generateur.js — généré automatiquement le 13/06/2026
// Source : players_wc2026.json via generer_contraintes.js
// Usage : node generateur.js [--all]

const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('./players_wc2026.json', 'utf-8'));

const POS_FR = { Goalkeeper: 'Gardien', Defender: 'Défenseur', Midfielder: 'Milieu', Attacker: 'Attaquant' };
const PAYS_FR = {"Afghanistan":"Afghanistan","Albania":"Albanie","Algeria":"Algérie","Andorra":"Andorre","Angola":"Angola","Argentina":"Argentine","Armenia":"Arménie","Australia":"Australie","Austria":"Autriche","Azerbaijan":"Azerbaïdjan","Bahamas":"Bahamas","Bahrain":"Bahreïn","Bangladesh":"Bangladesh","Barbados":"Barbade","Belarus":"Biélorussie","Belgium":"Belgique","Belize":"Bélize","Benin":"Bénin","Bermuda":"Bermudes","Bhutan":"Bhoutan","Bolivia":"Bolivie","Bosnia and Herzegovina":"Bosnie-Herzégovine","Botswana":"Botswana","Brazil":"Brésil","Brunei":"Brunei","Bulgaria":"Bulgarie","Burkina Faso":"Burkina Faso","Burundi":"Burundi","Cambodia":"Cambodge","Cameroon":"Cameroun","Canada":"Canada","Cape Verde":"Cap-Vert","Central African Republic":"République Centrafricaine","Chad":"Tchad","Chile":"Chili","China":"Chine","Colombia":"Colombie","Comoros":"Comores","Congo":"Congo","Costa Rica":"Costa Rica","Croatia":"Croatie","Cuba":"Cuba","Cyprus":"Chypre","Czech Republic":"Tchéquie","Czechia":"Tchéquie","Denmark":"Danemark","Djibouti":"Djibouti","Dominica":"Dominique","Dominican Republic":"République Dominicaine","Ecuador":"Équateur","Egypt":"Égypte","El Salvador":"El Salvador","England":"Angleterre","Equatorial Guinea":"Guinée Équatoriale","Eritrea":"Érythrée","Estonia":"Estonie","Eswatini":"Eswatini","Ethiopia":"Éthiopie","Fiji":"Fidji","Finland":"Finlande","France":"France","Gabon":"Gabon","Gambia":"Gambie","Georgia":"Géorgie","Germany":"Allemagne","Ghana":"Ghana","Gibraltar":"Gibraltar","Greece":"Grèce","Grenada":"Grenade","Guadeloupe":"Guadeloupe","Guam":"Guam","Guatemala":"Guatemala","Guernsey":"Guernesey","Guinea":"Guinée","Guinea-Bissau":"Guinée-Bissau","Guyana":"Guyana","Haiti":"Haïti","Honduras":"Honduras","Hong Kong":"Hong Kong","Hungary":"Hongrie","Iceland":"Islande","India":"Inde","Indonesia":"Indonésie","Iran":"Iran","Iraq":"Irak","Ireland":"Irlande","Israel":"Israël","Italy":"Italie","Ivory Coast":"Côte d'Ivoire","Jamaica":"Jamaïque","Japan":"Japon","Jersey":"Jersey","Jordan":"Jordanie","Kazakhstan":"Kazakhstan","Kenya":"Kenya","Korea Republic":"Corée du Sud","South Korea":"Corée du Sud","Kosovo":"Kosovo","Kuwait":"Koweït","Kyrgyzstan":"Kirghizistan","Laos":"Laos","Latvia":"Lettonie","Lebanon":"Liban","Lesotho":"Lesotho","Liberia":"Liberia","Libya":"Libye","Liechtenstein":"Liechtenstein","Lithuania":"Lituanie","Luxembourg":"Luxembourg","Macao":"Macao","Madagascar":"Madagascar","Malawi":"Malawi","Malaysia":"Malaisie","Maldives":"Maldives","Mali":"Mali","Malta":"Malte","Mauritania":"Mauritanie","Mauritius":"Maurice","Mexico":"Mexique","Moldova":"Moldavie","Monaco":"Monaco","Mongolia":"Mongolie","Montenegro":"Monténégro","Morocco":"Maroc","Mozambique":"Mozambique","Myanmar":"Birmanie","Namibia":"Namibie","Nepal":"Népal","Netherlands":"Pays-Bas","New Zealand":"Nouvelle-Zélande","Nicaragua":"Nicaragua","Niger":"Niger","Nigeria":"Nigéria","North Macedonia":"Macédoine du Nord","Northern Ireland":"Irlande du Nord","Norway":"Norvège","Oman":"Oman","Pakistan":"Pakistan","Palestine":"Palestine","Panama":"Panama","Papua New Guinea":"Papouasie-Nouvelle-Guinée","Paraguay":"Paraguay","Peru":"Pérou","Philippines":"Philippines","Poland":"Pologne","Portugal":"Portugal","Qatar":"Qatar","Romania":"Roumanie","Russia":"Russie","Rwanda":"Rwanda","Saint Kitts and Nevis":"Saint-Christophe-et-Niévès","Saint Lucia":"Sainte-Lucie","Saint Vincent and the Grenadines":"Saint-Vincent-et-les-Grenadines","Samoa":"Samoa","San Marino":"Saint-Marin","Sao Tome and Principe":"Sao Tomé-et-Principe","Saudi Arabia":"Arabie Saoudite","Scotland":"Écosse","Senegal":"Sénégal","Serbia":"Serbie","Seychelles":"Seychelles","Sierra Leone":"Sierra Leone","Singapore":"Singapour","Slovakia":"Slovaquie","Slovenia":"Slovénie","Solomon Islands":"Îles Salomon","Somalia":"Somalie","South Africa":"Afrique du Sud","Spain":"Espagne","Sri Lanka":"Sri Lanka","Sudan":"Soudan","Suriname":"Suriname","Sweden":"Suède","Switzerland":"Suisse","Syria":"Syrie","Taiwan":"Taïwan","Tajikistan":"Tadjikistan","Tanzania":"Tanzanie","Thailand":"Thaïlande","Timor-Leste":"Timor Oriental","Togo":"Togo","Tonga":"Tonga","Trinidad and Tobago":"Trinité-et-Tobago","Tunisia":"Tunisie","Turkey":"Turquie","Turkmenistan":"Turkménistan","Turks and Caicos Islands":"Îles Turques-et-Caïques","Tuvalu":"Tuvalu","Uganda":"Ouganda","Ukraine":"Ukraine","United Arab Emirates":"Émirats Arabes Unis","United States":"États-Unis","Uruguay":"Uruguay","Uzbekistan":"Ouzbékistan","Vanuatu":"Vanuatu","Venezuela":"Venezuela","Vietnam":"Viêt Nam","Wales":"Pays de Galles","Yemen":"Yémen","Zambia":"Zambie","Zimbabwe":"Zimbabwe"};
const PLAYERS_DB = raw.map(p => ({
    name:                  p.name,
    birth_country:         PAYS_FR[p.birth_country] || p.birth_country,
    nationality_selection: PAYS_FR[p.national_team_name] || p.national_team_name,
    club_current:          p.current_club_name,
    league_current:        p.current_club_league_name,
    position:              POS_FR[p.position] || p.position,
    caps:                  p.national_caps,
    clubs_historique: [...new Set((p.career_history || []).map(e => e.club_name).filter(Boolean))],
}));

const CLUBS         = ["Manchester City","Al Ahly","Bayern Munich","Paris Saint-Germain","Arsenal","Barcelona","Atlético Madrid","Manchester United","Al-Hilal","Crystal Palace","Borussia Dortmund","Galatasaray","PSV Eindhoven","Slavia Prague","Fenerbahçe","Milan","Sunderland","Liverpool","Real Madrid","Flamengo","Aston Villa","Al-Nassr","TSG Hoffenheim","Mamelodi Sundowns","Orlando Pirates","Celtic","Atalanta","Benfica","VfB Stuttgart","Villarreal","Nice","Eintracht Frankfurt","Newcastle United","Lille","Brighton & Hove Albion","Chelsea","Tottenham Hotspur","Bayer Leverkusen","Viktoria Plzeň","Al-Duhail","Inter Milan","Strasbourg","Palmeiras","Sporting CP","Al-Hussein","Wolverhampton Wanderers","Real Betis","Fulham","Al-Qadsiah","Mainz 05","Borussia Mönchengladbach","Young Boys","Juventus","Monaco","Bournemouth","Esteghlal","RB Leipzig","Persepolis","Lyon","Guadalajara","Burnley","Feyenoord","Rangers","Norwich City","Al-Sadd","Bologna","Nottingham Forest","Roma","Marseille","Club Brugge","River Plate","İstanbul Başakşehir","Real Sociedad","VfL Wolfsburg","Pyramids","Tractor","Auckland FC","West Ham United","Braga","América","Midtjylland","Los Angeles FC","Beşiktaş","FC St. Pauli","Sassuolo","Al-Rayyan","Al-Wakrah","Rennes","SC Freiburg","Leeds United","FC Augsburg","Al-Ittihad","Brentford","Auxerre","Genk","Napoli","Everton","Atlético Mineiro","Ajax","Athletic Bilbao","Pakhtakor","Al-Zawraa","Al-Karma"];
const ANCIENS_CLUBS = ["Ex-PSV","Ex-AC Milan","Ex-Jong PSV","Ex-Jong Ajax","Ex-Benfica B","Ex-Basel","Ex-Bayern Munich II","Ex-Groningen","Ex-Betis","Ex-Wellington Phoenix Reserves","Ex-Hertha BSC","Ex-Real Madrid B","Ex-SuperSport United","Ex-FC Liefering","Ex-Metz","Ex-Sporting CP B","Ex-Reading","Ex-Porto B","Ex-Almería","Ex-Schalke 04 II","Ex-Al-Jazeera","Ex-Bunyodkor","Ex-Al Hilal","Ex-Vitesse","Ex-Peñarol","Ex-Heerenveen"];
const CHAMPIONNATS  = ["Premier League","Bundesliga","Ligue 1","La Liga","Serie A","Championship","Saudi Pro League","MLS","Süper Lig","Primeira Liga","Série A","Eredivisie","First Division A","Qatar Stars League","Liga MX","Primera División","Persian Gulf Pro League","Czech First League","Scottish Premiership","Premier Soccer League","Egyptian Premier League","UAE Pro League","Iraq Stars League","Uzbekistan Super League","A-League Men","Superliga","Super League Greece","Russian Premier League","2. Bundesliga","Super League","First Division","Ligue Professionnelle 1","Jordan Premier League","Serie B","Segunda División","Eerste Divisie","K League 1","Austrian Football Bundesliga","Ligue 2"];
const SELECTIONS    = ["Tchéquie","Mexique","Afrique du Sud","Corée du Sud","Bosnie-Herzégovine","Canada","Qatar","Suisse","Brésil","Haïti","Maroc","Écosse","Australie","Paraguay","Turquie","États-Unis","Curaçao","Équateur","Allemagne","Côte d'Ivoire","Japon","Pays-Bas","Suède","Tunisie","Belgique","Égypte","Iran","Nouvelle-Zélande","Cap-Vert","Arabie Saoudite","Espagne","Uruguay","France","Irak","Norvège","Sénégal","Algérie","Argentine","Autriche","Jordanie","Colombie","DR Congo","Portugal","Ouzbékistan","Croatie","Angleterre","Ghana","Panama"];
const NAISSANCES    = ["Né en France","Né en Pays-Bas","Né en Angleterre","Né en Allemagne","Né en Espagne","Né en Belgique","Né en Suède","Né en Autriche","Né en Argentine","Né en Suisse","Né en Brésil","Né en Portugal","Né en Colombie","Né en Arabie Saoudite","Né en Panama","Né en Afrique du Sud","Né en Corée du Sud","Né en Uruguay","Né en Ouzbékistan","Né en Japon","Né en Norvège","Né en Égypte","Né en Iran","Né en Tchéquie","Né en Canada","Né en Équateur","Né en Jordanie","Né en Mexique","Né en Écosse","Né en Paraguay","Né en Ghana","Né en Australie","Né en Côte d'Ivoire","Né en Nouvelle-Zélande","Né en Irak","Né en U.S.","Né en Sénégal","Né en Turquie"];
const LETTRES       = ["Lettre A","Lettre B","Lettre C","Lettre D","Lettre E","Lettre F","Lettre G","Lettre H","Lettre I","Lettre J","Lettre K","Lettre L","Lettre M","Lettre N","Lettre O","Lettre P","Lettre Q","Lettre R","Lettre S","Lettre T","Lettre U","Lettre V","Lettre W","Lettre X","Lettre Y","Lettre Z"];
const STATS         = ["50+ sélections","100+ sélections","10+ buts sélection","30+ buts sélection","Moins de 23 ans","30 ans ou plus"];
const POSTES        = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant'];

const LIGNES_POOL   = [...CLUBS, ...ANCIENS_CLUBS, ...CHAMPIONNATS];
const COLONNES_POOL = [...SELECTIONS, ...POSTES, ...NAISSANCES, ...LETTRES, ...STATS];

function _nameLetters(name) { return name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().split('').filter(l => /[A-Z]/.test(l)); }

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

    console.log('\n=== GRILLE (parmi ' + resultats.length + ' candidates) ===');
    console.log('              | ' + best.colonnes.map(c => c.slice(0,16).padEnd(16)).join(' | ') + ' |');
    console.log('-'.repeat(74));
    best.lignes.forEach(l => {
        const sols = best.colonnes.map(c => nbSolutions(l, c));
        console.log(l.slice(0,14).padEnd(14) + ' | ' + sols.map(n => String(n).padEnd(16)).join(' | ') + ' |');
    });
    console.log('Solutions min=' + best.minSol + ' max=' + best.maxSol);

    const grille = { lignes: best.lignes, colonnes: best.colonnes, publieLe: best.publieLe };
    console.log('\n--- Coller dans la console admin ---');
    console.log("localStorage.setItem('footdoku_grille', " + JSON.stringify(JSON.stringify(grille)) + ")");
    return grille;
}

genererGrilleParfaite();
