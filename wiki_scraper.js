// wiki_scraper.js — Enrichissement depuis Wikipedia
// Récupère club, caps, buts, âge, position pour chaque joueur
// Usage : node wiki_scraper.js
// Dépendances : npm install axios cheerio (déjà installés)

const axios   = require('axios');
const cheerio = require('cheerio');
const fs      = require('fs');

const DB_PATH = './database_scrape.js';
const DELAY_MS = 2000; // Wikipedia est tolérant, 2s suffisent

const sleep = ms => new Promise(r => setTimeout(r, ms));

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
};

// URLs Wikipedia par sélection
const WIKI_URLS = {
    "Argentina":            "Argentina_national_football_team",
    "Brazil":               "Brazil_national_football_team",
    "Colombia":             "Colombia_national_football_team",
    "Uruguay":              "Uruguay_national_football_team",
    "Paraguay":             "Paraguay_national_football_team",
    "Ecuador":              "Ecuador_national_football_team",
    "Mexico":               "Mexico_national_football_team",
    "USA":                  "United_States_men%27s_national_soccer_team",
    "Canada":               "Canada_men%27s_national_soccer_team",
    "Panama":               "Panama_national_football_team",
    "Haiti":                "Haiti_national_football_team",
    "Curaçao":              "Cura%C3%A7ao_national_football_team",
    "France":               "France_national_football_team",
    "Germany":              "Germany_national_football_team",
    "Spain":                "Spain_national_football_team",
    "England":              "England_national_football_team",
    "Portugal":             "Portugal_national_football_team",
    "Netherlands":          "Netherlands_national_football_team",
    "Belgium":              "Belgium_national_football_team",
    "Croatia":              "Croatia_national_football_team",
    "Switzerland":          "Switzerland_national_football_team",
    "Austria":              "Austria_national_football_team",
    "Norway":               "Norway_national_football_team",
    "Scotland":             "Scotland_national_football_team",
    "Sweden":               "Sweden_men%27s_national_football_team",
    "Czech Republic":       "Czech_Republic_national_football_team",
    "Bosnia & Herzegovina": "Bosnia_and_Herzegovina_national_football_team",
    "Japan":                "Japan_national_football_team",
    "South Korea":          "South_Korea_national_football_team",
    "Australia":            "Australia_men%27s_national_soccer_team",
    "Iran":                 "Iran_national_football_team",
    "Iraq":                 "Iraq_national_football_team",
    "Jordan":               "Jordan_national_football_team",
    "Saudi Arabia":         "Saudi_Arabia_national_football_team",
    "Qatar":                "Qatar_national_football_team",
    "Uzbekistan":           "Uzbekistan_national_football_team",
    "Morocco":              "Morocco_national_football_team",
    "Senegal":              "Senegal_national_football_team",
    "Ivory Coast":          "Ivory_Coast_national_football_team",
    "Tunisia":              "Tunisia_national_football_team",
    "Egypt":                "Egypt_national_football_team",
    "South Africa":         "South_Africa_national_football_team",
    "Algeria":              "Algeria_national_football_team",
    "Ghana":                "Ghana_national_football_team",
    "Congo DR":             "DR_Congo_national_football_team",
    "Cape Verde":           "Cape_Verde_national_football_team",
    "New Zealand":          "New_Zealand_national_football_team",  // essai 1
    // backup: "New_Zealand_men%27s_national_football_team"
    "Türkiye":              "Turkey_national_football_team",
};

const POS_MAP = { GK: "Gardien", DF: "Défenseur", MF: "Milieu", FW: "Attaquant" };

// Normalise un nom pour la comparaison (minuscules, sans accents, sans annotations)
function normaliser(nom) {
    return nom
        .toLowerCase()
        .replace(/\s*\(.*?\)/g, '')           // retire (captain), (age 30), etc.
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ýÿ]/g, 'y')
        .replace(/[ñ]/g, 'n')
        .replace(/[ç]/g, 'c')
        .replace(/[ž]/g, 'z')
        .replace(/[š]/g, 's')
        .replace(/[đ]/g, 'd')
        .replace(/ø/g, 'o')
        .replace(/æ/g, 'ae')
        .replace(/[^a-z\s'-]/g, '')
        .trim();
}

// Score de similarité entre deux noms normalisés
function scoreSimilarite(a, b) {
    if (a === b) return 1;
    const motsA = a.split(/\s+/);
    const motsB = b.split(/\s+/);
    // Vérifie si le nom de famille (dernier mot) correspond
    if (motsA[motsA.length - 1] === motsB[motsB.length - 1]) return 0.8;
    // Vérifie si un mot entier est commun
    const communs = motsA.filter(m => motsB.includes(m) && m.length > 2);
    if (communs.length > 0) return 0.5;
    return 0;
}

// Extrait la table de squad depuis le HTML Wikipedia
function extraireSquad($) {
    const joueurs = [];

    $('table.wikitable').each((_, table) => {
        const headers = [];
        $(table).find('tr').first().find('th').each((_, th) => {
            headers.push($(th).text().trim().toLowerCase());
        });

        // On cherche la table avec les colonnes caps + goals + club
        if (!headers.includes('caps') || !headers.includes('club')) return;

        const idxPos    = headers.indexOf('pos.');
        const idxPlayer = headers.indexOf('player');
        const idxDob    = headers.indexOf('date of birth (age)');
        const idxCaps   = headers.indexOf('caps');
        const idxGoals  = headers.indexOf('goals');
        const idxClub   = headers.indexOf('club');

        $(table).find('tr').each((i, row) => {
            if (i === 0) return; // skip header
            // Wikipedia met les noms de joueurs dans <th scope="row">, pas <td>
            const cells = $(row).find('td, th');
            if (cells.length < 5) return;

            // Wikipedia met souvent "No." en <th>, pas en <td>
            // → les indices td sont décalés de (nbHeaders - nbCells)
            const offset = Math.max(0, headers.length - cells.length);

            // Fonction pour extraire le texte d'une cellule en supprimant les spans cachés
            const texte = (idx) => {
                const realIdx = idx - offset;
                if (realIdx < 0 || realIdx >= cells.length) return '';
                const cell = $(cells[realIdx]).clone();
                // Supprime les spans de tri (display:none ou class sortkey)
                cell.find('span[style*="display:none"], span.sortkey').remove();
                return cell.text().trim();
            };

            const pos    = texte(idxPos);
            const player = texte(idxPlayer);
            const dob    = texte(idxDob);
            const caps   = parseInt(texte(idxCaps)) || 0;
            const goals  = parseInt(texte(idxGoals)) || 0;
            const club   = texte(idxClub);

            if (!player || !club) return;

            const ageMatch = dob.match(/age\s+(\d+)/);
            const age = ageMatch ? parseInt(ageMatch[1]) : null;

            joueurs.push({
                nom:      player.replace(/\s*\(.*?\)/g, '').trim(),
                position: POS_MAP[pos] || pos,
                age,
                caps,
                goals_selection: goals,
                club,
            });
        });
    });

    return joueurs;
}

async function fetchSquadWiki(selection, slug) {
    const url = `https://en.wikipedia.org/wiki/${slug}`;
    try {
        const res = await axios.get(url, { headers: HEADERS, timeout: 15000 });
        const $   = cheerio.load(res.data);
        const squad = extraireSquad($);
        return squad;
    } catch (err) {
        console.log(`  ⚠️  Erreur fetch ${selection} : ${err.message}`);
        return [];
    }
}

// Cherche le joueur correspondant dans la DB par comparaison de noms
function trouverJoueur(db, nomWiki, selection) {
    const normWiki = normaliser(nomWiki);

    // Cherche d'abord dans la bonne sélection
    const candidats = db.filter(j => j.nationality_selection === selection);

    let meilleur = null;
    let meilleurScore = 0;

    for (const joueur of candidats) {
        const score = scoreSimilarite(normaliser(joueur.name), normWiki);
        if (score > meilleurScore) {
            meilleurScore = score;
            meilleur = joueur;
        }
    }

    return meilleurScore >= 0.5 ? meilleur : null;
}

async function main() {
    console.log("📖 Wiki Scraper — Enrichissement CdM 2026\n");

    // Charge la DB
    delete require.cache[require.resolve(DB_PATH)];
    const PLAYERS_DB = require(DB_PATH);

    let enrichis = 0;
    let nonTrouves = 0;
    let erreurs = 0;

    const selections = Object.keys(WIKI_URLS);
    console.log(`${selections.length} sélections à traiter\n`);

    for (const selection of selections) {
        const slug = WIKI_URLS[selection];
        process.stdout.write(`  ${selection.padEnd(28)}`);

        const squad = await fetchSquadWiki(selection, slug);
        await sleep(DELAY_MS);

        if (squad.length === 0) {
            console.log(`❌ Aucun joueur`);
            erreurs++;
            continue;
        }

        let matchesSelection = 0;
        let ajoutsSelection  = 0;

        // Joueurs déjà présents dans la DB pour cette sélection
        const dejaDansDB = new Set(
            PLAYERS_DB
                .filter(j => j.nationality_selection === selection)
                .map(j => normaliser(j.name))
        );

        for (const wikiJoueur of squad) {
            const joueurDB = trouverJoueur(PLAYERS_DB, wikiJoueur.nom, selection);

            if (joueurDB) {
                // Enrichit l'entrée existante
                joueurDB.club_current    = wikiJoueur.club;
                joueurDB.age             = joueurDB.age || wikiJoueur.age;
                joueurDB.caps            = wikiJoueur.caps;
                joueurDB.goals_selection = wikiJoueur.goals_selection;
                matchesSelection++;
                enrichis++;
            } else {
                // Joueur absent de la DB → on l'ajoute si son nom semble valide
                const nomNorm = normaliser(wikiJoueur.nom);
                if (nomNorm.length > 3 && !dejaDansDB.has(nomNorm)) {
                    PLAYERS_DB.push({
                        id:                     null,
                        name:                   wikiJoueur.nom,
                        age:                    wikiJoueur.age,
                        nationality_birth:      null,
                        nationality_selection:  selection,
                        naturalized:            null,
                        position:               wikiJoueur.position,
                        club_current:           wikiJoueur.club,
                        league_current:         null,
                        caps:                   wikiJoueur.caps,
                        goals_selection:        wikiJoueur.goals_selection,
                    });
                    dejaDansDB.add(nomNorm);
                    ajoutsSelection++;
                    enrichis++;
                } else {
                    nonTrouves++;
                }
            }
        }

        console.log(`${squad.length} wiki → ${matchesSelection} matchés, ${ajoutsSelection} ajoutés`);
    }

    // Sauvegarde
    const avecClub = PLAYERS_DB.filter(j => j.club_current).length;
    const contenu = `// Effectifs CdM 2026 — enrichi via Wikipedia
// Mis à jour le : ${new Date().toLocaleDateString('fr-FR')}
// Joueurs avec club : ${avecClub}/${PLAYERS_DB.length}

const PLAYERS_DB = ${JSON.stringify(PLAYERS_DB, null, 2)};

module.exports = PLAYERS_DB;
`;
    fs.writeFileSync(DB_PATH, contenu);

    console.log(`\n✅ ${enrichis} enrichissements`);
    console.log(`⬜ ${nonTrouves} joueurs Wikipedia non matchés dans la DB`);
    if (erreurs > 0) console.log(`❌ ${erreurs} pages en erreur`);
    console.log(`📊 Couverture club : ${avecClub}/${PLAYERS_DB.length} (${Math.round(avecClub/PLAYERS_DB.length*100)}%)`);
    console.log(`\n💾 Sauvegardé dans ${DB_PATH}`);
}

main().catch(err => {
    console.error("❌ Erreur fatale :", err.message);
    process.exit(1);
});
