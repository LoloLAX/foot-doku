const axios = require('axios');
const fs = require('fs');

const API_KEY = "223af69ca549b973abeda4233429cc74";
const BASE_URL = "https://v3.football.api-sports.io";
const DELAY_MS = 6500; // ~10 req/min max sur forfait gratuit

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function apiCall(endpoint, params) {
    return axios.get(`${BASE_URL}${endpoint}`, {
        params,
        headers: { 'x-apisports-key': API_KEY }
    });
}

function traduirePoste(position) {
    const map = {
        "Goalkeeper": "Gardien",
        "Defender": "Défenseur",
        "Midfielder": "Milieu",
        "Attacker": "Attaquant"
    };
    return map[position] || "Milieu";
}

// Ligues domestiques principales (pour filtrer les stats club)
const LIGUES_CLUB = [
    "La Liga", "Premier League", "Bundesliga", "Serie A", "Ligue 1",
    "Liga Portugal", "Eredivisie", "Pro League", "Super Lig",
    "Saudi Pro League", "MLS", "Liga MX", "Serie B", "Championship",
    "Liga Profesional", "Brasileirao", "Liga 1", "Super League",
    "Primeira Liga", "Scottish Premiership", "Ukrainian Premier League",
    "Russian Premier League", "Süper Lig"
];

function extraireStatClub(statistics, nationalTeamId) {
    // Priorité 1 : stat d'une ligue domestique connue
    const statLigueConnue = statistics.find(s =>
        s.team.id !== nationalTeamId && LIGUES_CLUB.includes(s.league.name)
    );
    if (statLigueConnue) return statLigueConnue;

    // Priorité 2 : n'importe quelle stat hors sélection nationale
    return statistics.find(s => s.team.id !== nationalTeamId && s.team.national !== true) || null;
}

// ─── PHASE 1 : collecte des joueurs par sélection nationale ───────────────────

const EQUIPES_CDM_2026 = [
    { id: 1,    name: "Belgium" },
    { id: 2,    name: "France" },
    { id: 3,    name: "Croatia" },
    { id: 5,    name: "Sweden" },
    { id: 6,    name: "Brazil" },
    { id: 7,    name: "Uruguay" },
    { id: 8,    name: "Colombia" },
    { id: 9,    name: "Spain" },
    { id: 10,   name: "England" },
    { id: 11,   name: "Panama" },
    { id: 12,   name: "Japan" },
    { id: 13,   name: "Senegal" },
    { id: 15,   name: "Switzerland" },
    { id: 16,   name: "Mexico" },
    { id: 17,   name: "South Korea" },
    { id: 20,   name: "Australia" },
    { id: 22,   name: "Iran" },
    { id: 23,   name: "Saudi Arabia" },
    { id: 25,   name: "Germany" },
    { id: 26,   name: "Argentina" },
    { id: 27,   name: "Portugal" },
    { id: 28,   name: "Tunisia" },
    { id: 31,   name: "Morocco" },
    { id: 32,   name: "Egypt" },
    { id: 770,  name: "Czech Republic" },
    { id: 775,  name: "Austria" },
    { id: 777,  name: "Türkiye" },
    { id: 1090, name: "Norway" },
    { id: 1108, name: "Scotland" },
    { id: 1113, name: "Bosnia & Herzegovina" },
    { id: 1118, name: "Netherlands" },
    { id: 1501, name: "Ivory Coast" },
    { id: 1504, name: "Ghana" },
    { id: 1508, name: "Congo DR" },
    { id: 1531, name: "South Africa" },
    { id: 1532, name: "Algeria" },
    { id: 1533, name: "Cape Verde" },
    { id: 1548, name: "Jordan" },
    { id: 1567, name: "Iraq" },
    { id: 1568, name: "Uzbekistan" },
    { id: 1569, name: "Qatar" },
    { id: 2380, name: "Paraguay" },
    { id: 2382, name: "Ecuador" },
    { id: 2384, name: "USA" },
    { id: 2386, name: "Haiti" },
    { id: 4673, name: "New Zealand" },
    { id: 5529, name: "Canada" },
    { id: 5530, name: "Curaçao" },
];

async function phase1() {
    console.log("🌍 Phase 1 — Collecte des joueurs des 48 sélections (season=2024)\n");

    let tous = [];
    let appels = 0;

    for (const equipe of EQUIPES_CDM_2026) {
        process.stdout.write(`  ${equipe.name.padEnd(28)}`);
        await sleep(DELAY_MS);

        const res = await apiCall("/players", { team: equipe.id, season: 2024 });
        const data = res.data.response || [];
        appels++;

        const joueurs = data
            .filter(item => {
                const statSel = item.statistics.find(s => s.team.id === equipe.id);
                return statSel && statSel.games.appearences >= 1;
            })
            .map(item => {
                const statSel = item.statistics.find(s => s.team.id === equipe.id);
                return {
                    id: "api-" + item.player.id,
                    name: item.player.name,
                    age: item.player.age,
                    nationality_birth: item.player.birth?.country || null,
                    nationality_selection: equipe.name,
                    naturalized: (item.player.birth?.country || "") !== (item.player.nationality || ""),
                    position: traduirePoste(statSel.games.position),
                    // Club : à enrichir en Phase 2
                    club_current: null,
                    league_current: null,
                    // Stats sélection 2024
                    caps_2024: statSel.games.appearences,
                    goals_selection_2024: statSel.goals.total || 0,
                    assists_selection_2024: statSel.goals.assists || 0,
                };
            });

        tous = tous.concat(joueurs);
        console.log(`${joueurs.length} joueurs | appels: ${appels}/100`);
    }

    // Dédoublonnage
    const seen = new Set();
    const deduped = tous.filter(j => {
        if (seen.has(j.id)) return false;
        seen.add(j.id);
        return true;
    });

    const contenu = `// Phase 1 — CdM 2026 — ${deduped.length} joueurs (club à enrichir)
// Généré le : ${new Date().toLocaleDateString('fr-FR')}

const PLAYERS_DB = ${JSON.stringify(deduped, null, 2)};

module.exports = PLAYERS_DB;
`;
    fs.writeFileSync('./database_api.js', contenu);
    console.log(`\n✅ ${deduped.length} joueurs sauvegardés dans database_api.js`);
    console.log(`📊 Appels utilisés : ${appels}/100`);
    console.log(`\n➡️  Lance "node aspirateur.js --phase=2" demain pour enrichir les infos club.`);
}

const DB_SCRAPE = './database_scrape.js';

function sauvegarder(PLAYERS_DB) {
    const total = PLAYERS_DB.filter(j => j.club_current).length;
    const contenu = `// Effectifs CdM 2026 — source : roadtowc.com + enrichissement API
// Mis à jour le : ${new Date().toLocaleDateString('fr-FR')}
// Joueurs avec club : ${total}/${PLAYERS_DB.length}

const PLAYERS_DB = ${JSON.stringify(PLAYERS_DB, null, 2)};

module.exports = PLAYERS_DB;
`;
    fs.writeFileSync(DB_SCRAPE, contenu);
}

// Recherche un joueur par nom dans l'API, retourne la donnée enrichie ou null
async function rechercherJoueur(joueur) {
    // Prénom abrégé pour améliorer les résultats (ex: "Kylian Mbappé" → "Mbappé")
    const nomRecherche = joueur.name.split(' ').slice(-1)[0];
    const res = await apiCall("/players", { search: nomRecherche, season: 2024 });
    const resultats = res.data.response;
    if (!resultats || resultats.length === 0) return null;

    // Trouve le meilleur match : même nationalité ou nom proche
    const match = resultats.find(r =>
        r.player.nationality === joueur.nationality_selection ||
        r.player.name.toLowerCase().includes(nomRecherche.toLowerCase())
    ) || resultats[0];

    return match;
}

// ─── PHASE 2 : enrichissement club par recherche nom ─────────────────────────

async function phase2() {
    console.log("🏟️  Phase 2 — Enrichissement club depuis database_scrape.js\n");

    if (!fs.existsSync(DB_SCRAPE)) {
        console.error("❌ database_scrape.js introuvable — lance d'abord node scraper.js.");
        process.exit(1);
    }

    delete require.cache[require.resolve(DB_SCRAPE)];
    const PLAYERS_DB = require(DB_SCRAPE);

    // Priorité aux joueurs sans club ET sans id
    const aEnrichir = PLAYERS_DB.filter(j => j.club_current === null);
    const dejaFait  = PLAYERS_DB.filter(j => j.club_current !== null).length;

    console.log(`Total joueurs    : ${PLAYERS_DB.length}`);
    console.log(`Déjà enrichis    : ${dejaFait}`);
    console.log(`Restant          : ${aEnrichir.length}`);
    console.log(`Ce run (max ~90) : ${Math.min(aEnrichir.length, 90)}\n`);

    let appels = 0;
    let enrichis = 0;

    for (const joueur of aEnrichir) {
        if (appels >= 90) {
            console.log(`\n⏸️  Quota atteint (90 appels). Relance demain.`);
            break;
        }

        await sleep(DELAY_MS);
        appels++;

        const data = await rechercherJoueur(joueur);

        if (data && data.statistics && data.statistics.length > 0) {
            // Injecte l'ID API dans la DB
            if (!joueur.id) joueur.id = "api-" + data.player.id;
            // Enrichit âge et naissance si absent
            if (!joueur.age) joueur.age = data.player.age;
            if (!joueur.nationality_birth) joueur.nationality_birth = data.player.birth?.country || null;
            if (joueur.naturalized === null || joueur.naturalized === undefined) {
                joueur.naturalized = (data.player.birth?.country || "") !== (data.player.nationality || "");
            }

            const nationalTeamId = EQUIPES_CDM_2026.find(e => e.name === joueur.nationality_selection)?.id;
            const statClub = extraireStatClub(data.statistics, nationalTeamId);

            if (statClub) {
                joueur.club_current   = statClub.team.name;
                joueur.league_current = statClub.league.name;
                // Ajoute aussi les stats club
                joueur.club_goals_2024   = statClub.goals.total || 0;
                joueur.club_assists_2024 = statClub.goals.assists || 0;
                joueur.club_apps_2024    = statClub.games.appearences || 0;
                enrichis++;
                process.stdout.write(`✅ `);
            } else {
                process.stdout.write(`⬜ `);
            }
        } else {
            process.stdout.write(`❓ `);
        }

        // Sauvegarde intermédiaire toutes les 10 enrichissements
        if (appels % 10 === 0) {
            sauvegarder(PLAYERS_DB);
            process.stdout.write(`[${appels} — sauvegardé]\n`);
        }
    }

    sauvegarder(PLAYERS_DB);

    const total = PLAYERS_DB.filter(j => j.club_current).length;
    const pct   = Math.round(total / PLAYERS_DB.length * 100);
    console.log(`\n\n✅ ${enrichis} joueurs enrichis ce run`);
    console.log(`📊 Couverture club : ${total}/${PLAYERS_DB.length} (${pct}%)`);
    if (total < PLAYERS_DB.length) {
        console.log(`➡️  Relance "node aspirateur.js --phase=2" demain pour continuer.`);
    }
}

// ─── POINT D'ENTRÉE ───────────────────────────────────────────────────────────

const phase = process.argv[2];
if (phase === '--phase=2') {
    phase2().catch(err => {
        console.error("❌", err.response?.data || err.message);
        process.exit(1);
    });
} else {
    phase1().catch(err => {
        console.error("❌", err.response?.data || err.message);
        process.exit(1);
    });
}
