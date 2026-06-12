// wiki_scraper_wc2026.js — Scrape WC2026 squads + player infoboxes
// Usage: node wiki_scraper_wc2026.js
// Résumable: cache disque par URL, progress.json pour reprise

const axios   = require('axios');
const cheerio = require('cheerio');
const fs      = require('fs');
const path    = require('path');
const crypto  = require('crypto');

const SQUADS_URL    = 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_squads';
const OUT_FILE      = './players_wc2026.json';
const CACHE_DIR     = './cache_wiki';
const PROGRESS_FILE = './wc2026_progress.json';
const DELAY_MS      = 1000;

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; FootDoku/1.0; educational)',
    'Accept-Language': 'en-US,en;q=0.9',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Cache disque ──────────────────────────────────────────────────────────────

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);

function cacheKey(url) {
    return path.join(CACHE_DIR, crypto.createHash('md5').update(url).digest('hex') + '.html');
}

async function fetchCached(url) {
    const key = cacheKey(url);
    if (fs.existsSync(key)) return fs.readFileSync(key, 'utf-8');
    await sleep(DELAY_MS);
    const res = await axios.get(url, { headers: HEADERS, timeout: 20000 });
    fs.writeFileSync(key, res.data);
    return res.data;
}

// ── CLUBS_LEAGUES dictionary ──────────────────────────────────────────────────

const CLUBS_LEAGUES = {
    // Premier League
    "Arsenal":                  { l: "Premier League",        c: "England" },
    "Aston Villa":              { l: "Premier League",        c: "England" },
    "Bournemouth":              { l: "Premier League",        c: "England" },
    "Brentford":                { l: "Premier League",        c: "England" },
    "Brighton":                 { l: "Premier League",        c: "England" },
    "Brighton & Hove Albion":   { l: "Premier League",        c: "England" },
    "Chelsea":                  { l: "Premier League",        c: "England" },
    "Crystal Palace":           { l: "Premier League",        c: "England" },
    "Everton":                  { l: "Premier League",        c: "England" },
    "Fulham":                   { l: "Premier League",        c: "England" },
    "Ipswich Town":             { l: "Premier League",        c: "England" },
    "Leeds United":             { l: "Championship",          c: "England" },
    "Leicester City":           { l: "Championship",          c: "England" },
    "Liverpool":                { l: "Premier League",        c: "England" },
    "Manchester City":          { l: "Premier League",        c: "England" },
    "Manchester United":        { l: "Premier League",        c: "England" },
    "Newcastle United":         { l: "Premier League",        c: "England" },
    "Nottingham Forest":        { l: "Premier League",        c: "England" },
    "Southampton":              { l: "Championship",          c: "England" },
    "Tottenham Hotspur":        { l: "Premier League",        c: "England" },
    "Tottenham":                { l: "Premier League",        c: "England" },
    "West Ham United":          { l: "Premier League",        c: "England" },
    "West Ham":                 { l: "Premier League",        c: "England" },
    "Wolverhampton Wanderers":  { l: "Premier League",        c: "England" },
    "Wolves":                   { l: "Premier League",        c: "England" },
    "Sunderland":               { l: "Championship",          c: "England" },
    "Stoke City":               { l: "Championship",          c: "England" },
    "Burnley":                  { l: "Championship",          c: "England" },
    "Middlesbrough":            { l: "Championship",          c: "England" },
    "Norwich City":             { l: "Championship",          c: "England" },
    // La Liga
    "Athletic Bilbao":          { l: "La Liga",               c: "Spain" },
    "Athletic Club":            { l: "La Liga",               c: "Spain" },
    "Atlético de Madrid":       { l: "La Liga",               c: "Spain" },
    "Atletico Madrid":          { l: "La Liga",               c: "Spain" },
    "Atlético Madrid":          { l: "La Liga",               c: "Spain" },
    "Barcelona":                { l: "La Liga",               c: "Spain" },
    "Real Betis":               { l: "La Liga",               c: "Spain" },
    "Betis":                    { l: "La Liga",               c: "Spain" },
    "Celta Vigo":               { l: "La Liga",               c: "Spain" },
    "Girona":                   { l: "La Liga",               c: "Spain" },
    "Getafe":                   { l: "La Liga",               c: "Spain" },
    "Las Palmas":               { l: "La Liga",               c: "Spain" },
    "Osasuna":                  { l: "La Liga",               c: "Spain" },
    "Mallorca":                 { l: "La Liga",               c: "Spain" },
    "Rayo Vallecano":           { l: "La Liga",               c: "Spain" },
    "Real Madrid":              { l: "La Liga",               c: "Spain" },
    "Real Sociedad":            { l: "La Liga",               c: "Spain" },
    "Sevilla":                  { l: "La Liga",               c: "Spain" },
    "Valencia":                 { l: "La Liga",               c: "Spain" },
    "Villarreal":               { l: "La Liga",               c: "Spain" },
    "Deportivo Alavés":         { l: "La Liga",               c: "Spain" },
    "Alavés":                   { l: "La Liga",               c: "Spain" },
    "Espanyol":                 { l: "La Liga",               c: "Spain" },
    "Leganés":                  { l: "La Liga",               c: "Spain" },
    "Real Valladolid":          { l: "Segunda División",      c: "Spain" },
    // Bundesliga
    "Bayer Leverkusen":         { l: "Bundesliga",            c: "Germany" },
    "Bayern Munich":            { l: "Bundesliga",            c: "Germany" },
    "Borussia Dortmund":        { l: "Bundesliga",            c: "Germany" },
    "Borussia Mönchengladbach": { l: "Bundesliga",            c: "Germany" },
    "Eintracht Frankfurt":      { l: "Bundesliga",            c: "Germany" },
    "Frankfurt":                { l: "Bundesliga",            c: "Germany" },
    "SC Freiburg":              { l: "Bundesliga",            c: "Germany" },
    "Freiburg":                 { l: "Bundesliga",            c: "Germany" },
    "TSG Hoffenheim":           { l: "Bundesliga",            c: "Germany" },
    "Hoffenheim":               { l: "Bundesliga",            c: "Germany" },
    "Mainz 05":                 { l: "Bundesliga",            c: "Germany" },
    "Mainz":                    { l: "Bundesliga",            c: "Germany" },
    "RB Leipzig":               { l: "Bundesliga",            c: "Germany" },
    "Schalke 04":               { l: "Bundesliga",            c: "Germany" },
    "VfB Stuttgart":            { l: "Bundesliga",            c: "Germany" },
    "Stuttgart":                { l: "Bundesliga",            c: "Germany" },
    "Union Berlin":             { l: "Bundesliga",            c: "Germany" },
    "VfL Wolfsburg":            { l: "Bundesliga",            c: "Germany" },
    "Wolfsburg":                { l: "Bundesliga",            c: "Germany" },
    "Werder Bremen":            { l: "Bundesliga",            c: "Germany" },
    "FC Augsburg":              { l: "Bundesliga",            c: "Germany" },
    "Augsburg":                 { l: "Bundesliga",            c: "Germany" },
    "1. FC Heidenheim":         { l: "Bundesliga",            c: "Germany" },
    "Heidenheim":               { l: "Bundesliga",            c: "Germany" },
    "Hamburger SV":             { l: "2. Bundesliga",         c: "Germany" },
    "Hamburg":                  { l: "2. Bundesliga",         c: "Germany" },
    "1. FC Köln":               { l: "2. Bundesliga",         c: "Germany" },
    "Kaiserslautern":           { l: "2. Bundesliga",         c: "Germany" },
    // Serie A
    "AC Milan":                 { l: "Serie A",               c: "Italy" },
    "Milan":                    { l: "Serie A",               c: "Italy" },
    "AS Roma":                  { l: "Serie A",               c: "Italy" },
    "Roma":                     { l: "Serie A",               c: "Italy" },
    "Atalanta":                 { l: "Serie A",               c: "Italy" },
    "Bologna":                  { l: "Serie A",               c: "Italy" },
    "Cagliari":                 { l: "Serie A",               c: "Italy" },
    "Como":                     { l: "Serie A",               c: "Italy" },
    "Empoli":                   { l: "Serie A",               c: "Italy" },
    "Fiorentina":               { l: "Serie A",               c: "Italy" },
    "Genoa":                    { l: "Serie A",               c: "Italy" },
    "Hellas Verona":            { l: "Serie A",               c: "Italy" },
    "Inter Milan":              { l: "Serie A",               c: "Italy" },
    "Internazionale":           { l: "Serie A",               c: "Italy" },
    "Juventus":                 { l: "Serie A",               c: "Italy" },
    "Lazio":                    { l: "Serie A",               c: "Italy" },
    "Lecce":                    { l: "Serie A",               c: "Italy" },
    "Monza":                    { l: "Serie A",               c: "Italy" },
    "Napoli":                   { l: "Serie A",               c: "Italy" },
    "Parma":                    { l: "Serie A",               c: "Italy" },
    "Torino":                   { l: "Serie A",               c: "Italy" },
    "Udinese":                  { l: "Serie A",               c: "Italy" },
    "Venezia":                  { l: "Serie A",               c: "Italy" },
    "Sassuolo":                 { l: "Serie B",               c: "Italy" },
    "Salernitana":              { l: "Serie B",               c: "Italy" },
    // Ligue 1
    "Brest":                    { l: "Ligue 1",               c: "France" },
    "Guingamp":                 { l: "Ligue 1",               c: "France" },
    "Le Havre":                 { l: "Ligue 1",               c: "France" },
    "RC Lens":                  { l: "Ligue 1",               c: "France" },
    "Lens":                     { l: "Ligue 1",               c: "France" },
    "LOSC Lille":               { l: "Ligue 1",               c: "France" },
    "Lille":                    { l: "Ligue 1",               c: "France" },
    "Lorient":                  { l: "Ligue 1",               c: "France" },
    "Olympique Lyonnais":       { l: "Ligue 1",               c: "France" },
    "Lyon":                     { l: "Ligue 1",               c: "France" },
    "Olympique de Marseille":   { l: "Ligue 1",               c: "France" },
    "Marseille":                { l: "Ligue 1",               c: "France" },
    "Metz":                     { l: "Ligue 1",               c: "France" },
    "AS Monaco":                { l: "Ligue 1",               c: "France" },
    "Monaco":                   { l: "Ligue 1",               c: "France" },
    "Montpellier":              { l: "Ligue 1",               c: "France" },
    "Nantes":                   { l: "Ligue 1",               c: "France" },
    "OGC Nice":                 { l: "Ligue 1",               c: "France" },
    "Nice":                     { l: "Ligue 1",               c: "France" },
    "Paris Saint-Germain":      { l: "Ligue 1",               c: "France" },
    "PSG":                      { l: "Ligue 1",               c: "France" },
    "Stade Rennais":            { l: "Ligue 1",               c: "France" },
    "Rennes":                   { l: "Ligue 1",               c: "France" },
    "Strasbourg":               { l: "Ligue 1",               c: "France" },
    "Toulouse":                 { l: "Ligue 1",               c: "France" },
    "Clermont Foot":            { l: "Ligue 2",               c: "France" },
    "Sochaux":                  { l: "Ligue 2",               c: "France" },
    // Eredivisie
    "AFC Ajax":                 { l: "Eredivisie",            c: "Netherlands" },
    "Ajax":                     { l: "Eredivisie",            c: "Netherlands" },
    "AZ Alkmaar":               { l: "Eredivisie",            c: "Netherlands" },
    "AZ":                       { l: "Eredivisie",            c: "Netherlands" },
    "Feyenoord":                { l: "Eredivisie",            c: "Netherlands" },
    "PSV Eindhoven":            { l: "Eredivisie",            c: "Netherlands" },
    "PSV":                      { l: "Eredivisie",            c: "Netherlands" },
    "FC Twente":                { l: "Eredivisie",            c: "Netherlands" },
    "FC Utrecht":               { l: "Eredivisie",            c: "Netherlands" },
    "Vitesse":                  { l: "Eredivisie",            c: "Netherlands" },
    "Go Ahead Eagles":          { l: "Eredivisie",            c: "Netherlands" },
    // Primeira Liga
    "SL Benfica":               { l: "Primeira Liga",         c: "Portugal" },
    "Benfica":                  { l: "Primeira Liga",         c: "Portugal" },
    "SC Braga":                 { l: "Primeira Liga",         c: "Portugal" },
    "Braga":                    { l: "Primeira Liga",         c: "Portugal" },
    "FC Porto":                 { l: "Primeira Liga",         c: "Portugal" },
    "Porto":                    { l: "Primeira Liga",         c: "Portugal" },
    "Sporting CP":              { l: "Primeira Liga",         c: "Portugal" },
    "Sporting":                 { l: "Primeira Liga",         c: "Portugal" },
    // Belgian Pro League
    "RSC Anderlecht":           { l: "First Division A",      c: "Belgium" },
    "Anderlecht":               { l: "First Division A",      c: "Belgium" },
    "Club Brugge":              { l: "First Division A",      c: "Belgium" },
    "Genk":                     { l: "First Division A",      c: "Belgium" },
    "Gent":                     { l: "First Division A",      c: "Belgium" },
    "Standard Liège":           { l: "First Division A",      c: "Belgium" },
    // Scottish Premiership
    "Celtic":                   { l: "Scottish Premiership",  c: "Scotland" },
    "Rangers":                  { l: "Scottish Premiership",  c: "Scotland" },
    "Hearts":                   { l: "Scottish Premiership",  c: "Scotland" },
    "Hibernian":                { l: "Scottish Premiership",  c: "Scotland" },
    // Swiss Super League
    "BSC Young Boys":           { l: "Super League",          c: "Switzerland" },
    "Young Boys":               { l: "Super League",          c: "Switzerland" },
    "FC Basel":                 { l: "Super League",          c: "Switzerland" },
    "Basel":                    { l: "Super League",          c: "Switzerland" },
    "FC Zurich":                { l: "Super League",          c: "Switzerland" },
    "Grasshopper":              { l: "Super League",          c: "Switzerland" },
    // Austrian Bundesliga
    "FC Red Bull Salzburg":     { l: "Austrian Football Bundesliga", c: "Austria" },
    "Red Bull Salzburg":        { l: "Austrian Football Bundesliga", c: "Austria" },
    "RB Salzburg":              { l: "Austrian Football Bundesliga", c: "Austria" },
    "SK Rapid":                 { l: "Austrian Football Bundesliga", c: "Austria" },
    "Rapid Vienna":             { l: "Austrian Football Bundesliga", c: "Austria" },
    "Austria Vienna":           { l: "Austrian Football Bundesliga", c: "Austria" },
    "LASK":                     { l: "Austrian Football Bundesliga", c: "Austria" },
    "Sturm Graz":               { l: "Austrian Football Bundesliga", c: "Austria" },
    "Wolfsberger AC":           { l: "Austrian Football Bundesliga", c: "Austria" },
    // Süper Lig
    "Beşiktaş":                 { l: "Süper Lig",             c: "Turkey" },
    "Besiktas":                 { l: "Süper Lig",             c: "Turkey" },
    "Fenerbahçe":               { l: "Süper Lig",             c: "Turkey" },
    "Fenerbahce":               { l: "Süper Lig",             c: "Turkey" },
    "Galatasaray":              { l: "Süper Lig",             c: "Turkey" },
    "Trabzonspor":              { l: "Süper Lig",             c: "Turkey" },
    "İstanbul Başakşehir":      { l: "Süper Lig",             c: "Turkey" },
    "Başakşehir":               { l: "Süper Lig",             c: "Turkey" },
    "Trabzonspor":              { l: "Süper Lig",             c: "Turkey" },
    // Greek Super League
    "Olympiacos":               { l: "Super League Greece",   c: "Greece" },
    "Panathinaikos":            { l: "Super League Greece",   c: "Greece" },
    "PAOK":                     { l: "Super League Greece",   c: "Greece" },
    "AEK Athens":               { l: "Super League Greece",   c: "Greece" },
    // Ukrainian
    "Dynamo Kyiv":              { l: "Ukrainian Premier League", c: "Ukraine" },
    "Shakhtar Donetsk":         { l: "Ukrainian Premier League", c: "Ukraine" },
    "Shakhtar":                 { l: "Ukrainian Premier League", c: "Ukraine" },
    // Saudi Pro League
    "Al-Ahli":                  { l: "Saudi Pro League",      c: "Saudi Arabia" },
    "Al-Hilal":                 { l: "Saudi Pro League",      c: "Saudi Arabia" },
    "Al-Ittihad":               { l: "Saudi Pro League",      c: "Saudi Arabia" },
    "Al-Nassr":                 { l: "Saudi Pro League",      c: "Saudi Arabia" },
    "Al-Qadsiah":               { l: "Saudi Pro League",      c: "Saudi Arabia" },
    "Al-Shabab":                { l: "Saudi Pro League",      c: "Saudi Arabia" },
    "Al-Fayha":                 { l: "Saudi Pro League",      c: "Saudi Arabia" },
    "Al-Ettifaq":               { l: "Saudi Pro League",      c: "Saudi Arabia" },
    "Al-Wehda":                 { l: "Saudi Pro League",      c: "Saudi Arabia" },
    "Al-Raed":                  { l: "Saudi Pro League",      c: "Saudi Arabia" },
    "Damac FC":                 { l: "Saudi Pro League",      c: "Saudi Arabia" },
    // UAE
    "Al Ain":                   { l: "UAE Pro League",        c: "UAE" },
    "Al-Jazira":                { l: "UAE Pro League",        c: "UAE" },
    "Al Wasl":                  { l: "UAE Pro League",        c: "UAE" },
    // MLS
    "Atlanta United":           { l: "MLS",                   c: "USA" },
    "Austin FC":                { l: "MLS",                   c: "USA" },
    "Charlotte FC":             { l: "MLS",                   c: "USA" },
    "Chicago Fire":             { l: "MLS",                   c: "USA" },
    "FC Cincinnati":            { l: "MLS",                   c: "USA" },
    "Colorado Rapids":          { l: "MLS",                   c: "USA" },
    "Columbus Crew":            { l: "MLS",                   c: "USA" },
    "D.C. United":              { l: "MLS",                   c: "USA" },
    "FC Dallas":                { l: "MLS",                   c: "USA" },
    "Houston Dynamo":           { l: "MLS",                   c: "USA" },
    "Inter Miami":              { l: "MLS",                   c: "USA" },
    "LA Galaxy":                { l: "MLS",                   c: "USA" },
    "LAFC":                     { l: "MLS",                   c: "USA" },
    "Los Angeles FC":           { l: "MLS",                   c: "USA" },
    "Minnesota United":         { l: "MLS",                   c: "USA" },
    "CF Montréal":              { l: "MLS",                   c: "USA" },
    "New England Revolution":   { l: "MLS",                   c: "USA" },
    "New York City FC":         { l: "MLS",                   c: "USA" },
    "New York Red Bulls":       { l: "MLS",                   c: "USA" },
    "Orlando City":             { l: "MLS",                   c: "USA" },
    "Philadelphia Union":       { l: "MLS",                   c: "USA" },
    "Portland Timbers":         { l: "MLS",                   c: "USA" },
    "Real Salt Lake":           { l: "MLS",                   c: "USA" },
    "San Jose Earthquakes":     { l: "MLS",                   c: "USA" },
    "Seattle Sounders":         { l: "MLS",                   c: "USA" },
    "Sporting Kansas City":     { l: "MLS",                   c: "USA" },
    "St. Louis City":           { l: "MLS",                   c: "USA" },
    "Toronto FC":               { l: "MLS",                   c: "USA" },
    "Vancouver Whitecaps":      { l: "MLS",                   c: "USA" },
    "San Diego FC":             { l: "MLS",                   c: "USA" },
    // Liga MX
    "Club América":             { l: "Liga MX",               c: "Mexico" },
    "América":                  { l: "Liga MX",               c: "Mexico" },
    "CF Monterrey":             { l: "Liga MX",               c: "Mexico" },
    "Monterrey":                { l: "Liga MX",               c: "Mexico" },
    "Club Guadalajara":         { l: "Liga MX",               c: "Mexico" },
    "Guadalajara":              { l: "Liga MX",               c: "Mexico" },
    "Chivas":                   { l: "Liga MX",               c: "Mexico" },
    "Cruz Azul":                { l: "Liga MX",               c: "Mexico" },
    "Necaxa":                   { l: "Liga MX",               c: "Mexico" },
    "Pumas UNAM":               { l: "Liga MX",               c: "Mexico" },
    "Santos Laguna":            { l: "Liga MX",               c: "Mexico" },
    "Tigres UANL":              { l: "Liga MX",               c: "Mexico" },
    "Tigres":                   { l: "Liga MX",               c: "Mexico" },
    "Club Tijuana":             { l: "Liga MX",               c: "Mexico" },
    "Tijuana":                  { l: "Liga MX",               c: "Mexico" },
    "Toluca":                   { l: "Liga MX",               c: "Mexico" },
    "Atlas":                    { l: "Liga MX",               c: "Mexico" },
    "León":                     { l: "Liga MX",               c: "Mexico" },
    "Juárez":                   { l: "Liga MX",               c: "Mexico" },
    "Pachuca":                  { l: "Liga MX",               c: "Mexico" },
    "Puebla":                   { l: "Liga MX",               c: "Mexico" },
    "Querétaro":                { l: "Liga MX",               c: "Mexico" },
    "Mazatlán":                 { l: "Liga MX",               c: "Mexico" },
    // Argentine Primera
    "Boca Juniors":             { l: "Primera División",      c: "Argentina" },
    "River Plate":              { l: "Primera División",      c: "Argentina" },
    "Estudiantes":              { l: "Primera División",      c: "Argentina" },
    "Independiente":            { l: "Primera División",      c: "Argentina" },
    "Racing Club":              { l: "Primera División",      c: "Argentina" },
    "San Lorenzo":              { l: "Primera División",      c: "Argentina" },
    "Vélez Sársfield":          { l: "Primera División",      c: "Argentina" },
    "Talleres":                 { l: "Primera División",      c: "Argentina" },
    "Huracán":                  { l: "Primera División",      c: "Argentina" },
    "Lanús":                    { l: "Primera División",      c: "Argentina" },
    // Brazilian Série A
    "Atlético Mineiro":         { l: "Série A",               c: "Brazil" },
    "Cruzeiro":                 { l: "Série A",               c: "Brazil" },
    "Flamengo":                 { l: "Série A",               c: "Brazil" },
    "Fluminense":               { l: "Série A",               c: "Brazil" },
    "Grêmio":                   { l: "Série A",               c: "Brazil" },
    "Internacional":            { l: "Série A",               c: "Brazil" },
    "Palmeiras":                { l: "Série A",               c: "Brazil" },
    "Santos":                   { l: "Série A",               c: "Brazil" },
    "São Paulo":                { l: "Série A",               c: "Brazil" },
    "Vasco da Gama":            { l: "Série A",               c: "Brazil" },
    "Botafogo":                 { l: "Série A",               c: "Brazil" },
    "Corinthians":              { l: "Série A",               c: "Brazil" },
    "Athletico Paranaense":     { l: "Série A",               c: "Brazil" },
    "Atlético-GO":              { l: "Série A",               c: "Brazil" },
    "Bahia":                    { l: "Série A",               c: "Brazil" },
    "Fortaleza":                { l: "Série A",               c: "Brazil" },
    // Colombia
    "Atlético Nacional":        { l: "Categoría Primera A",   c: "Colombia" },
    "Millonarios":              { l: "Categoría Primera A",   c: "Colombia" },
    "Deportivo Cali":           { l: "Categoría Primera A",   c: "Colombia" },
    "Junior":                   { l: "Categoría Primera A",   c: "Colombia" },
    "Santa Fe":                 { l: "Categoría Primera A",   c: "Colombia" },
    // Uruguay
    "Nacional":                 { l: "Primera División",      c: "Uruguay" },
    "Peñarol":                  { l: "Primera División",      c: "Uruguay" },
    // Ecuador
    "Barcelona SC":             { l: "Serie A",               c: "Ecuador" },
    "Independiente del Valle":  { l: "Serie A",               c: "Ecuador" },
    "LDU Quito":                { l: "Serie A",               c: "Ecuador" },
    "Aucas":                    { l: "Serie A",               c: "Ecuador" },
    // Paraguay
    "Olimpia":                  { l: "División Profesional",  c: "Paraguay" },
    "Cerro Porteño":            { l: "División Profesional",  c: "Paraguay" },
    // Chile
    "Colo-Colo":                { l: "Primera División",      c: "Chile" },
    "Universidad de Chile":     { l: "Primera División",      c: "Chile" },
    // Japan J1 League
    "Gamba Osaka":              { l: "J1 League",             c: "Japan" },
    "Kashima Antlers":          { l: "J1 League",             c: "Japan" },
    "Kawasaki Frontale":        { l: "J1 League",             c: "Japan" },
    "Nagoya Grampus":           { l: "J1 League",             c: "Japan" },
    "Urawa Red Diamonds":       { l: "J1 League",             c: "Japan" },
    "Vissel Kobe":              { l: "J1 League",             c: "Japan" },
    "Yokohama F. Marinos":      { l: "J1 League",             c: "Japan" },
    "Sagan Tosu":               { l: "J1 League",             c: "Japan" },
    "Cerezo Osaka":             { l: "J1 League",             c: "Japan" },
    "Sanfrecce Hiroshima":      { l: "J1 League",             c: "Japan" },
    "FC Tokyo":                 { l: "J1 League",             c: "Japan" },
    "Shonan Bellmare":          { l: "J1 League",             c: "Japan" },
    // South Korea K League 1
    "Jeonbuk Hyundai Motors":   { l: "K League 1",            c: "South Korea" },
    "Ulsan HD":                 { l: "K League 1",            c: "South Korea" },
    "Ulsan Hyundai":            { l: "K League 1",            c: "South Korea" },
    "Jeju United":              { l: "K League 1",            c: "South Korea" },
    "Suwon Samsung Bluewings":  { l: "K League 1",            c: "South Korea" },
    "Pohang Steelers":          { l: "K League 1",            c: "South Korea" },
    "Seongnam FC":              { l: "K League 1",            c: "South Korea" },
    // Iran
    "Persepolis":               { l: "Persian Gulf Pro League", c: "Iran" },
    "Esteghlal":                { l: "Persian Gulf Pro League", c: "Iran" },
    "Sepahan":                  { l: "Persian Gulf Pro League", c: "Iran" },
    "Tractor SC":               { l: "Persian Gulf Pro League", c: "Iran" },
    // Morocco
    "Wydad Casablanca":         { l: "Botola Pro",            c: "Morocco" },
    "Raja Casablanca":          { l: "Botola Pro",            c: "Morocco" },
    "Renaissance Berkane":      { l: "Botola Pro",            c: "Morocco" },
    // Egypt
    "Al Ahly":                  { l: "Egyptian Premier League", c: "Egypt" },
    "Zamalek":                  { l: "Egyptian Premier League", c: "Egypt" },
    "Pyramids FC":              { l: "Egyptian Premier League", c: "Egypt" },
    // Tunisia
    "Espérance de Tunis":       { l: "Ligue Professionnelle 1", c: "Tunisia" },
    "Club Africain":            { l: "Ligue Professionnelle 1", c: "Tunisia" },
    "CS Sfaxien":               { l: "Ligue Professionnelle 1", c: "Tunisia" },
    // Algeria
    "CR Belouizdad":            { l: "Ligue Professionnelle 1", c: "Algeria" },
    "USM Alger":                { l: "Ligue Professionnelle 1", c: "Algeria" },
    "MC Alger":                 { l: "Ligue Professionnelle 1", c: "Algeria" },
    // South Africa
    "Mamelodi Sundowns":        { l: "Premier Soccer League", c: "South Africa" },
    "Kaizer Chiefs":            { l: "Premier Soccer League", c: "South Africa" },
    "Orlando Pirates":          { l: "Premier Soccer League", c: "South Africa" },
    // Senegal
    "Génération Foot":          { l: "Ligue 1 Sénégal",      c: "Senegal" },
    "AS Pikine":                { l: "Ligue 1 Sénégal",      c: "Senegal" },
    // Ivory Coast
    "ASEC Mimosas":             { l: "Ligue 1 Ivoirienne",   c: "Ivory Coast" },
    // Congo DR
    "AS Vita Club":             { l: "Linafoot",              c: "Congo DR" },
    "TP Mazembe":               { l: "Linafoot",              c: "Congo DR" },
    // Australia
    "Melbourne City":           { l: "A-League Men",          c: "Australia" },
    "Sydney FC":                { l: "A-League Men",          c: "Australia" },
    "Melbourne Victory":        { l: "A-League Men",          c: "Australia" },
    "Western Sydney Wanderers": { l: "A-League Men",          c: "Australia" },
    "Brisbane Roar":            { l: "A-League Men",          c: "Australia" },
    "Central Coast Mariners":   { l: "A-League Men",          c: "Australia" },
    "Adelaide United":          { l: "A-League Men",          c: "Australia" },
    "Perth Glory":              { l: "A-League Men",          c: "Australia" },
    "Macarthur FC":             { l: "A-League Men",          c: "Australia" },
    // Denmark
    "FC Copenhagen":            { l: "Superliga",             c: "Denmark" },
    "Midtjylland":              { l: "Superliga",             c: "Denmark" },
    "Brøndby":                  { l: "Superliga",             c: "Denmark" },
    "FC Nordsjælland":          { l: "Superliga",             c: "Denmark" },
    // Sweden
    "Malmö FF":                 { l: "Allsvenskan",           c: "Sweden" },
    "IFK Göteborg":             { l: "Allsvenskan",           c: "Sweden" },
    "AIK":                      { l: "Allsvenskan",           c: "Sweden" },
    "Djurgårdens IF":           { l: "Allsvenskan",           c: "Sweden" },
    // Norway
    "Molde":                    { l: "Eliteserien",           c: "Norway" },
    "Rosenborg":                { l: "Eliteserien",           c: "Norway" },
    "SK Brann":                 { l: "Eliteserien",           c: "Norway" },
    "Bodø/Glimt":               { l: "Eliteserien",           c: "Norway" },
    // Czech Republic
    "AC Sparta Prague":         { l: "Czech First League",    c: "Czech Republic" },
    "Sparta Prague":            { l: "Czech First League",    c: "Czech Republic" },
    "SK Slavia Prague":         { l: "Czech First League",    c: "Czech Republic" },
    "Slavia Prague":            { l: "Czech First League",    c: "Czech Republic" },
    "Viktoria Plzeň":           { l: "Czech First League",    c: "Czech Republic" },
    // Croatia
    "GNK Dinamo Zagreb":        { l: "HNL",                   c: "Croatia" },
    "Dinamo Zagreb":            { l: "HNL",                   c: "Croatia" },
    "Hajduk Split":             { l: "HNL",                   c: "Croatia" },
    // Serbia
    "Red Star Belgrade":        { l: "Serbian SuperLiga",     c: "Serbia" },
    "FK Crvena zvezda":         { l: "Serbian SuperLiga",     c: "Serbia" },
    "Partizan Belgrade":        { l: "Serbian SuperLiga",     c: "Serbia" },
    // Uzbekistan
    "Pakhtakor":                { l: "Uzbekistan Super League", c: "Uzbekistan" },
    "Nasaf":                    { l: "Uzbekistan Super League", c: "Uzbekistan" },
    // Iraq
    "Al-Shorta":                { l: "Iraq Stars League",     c: "Iraq" },
    "Air Force Club":           { l: "Iraq Stars League",     c: "Iraq" },
    "Al-Zawraa":                { l: "Iraq Stars League",     c: "Iraq" },
    // Jordan
    "Al-Faisaly":               { l: "Jordan Premier League", c: "Jordan" },
    "Al-Wahdat":                { l: "Jordan Premier League", c: "Jordan" },
    // Qatar
    "Al Duhail":                { l: "Qatar Stars League",    c: "Qatar" },
    "Al-Sadd":                  { l: "Qatar Stars League",    c: "Qatar" },
    "Al Rayyan":                { l: "Qatar Stars League",    c: "Qatar" },
    "Al Gharafa":               { l: "Qatar Stars League",    c: "Qatar" },
    "Lekhwiya":                 { l: "Qatar Stars League",    c: "Qatar" },
    // New Zealand
    "Auckland City":            { l: "National League",       c: "New Zealand" },
    "Auckland FC":              { l: "A-League Men",          c: "New Zealand" },
    "Wellington Phoenix":       { l: "A-League Men",          c: "New Zealand" },
    // Cape Verde
    "CS Mindelense":            { l: "Campeonato Nacional",   c: "Cape Verde" },
    // Bosnia
    "FK Željezničar":           { l: "Premier League of BiH", c: "Bosnia & Herzegovina" },
    "FK Sarajevo":              { l: "Premier League of BiH", c: "Bosnia & Herzegovina" },
    "Borac Banja Luka":         { l: "Premier League of BiH", c: "Bosnia & Herzegovina" },
    // Qatar Stars League (additional)
    "Al-Duhail":                { l: "Qatar Stars League",    c: "Qatar" },
    "Al-Rayyan":                { l: "Qatar Stars League",    c: "Qatar" },
    "Al-Wakrah":                { l: "Qatar Stars League",    c: "Qatar" },
    "Al-Arabi":                 { l: "Qatar Stars League",    c: "Qatar" },
    "Al-Gharafa":               { l: "Qatar Stars League",    c: "Qatar" },
    "Al-Sailiya":               { l: "Qatar Stars League",    c: "Qatar" },
    "Qatar SC":                 { l: "Qatar Stars League",    c: "Qatar" },
    "Al-Shamal":                { l: "Qatar Stars League",    c: "Qatar" },
    // Iraq Stars League (additional)
    "Al-Karma":                 { l: "Iraq Stars League",     c: "Iraq" },
    "Al-Talaba":                { l: "Iraq Stars League",     c: "Iraq" },
    "Al-Quwa Al-Jawiya":        { l: "Iraq Stars League",     c: "Iraq" },
    "Al-Najma":                 { l: "Iraq Stars League",     c: "Iraq" },
    // Germany 2. Bundesliga
    "FC St. Pauli":             { l: "2. Bundesliga",         c: "Germany" },
    "Hannover 96":              { l: "2. Bundesliga",         c: "Germany" },
    "Holstein Kiel":            { l: "2. Bundesliga",         c: "Germany" },
    "Karlsruher SC":            { l: "2. Bundesliga",         c: "Germany" },
    "Fortuna Düsseldorf":       { l: "2. Bundesliga",         c: "Germany" },
    "Greuther Fürth":           { l: "2. Bundesliga",         c: "Germany" },
    "Darmstadt 98":             { l: "2. Bundesliga",         c: "Germany" },
    "Paderborn":                { l: "2. Bundesliga",         c: "Germany" },
    "Cosmos Koblenz":           { l: "Regionalliga",          c: "Germany" },
    // France Ligue 2 / National
    "Auxerre":                  { l: "Ligue 2",               c: "France" },
    "Angers":                   { l: "Ligue 1",               c: "France" },
    "Saint-Étienne":            { l: "Ligue 1",               c: "France" },
    "Reims":                    { l: "Ligue 1",               c: "France" },
    "Paris FC":                 { l: "Ligue 2",               c: "France" },
    "Nancy":                    { l: "Ligue 2",               c: "France" },
    "Bastia":                   { l: "Ligue 2",               c: "France" },
    // Scotland
    "Heart of Midlothian":      { l: "Scottish Premiership",  c: "Scotland" },
    "Kilmarnock":               { l: "Scottish Premiership",  c: "Scotland" },
    "Motherwell":               { l: "Scottish Premiership",  c: "Scotland" },
    // England Championship / League One
    "Swansea City":             { l: "Championship",          c: "England" },
    "Hull City":                { l: "Championship",          c: "England" },
    "Watford":                  { l: "Championship",          c: "England" },
    "Derby County":             { l: "Championship",          c: "England" },
    "Millwall":                 { l: "Championship",          c: "England" },
    "Coventry City":            { l: "Championship",          c: "England" },
    "Luton Town":               { l: "Championship",          c: "England" },
    "Birmingham City":          { l: "Championship",          c: "England" },
    "Barnsley":                 { l: "League One",            c: "England" },
    "Portsmouth":               { l: "Championship",          c: "England" },
    "Peterborough United":      { l: "Championship",          c: "England" },
    "Rotherham United":         { l: "Championship",          c: "England" },
    "Port Vale":                { l: "League Two",            c: "England" },
    "Charlton Athletic":        { l: "League One",            c: "England" },
    "Wrexham":                  { l: "Championship",          c: "England" },
    "Braintree Town":           { l: "National League",       c: "England" },
    // Belgium
    "Union Saint-Gilloise":     { l: "First Division A",      c: "Belgium" },
    "Charleroi":                { l: "First Division A",      c: "Belgium" },
    "Sint-Truiden":             { l: "First Division A",      c: "Belgium" },
    "Dender":                   { l: "First Division A",      c: "Belgium" },
    "Mechelen":                 { l: "First Division A",      c: "Belgium" },
    "Beveren":                  { l: "First Division A",      c: "Belgium" },
    "Cercle Brugge":            { l: "First Division A",      c: "Belgium" },
    "Antwerp":                  { l: "First Division A",      c: "Belgium" },
    "Zulte Waregem":            { l: "First Division A",      c: "Belgium" },
    "AS Eupen":                 { l: "First Division A",      c: "Belgium" },
    // Netherlands (Eerste Divisie)
    "PEC Zwolle":               { l: "Eerste Divisie",        c: "Netherlands" },
    "RKC Waalwijk":             { l: "Eredivisie",            c: "Netherlands" },
    "Volendam":                 { l: "Eerste Divisie",        c: "Netherlands" },
    "NEC":                      { l: "Eredivisie",            c: "Netherlands" },
    "VVV-Venlo":                { l: "Eerste Divisie",        c: "Netherlands" },
    "Heracles Almelo":          { l: "Eredivisie",            c: "Netherlands" },
    "Telstar":                  { l: "Eerste Divisie",        c: "Netherlands" },
    "Almere City":              { l: "Eredivisie",            c: "Netherlands" },
    "Sparta Rotterdam":         { l: "Eredivisie",            c: "Netherlands" },
    "Den Bosch":                { l: "Eerste Divisie",        c: "Netherlands" },
    // Spain Segunda División
    "Oviedo":                   { l: "Segunda División",      c: "Spain" },
    "Real Oviedo":              { l: "Segunda División",      c: "Spain" },
    "Castellón":                { l: "Segunda División",      c: "Spain" },
    "Levante":                  { l: "Segunda División",      c: "Spain" },
    "Granada":                  { l: "Segunda División",      c: "Spain" },
    "Cultural Leonesa":         { l: "Segunda División B",    c: "Spain" },
    "Elche":                    { l: "Segunda División",      c: "Spain" },
    "Racing Santander":         { l: "Segunda División",      c: "Spain" },
    // Italy Serie B
    "Cremonese":                { l: "Serie B",               c: "Italy" },
    "Pisa":                     { l: "Serie B",               c: "Italy" },
    "Sampdoria":                { l: "Serie B",               c: "Italy" },
    // Austria
    "Austria Wien":             { l: "Austrian Football Bundesliga", c: "Austria" },
    "Grazer AK":                { l: "Austrian Football Bundesliga", c: "Austria" },
    // Turkey Süper Lig (additional)
    "Çaykur Rizespor":          { l: "Süper Lig",             c: "Turkey" },
    "Kasımpaşa":                { l: "Süper Lig",             c: "Turkey" },
    "Gaziantep":                { l: "Süper Lig",             c: "Turkey" },
    "Kayserispor":              { l: "Süper Lig",             c: "Turkey" },
    "Konyaspor":                { l: "Süper Lig",             c: "Turkey" },
    "Alanyaspor":               { l: "Süper Lig",             c: "Turkey" },
    "Samsunspor":               { l: "Süper Lig",             c: "Turkey" },
    "Iğdır FK":                 { l: "TFF Second League",     c: "Turkey" },
    "Iğdır":                    { l: "TFF Second League",     c: "Turkey" },
    // Sweden Allsvenskan (additional)
    "Mjällby AIF":              { l: "Allsvenskan",           c: "Sweden" },
    "IFK Norrköping":           { l: "Allsvenskan",           c: "Sweden" },
    // Norway Eliteserien (additional)
    "Viking":                   { l: "Eliteserien",           c: "Norway" },
    "Sarpsborg 08":             { l: "Eliteserien",           c: "Norway" },
    // Denmark Superliga (additional)
    "AGF":                      { l: "Superliga",             c: "Denmark" },
    "Randers":                  { l: "Superliga",             c: "Denmark" },
    "Silkeborg":                { l: "Superliga",             c: "Denmark" },
    // Greece
    "Kifisia":                  { l: "Super League Greece",   c: "Greece" },
    "Atromitos":                { l: "Super League Greece",   c: "Greece" },
    "AEL":                      { l: "Super League Greece",   c: "Greece" },
    // Cyprus
    "AEL Limassol":             { l: "First Division",        c: "Cyprus" },
    "Pafos":                    { l: "First Division",        c: "Cyprus" },
    "APOEL":                    { l: "First Division",        c: "Cyprus" },
    "AEK Larnaca":              { l: "First Division",        c: "Cyprus" },
    "Apollon Limassol":         { l: "First Division",        c: "Cyprus" },
    "Omonia":                   { l: "First Division",        c: "Cyprus" },
    "Aris Limassol":            { l: "First Division",        c: "Cyprus" },
    // Croatia HNL (additional)
    "Rijeka":                   { l: "HNL",                   c: "Croatia" },
    // Czech (additional)
    "Slovan Liberec":           { l: "Czech First League",    c: "Czech Republic" },
    "Hradec Králové":           { l: "Czech First League",    c: "Czech Republic" },
    // Poland Ekstraklasa
    "Lechia Gdańsk":            { l: "Ekstraklasa",           c: "Poland" },
    "Widzew Łódź":              { l: "Ekstraklasa",           c: "Poland" },
    "Cracovia":                 { l: "Ekstraklasa",           c: "Poland" },
    "Pogoń Szczecin":           { l: "Ekstraklasa",           c: "Poland" },
    "Jagiellonia Białystok":    { l: "Ekstraklasa",           c: "Poland" },
    "Legia Warsaw":             { l: "Ekstraklasa",           c: "Poland" },
    // Hungary
    "Ferencváros":              { l: "OTP Bank Liga",         c: "Hungary" },
    "Puskás Akadémia":          { l: "OTP Bank Liga",         c: "Hungary" },
    "Győri ETO":                { l: "OTP Bank Liga",         c: "Hungary" },
    // Romania
    "Universitatea Cluj":       { l: "Liga I",                c: "Romania" },
    "FCSB":                     { l: "Liga I",                c: "Romania" },
    // Slovakia
    "Slovan Bratislava":        { l: "Slovak Super Liga",     c: "Slovakia" },
    "Tatran Prešov":            { l: "Slovak Super Liga",     c: "Slovakia" },
    // Slovenia
    "Maribor":                  { l: "Slovenian PrvaLiga",    c: "Slovenia" },
    // Bulgaria
    "Ludogorets Razgrad":       { l: "First Professional League", c: "Bulgaria" },
    // Kazakhstan
    "Astana":                   { l: "Kazakhstan Premier League", c: "Kazakhstan" },
    "FC Astana":                { l: "Kazakhstan Premier League", c: "Kazakhstan" },
    // Russia (additional)
    "Krasnodar":                { l: "Russian Premier League", c: "Russia" },
    "Rostov":                   { l: "Russian Premier League", c: "Russia" },
    "Dynamo Moscow":            { l: "Russian Premier League", c: "Russia" },
    "Akron Tolyatti":           { l: "Russian Premier League", c: "Russia" },
    "Pari Nizhny Novgorod":     { l: "Russian Premier League", c: "Russia" },
    "Dynamo Makhachkala":       { l: "Russian Premier League", c: "Russia" },
    // Israel
    "Maccabi Haifa":            { l: "Israeli Premier League", c: "Israel" },
    "Maccabi Tel Aviv":         { l: "Israeli Premier League", c: "Israel" },
    "Ironi Kiryat Shmona":      { l: "Israeli Premier League", c: "Israel" },
    // UAE (additional)
    "Kalba":                    { l: "UAE Pro League",        c: "UAE" },
    "Al Bataeh":                { l: "UAE Pro League",        c: "UAE" },
    "Al Dhafra":                { l: "UAE Pro League",        c: "UAE" },
    "Shabab Al Ahli":           { l: "UAE Pro League",        c: "UAE" },
    "Al Nasr":                  { l: "UAE Pro League",        c: "UAE" },
    "Al Wahda":                 { l: "UAE Pro League",        c: "UAE" },
    "Al Jazira":                { l: "UAE Pro League",        c: "UAE" },
    "Baniyas":                  { l: "UAE Pro League",        c: "UAE" },
    "Dibba":                    { l: "UAE Pro League",        c: "UAE" },
    "ZED":                      { l: "UAE Pro League",        c: "UAE" },
    // Saudi Arabia (additional)
    "Al-Fateh":                 { l: "Saudi Pro League",      c: "Saudi Arabia" },
    "Neom":                     { l: "Saudi Pro League",      c: "Saudi Arabia" },
    "Al-Ula":                   { l: "Saudi Pro League",      c: "Saudi Arabia" },
    "Abha":                     { l: "Saudi Pro League",      c: "Saudi Arabia" },
    // Iran (additional)
    "Malavan":                  { l: "Persian Gulf Pro League", c: "Iran" },
    "Foolad":                   { l: "Persian Gulf Pro League", c: "Iran" },
    // Malaysia
    "Selangor":                 { l: "Malaysia Super League", c: "Malaysia" },
    "Terengganu":               { l: "Malaysia Super League", c: "Malaysia" },
    // Australia (additional)
    "Newcastle Jets":           { l: "A-League Men",          c: "Australia" },
    // Portugal (additional)
    "Tondela":                  { l: "Primeira Liga",         c: "Portugal" },
    "Chaves":                   { l: "Primeira Liga",         c: "Portugal" },
    "Torreense":                { l: "LigaPro",               c: "Portugal" },
    "Vizela":                   { l: "Primeira Liga",         c: "Portugal" },
    "Estrela Amadora":          { l: "Primeira Liga",         c: "Portugal" },
    "Farense":                  { l: "Primeira Liga",         c: "Portugal" },
    "Casa Pia":                 { l: "Primeira Liga",         c: "Portugal" },
    "Gil Vicente":              { l: "Primeira Liga",         c: "Portugal" },
    "Vitória de Guimarães":     { l: "Primeira Liga",         c: "Portugal" },
    "Vitória SC":               { l: "Primeira Liga",         c: "Portugal" },
    // Finland
    "SJK":                      { l: "Veikkausliiga",         c: "Finland" },
    // Ireland
    "Shamrock Rovers":          { l: "League of Ireland Premier Division", c: "Ireland" },
    "St Patrick's Athletic":    { l: "League of Ireland Premier Division", c: "Ireland" },
    // Morocco (additional)
    "AS FAR":                   { l: "Botola Pro",            c: "Morocco" },
    "RS Berkane":               { l: "Botola Pro",            c: "Morocco" },
    // Algeria (additional)
    "JS Kabylie":               { l: "Ligue Professionnelle 1", c: "Algeria" },
    // Tunisia (additional)
    "Étoile du Sahel":          { l: "Ligue Professionnelle 1", c: "Tunisia" },
    "US Monastir":              { l: "Ligue Professionnelle 1", c: "Tunisia" },
    // Egypt (additional)
    "El Gouna":                 { l: "Egyptian Premier League", c: "Egypt" },
    // South Africa (additional)
    "Polokwane City":           { l: "Premier Soccer League", c: "South Africa" },
    // Venezuela
    "Puerto Cabello":           { l: "Liga FUTVE",            c: "Venezuela" },
    "Deportivo La Guaira":      { l: "Liga FUTVE",            c: "Venezuela" },
    // Chile (additional)
    "Universidad Católica":     { l: "Primera División",      c: "Chile" },
    "Cobresal":                 { l: "Primera División",      c: "Chile" },
    "Universidad de Concepción":{ l: "Primera División",      c: "Chile" },
    // Honduras
    "Marathón":                 { l: "Liga Nacional",         c: "Honduras" },
    // Costa Rica
    "Saprissa":                 { l: "Primera División",      c: "Costa Rica" },
    // Panama
    "Plaza Amador":             { l: "LPF",                   c: "Panama" },
    // Switzerland (additional)
    "St. Gallen":               { l: "Super League",          c: "Switzerland" },
    "Servette":                 { l: "Super League",          c: "Switzerland" },
    "Lugano":                   { l: "Super League",          c: "Switzerland" },
    "FC Lugano":                { l: "Super League",          c: "Switzerland" },
    "Stade Nyonnais":           { l: "Promotion League",      c: "Switzerland" },
    "Zürich":                   { l: "Super League",          c: "Switzerland" },
    "FC Zürich":                { l: "Super League",          c: "Switzerland" },
    // Argentina (additional)
    "Rosario Central":          { l: "Primera División",      c: "Argentina" },
    "Vélez Sarsfield":          { l: "Primera División",      c: "Argentina" },
    // Japan (additional)
    "Albirex Niigata":          { l: "J1 League",             c: "Japan" },
    "Machida Zelvia":           { l: "J1 League",             c: "Japan" },
    // South Korea (additional)
    "Gangwon FC":               { l: "K League 1",            c: "South Korea" },
    "Daejeon Hana Citizen":     { l: "K League 1",            c: "South Korea" },
    "FC Seoul":                 { l: "K League 1",            c: "South Korea" },
    // Uzbekistan (additional)
    "Dinamo Samarqand":         { l: "Uzbekistan Super League", c: "Uzbekistan" },
    "Neftchi Fergana":          { l: "Uzbekistan Super League", c: "Uzbekistan" },
    "Navbahor Namangan":        { l: "Uzbekistan Super League", c: "Uzbekistan" },
    "AGMK":                     { l: "Uzbekistan Super League", c: "Uzbekistan" },
    "Bukhara":                  { l: "Uzbekistan Super League", c: "Uzbekistan" },
    "Surkhon Termiz":           { l: "Uzbekistan Super League", c: "Uzbekistan" },
    // Azerbaijan
    "Turan Tovuz":              { l: "Azerbaijan Premier League", c: "Azerbaijan" },
    "Noah":                     { l: "Azerbaijan Premier League", c: "Azerbaijan" },
    // Indonesia
    "Persib":                   { l: "Liga 1",                c: "Indonesia" },
    "Persib Bandung":           { l: "Liga 1",                c: "Indonesia" },
    // China
    "Zhejiang":                 { l: "Chinese Super League",  c: "China" },
    // Colorado Springs (USL)
    "Colorado Springs Switchbacks FC": { l: "USL Championship", c: "USA" },
    "El Paso Locomotive FC":    { l: "USL Championship",      c: "USA" },
    "Miami FC":                 { l: "USL Championship",      c: "USA" },
    "Nashville SC":             { l: "MLS",                   c: "USA" },
    // Haiti
    "Violette":                 { l: "Championnat National",  c: "Haiti" },
    "Siwelele":                 { l: "Premier Soccer League", c: "South Africa" },
    "Sheffield United":         { l: "Championship",          c: "England" },
    "Montana":                  { l: "Parva Liga",            c: "Bulgaria" },
    "Frosinone":                { l: "Serie B",               c: "Italy" },
    "Al-Hussein":               { l: "Jordan Premier League", c: "Jordan" },
    // Russia (pre-ban clubs, historical career)
    "CSKA Moscow":              { l: "Russian Premier League", c: "Russia" },
    "Spartak Moscow":           { l: "Russian Premier League", c: "Russia" },
    "Zenit Saint Petersburg":   { l: "Russian Premier League", c: "Russia" },
    "Zenit":                    { l: "Russian Premier League", c: "Russia" },
    "Lokomotiv Moscow":         { l: "Russian Premier League", c: "Russia" },
};

// ── Confederations ────────────────────────────────────────────────────────────

const CONFEDERATIONS = {
    "Argentina": "CONMEBOL", "Bolivia": "CONMEBOL", "Brazil": "CONMEBOL",
    "Chile": "CONMEBOL", "Colombia": "CONMEBOL", "Ecuador": "CONMEBOL",
    "Paraguay": "CONMEBOL", "Peru": "CONMEBOL", "Uruguay": "CONMEBOL", "Venezuela": "CONMEBOL",
    "Canada": "CONCACAF", "Costa Rica": "CONCACAF", "Cuba": "CONCACAF",
    "Guatemala": "CONCACAF", "Haiti": "CONCACAF", "Honduras": "CONCACAF",
    "Jamaica": "CONCACAF", "Mexico": "CONCACAF", "Panama": "CONCACAF",
    "Trinidad and Tobago": "CONCACAF", "United States": "CONCACAF", "USA": "CONCACAF",
    "Curaçao": "CONCACAF",
    "Albania": "UEFA", "Austria": "UEFA", "Belgium": "UEFA",
    "Bosnia & Herzegovina": "UEFA", "Bulgaria": "UEFA", "Croatia": "UEFA",
    "Czech Republic": "UEFA", "Denmark": "UEFA", "England": "UEFA",
    "France": "UEFA", "Georgia": "UEFA", "Germany": "UEFA",
    "Greece": "UEFA", "Hungary": "UEFA", "Italy": "UEFA",
    "Netherlands": "UEFA", "Norway": "UEFA", "Poland": "UEFA",
    "Portugal": "UEFA", "Romania": "UEFA", "Scotland": "UEFA",
    "Serbia": "UEFA", "Slovakia": "UEFA", "Slovenia": "UEFA",
    "Spain": "UEFA", "Sweden": "UEFA", "Switzerland": "UEFA",
    "Türkiye": "UEFA", "Turkey": "UEFA", "Ukraine": "UEFA", "Wales": "UEFA",
    "Algeria": "CAF", "Cameroon": "CAF", "Cape Verde": "CAF",
    "Congo DR": "CAF", "DR Congo": "CAF", "Côte d'Ivoire": "CAF", "Egypt": "CAF",
    "Ghana": "CAF", "Guinea": "CAF", "Ivory Coast": "CAF",
    "Mali": "CAF", "Morocco": "CAF", "Nigeria": "CAF",
    "Senegal": "CAF", "South Africa": "CAF", "Tanzania": "CAF", "Tunisia": "CAF",
    "Uganda": "CAF", "Zimbabwe": "CAF", "Comoros": "CAF",
    "Australia": "AFC", "China PR": "AFC", "Indonesia": "AFC",
    "Iran": "AFC", "Iraq": "AFC", "Japan": "AFC",
    "Jordan": "AFC", "North Korea": "AFC", "Oman": "AFC",
    "Qatar": "AFC", "Saudi Arabia": "AFC", "South Korea": "AFC",
    "Uzbekistan": "AFC", "Vietnam": "AFC",
    "New Zealand": "OFC",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function lookupLeague(clubName) {
    if (!clubName) return { league_name: null, league_country: null };
    if (CLUBS_LEAGUES[clubName]) {
        const e = CLUBS_LEAGUES[clubName];
        return { league_name: e.l, league_country: e.c };
    }
    // Fuzzy: check if any key is contained in clubName or vice versa
    for (const [key, val] of Object.entries(CLUBS_LEAGUES)) {
        if (clubName.includes(key) || key.includes(clubName)) {
            return { league_name: val.l, league_country: val.c };
        }
    }
    return { league_name: null, league_country: null };
}

const MONTHS = {
    january:1, february:2, march:3, april:4, may:5, june:6,
    july:7, august:8, september:9, october:10, november:11, december:12,
};

function parseDob(text) {
    if (!text) return null;
    const iso = text.match(/(\d{4}-\d{2}-\d{2})/);
    if (iso) return iso[1];
    const dmy = text.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
    if (dmy) {
        const mo = MONTHS[dmy[2].toLowerCase()];
        if (mo) return `${dmy[3]}-${String(mo).padStart(2,'0')}-${String(dmy[1]).padStart(2,'0')}`;
    }
    const mdy = text.match(/(\w+)\s+(\d{1,2}),\s+(\d{4})/);
    if (mdy) {
        const mo = MONTHS[mdy[1].toLowerCase()];
        if (mo) return `${mdy[3]}-${String(mo).padStart(2,'0')}-${String(mdy[2]).padStart(2,'0')}`;
    }
    return null;
}

function normalizePosition(pos) {
    if (!pos) return null;
    const p = pos.toLowerCase().trim();
    if (p.includes('goalkeeper') || p === 'gk') return 'Goalkeeper';
    if (p.includes('forward') || p.includes('striker') || p.includes('winger') || p === 'fw') return 'Attacker';
    if (p.includes('midfielder') || p === 'mf' || p === 'cm' || p === 'dm' || p === 'am') return 'Midfielder';
    if (p.includes('defender') || p.includes('back') || p === 'df') return 'Defender';
    return pos;
}

const POS_MAP = { GK: 'Goalkeeper', DF: 'Defender', MF: 'Midfielder', FW: 'Attacker' };

function expandYearsToSeasons(raw) {
    if (!raw) return [];
    const s = raw.replace(/[–—–—]/g, '-').trim();
    // Open-ended: "2024-" or "2024–"
    if (/^\d{4}-?$/.test(s)) {
        const start = parseInt(s);
        const seasons = [];
        for (let y = start; y < 2027; y++) seasons.push(`${y}-${y + 1}`);
        return seasons;
    }
    const m = s.match(/^(\d{4})-(\d{2,4}|present)$/i);
    if (!m) return [];
    const start = parseInt(m[1]);
    let end;
    if (/present/i.test(m[2])) {
        end = 2026;
    } else if (m[2].length === 2) {
        end = parseInt(m[1].slice(0, 2) + m[2]);
    } else {
        end = parseInt(m[2]);
    }
    const seasons = [];
    for (let y = start; y < Math.min(end, 2027); y++) {
        seasons.push(`${y}-${y + 1}`);
    }
    return seasons;
}

function cleanText($el) {
    const clone = $el.clone();
    clone.find('sup, span[style*="display:none"], span.sortkey').remove();
    return clone.text().trim();
}

// ── Parse squads page ─────────────────────────────────────────────────────────

function parseSquadsPage($) {
    const teams = [];

    // Try h2 and h3 headings; teams might be under h2 or h3 depending on page structure
    $('h2, h3').each((_, heading) => {
        const $h = $(heading);
        // New Wikipedia parser: text directly on heading; old: .mw-headline span
        const teamName = ($h.find('.mw-headline').text().trim() || $h.text().trim())
            .replace(/\[.*?\]/g, '').trim();
        if (!teamName || /contents|notes|references|see also|group|withdrawn|edit/i.test(teamName)) return;

        // Walk siblings to find the next wikitable
        // h3 may be wrapped in div.mw-heading; start sibling walk from that wrapper
        const $startEl = $h.parent().is('div') ? $h.parent() : $h;
        let $el = $startEl.next();
        while ($el.length) {
            const tag = $el.get(0).tagName;
            if (tag === 'h2' || tag === 'h3') break;
            // Check if element is itself a wikitable
            if (tag === 'table' && ($el.attr('class') || '').includes('wikitable')) {
                const players = parseSquadTable($, $el);
                if (players.length >= 10) teams.push({ team: teamName, players });
                break;
            }
            // Or if it's a div wrapping a heading (next team), stop
            if ($el.hasClass('mw-heading')) break;
            // table might be inside current element
            const tbl = $el.find('table').filter((_, t) => ($(t).attr('class') || '').includes('wikitable')).first();
            if (tbl.length) {
                const players = parseSquadTable($, tbl);
                if (players.length >= 10) teams.push({ team: teamName, players });
                break;
            }
            $el = $el.next();
        }
    });

    return teams;
}

function parseSquadTable($, table) {
    const players = [];
    const headerRow = table.find('tr').first();
    const headers = [];
    headerRow.find('th').each((_, th) => {
        headers.push(cleanText($(th)).toLowerCase().replace(/\s+/g, ' '));
    });

    const idxNo     = headers.findIndex(h => /^no\.?$/.test(h));
    const idxPos    = headers.findIndex(h => /^pos\.?$/.test(h));
    const idxPlayer = headers.findIndex(h => h === 'player' || h === 'name');
    const idxDob    = headers.findIndex(h => h.includes('date of birth') || h.includes('dob'));
    const idxCaps   = headers.findIndex(h => h === 'caps');
    const idxGoals  = headers.findIndex(h => h === 'goals');
    const idxClub   = headers.findIndex(h => h === 'club');

    if (idxPlayer < 0 || idxClub < 0) return players;

    table.find('tr').each((i, row) => {
        if (i === 0) return;
        const cells = $(row).find('td, th[scope="row"]');
        if (cells.length < 4) return;

        const offset = Math.max(0, headers.length - cells.length);
        const cellText = idx => {
            const ri = idx - offset;
            if (ri < 0 || ri >= cells.length) return '';
            return cleanText($(cells[ri]));
        };
        const cellHref = idx => {
            const ri = idx - offset;
            if (ri < 0 || ri >= cells.length) return null;
            const a = $(cells[ri]).find('a').first();
            return a.length ? a.attr('href') : null;
        };

        const rawPos    = idxPos >= 0    ? cellText(idxPos).trim()   : '';
        const pos       = POS_MAP[rawPos] || normalizePosition(rawPos);
        const rawName   = idxPlayer >= 0 ? cellText(idxPlayer)       : '';
        const playerName = rawName.replace(/\s*\(.*?\)\s*/g, '').trim();
        const wikiHref  = idxPlayer >= 0 ? cellHref(idxPlayer)       : null;
        const wikiPath  = wikiHref && wikiHref.startsWith('/wiki/') ? wikiHref : null;
        const dobRaw    = idxDob >= 0    ? cellText(idxDob)          : '';
        const jerseyStr = idxNo >= 0     ? cellText(idxNo)           : '';
        const jersey    = parseInt(jerseyStr) || null;
        const capsStr   = idxCaps >= 0   ? cellText(idxCaps)         : '0';
        const goalsStr  = idxGoals >= 0  ? cellText(idxGoals)        : '0';
        const clubRaw   = idxClub >= 0   ? cellText(idxClub)         : '';
        const club      = clubRaw.replace(/\[.*?\]/g, '').trim();

        if (!playerName || !club) return;

        // Extract age from dob text
        const ageMatch = dobRaw.match(/age[:\s]+(\d+)/i);
        const age      = ageMatch ? parseInt(ageMatch[1]) : null;
        const birth_date = parseDob(dobRaw);

        players.push({
            name: playerName,
            jersey_number_national: jersey,
            position: pos,
            birth_date,
            age,
            national_caps:  parseInt(capsStr)  || 0,
            national_goals: parseInt(goalsStr) || 0,
            current_club_name: club,
            wiki_path: wikiPath,
        });
    });

    return players;
}

// ── Parse player Wikipedia infobox ───────────────────────────────────────────

function parsePlayerPage($) {
    const result = {
        birth_date:               null,
        birth_country:            null,
        height:                   null,
        position:                 null,
        career_history:           [],
        total_career_club_goals:  null,
    };

    const infobox = $('table.infobox').first();
    if (!infobox.length) return result;

    const rows = infobox.find('tr').toArray();
    let inSenior = false;
    let totalGoals = 0;

    for (let i = 0; i < rows.length; i++) {
        const $row  = $(rows[i]);
        const $ths  = $row.find('th');
        const $tds  = $row.find('td');
        const thRaw = cleanText($ths.first());
        const thLow = thRaw.toLowerCase().replace(/[*†‡]/g, '').trim();

        // ── Section headers: only th, no td ──────────────────────────────────
        if ($tds.length === 0 && $ths.length >= 1) {
            if (/senior career/i.test(thLow))                              { inSenior = true;  continue; }
            if (/international career|management|coaching|youth/i.test(thLow)) { inSenior = false; continue; }
            if (/^years?$/i.test(thLow)) continue;
            continue;
        }

        // ── Career data rows: th = year range, td[0] = team, td[1] = apps (gls) ──
        if (inSenior && $tds.length >= 2 && $ths.length >= 1) {
            const yearRaw = thRaw.replace(/[–—–—]/g, '-').trim();
            if (/^\d{4}/.test(yearRaw)) {
                const teamEl = $tds.eq(0).clone();
                teamEl.find('sup').remove();
                const teamRaw  = teamEl.text().trim().replace(/\[.*?\]/g, '');
                const isLoan   = /loan|→/.test(teamRaw);
                const teamName = teamRaw.replace(/→\s*/g, '').replace(/\s*\(loan\)\s*/gi, '').trim();

                // Goals: td[2]="(16)" or td[1]="41 (16)" depending on table format
                const gEl2 = $tds.eq(2).clone(); gEl2.find('sup').remove();
                const gEl1 = $tds.eq(1).clone(); gEl1.find('sup').remove();
                const td2txt = gEl2.text().trim();
                const td1txt = gEl1.text().trim();
                // Prefer td[2] which is just the goals "(16)", fallback to td[1] "41 (16)"
                const goalsSrc = /\d/.test(td2txt) ? td2txt : td1txt;
                const goalsMatch = goalsSrc.match(/\((\d+)\)/) || goalsSrc.match(/^(\d+)$/);
                const entryGoals = goalsMatch ? parseInt(goalsMatch[1]) : 0;

                // Only count goals for non-loan senior club entries
                if (!isLoan) totalGoals += entryGoals;

                const seasons = expandYearsToSeasons(yearRaw);
                if (teamName && seasons.length > 0) {
                    for (const season of seasons) {
                        const league = lookupLeague(teamName);
                        result.career_history.push({
                            season,
                            club_id:        null,
                            club_name:      teamName,
                            league_id:      null,
                            league_name:    league.league_name,
                            league_country: league.league_country,
                        });
                    }
                }
                continue;
            }
        }

        // ── Standard infobox fields (th label + td value) ─────────────────
        if ($tds.length >= 1) {
            if (/date of birth|born/i.test(thLow)) {
                const bday = $tds.first().find('.bday').text().trim();
                result.birth_date = bday || parseDob(cleanText($tds.first()));
            }
            if (/place of birth/i.test(thLow)) {
                const text  = cleanText($tds.first()).replace(/\[.*?\]/g, '').trim();
                const parts = text.split(',').map(p => p.trim()).filter(Boolean);
                result.birth_country = parts[parts.length - 1] || null;
            }
            if (/^height$/i.test(thLow)) {
                const t   = cleanText($tds.first());
                const mM  = t.match(/(\d+\.?\d*)\s*m\b/);
                const cmM = t.match(/(\d+)\s*cm\b/);
                if (mM)       result.height = `${Math.round(parseFloat(mM[1]) * 100)} cm`;
                else if (cmM) result.height = `${cmM[1]} cm`;
            }
            if (/^position/i.test(thLow)) {
                result.position = normalizePosition(cleanText($tds.first()));
            }
        }
    }

    result.total_career_club_goals = totalGoals > 0 ? totalGoals : null;
    return result;
}

// ── STAR_PLAYERS for shared_dressing_rooms ────────────────────────────────────

const STAR_PLAYERS = new Set([
    "Lionel Messi", "Cristiano Ronaldo", "Kylian Mbappé", "Erling Haaland",
    "Vinicius Junior", "Vinícius Júnior", "Jude Bellingham", "Pedri",
    "Lamine Yamal", "Phil Foden", "Bukayo Saka", "Rodri",
    "Mohamed Salah", "Kevin De Bruyne", "Neymar", "Harry Kane",
    "Gavi", "Leroy Sané", "Jamal Musiala", "Florian Wirtz",
    "Federico Valverde", "Toni Kroos", "Luka Modrić", "Casemiro",
    "Marcus Thuram", "Antoine Griezmann", "Ousmane Dembélé",
    "Romelu Lukaku", "Declan Rice", "Bernardo Silva",
    "Bruno Fernandes", "Rúben Dias", "Virgil van Dijk",
    "Alisson", "Éderson", "Manuel Neuer", "Marc-André ter Stegen",
    "Robert Lewandowski", "Trent Alexander-Arnold",
    "Achraf Hakimi", "Theo Hernández", "Dani Carvajal",
    "Richarlison", "Gabriel Martinelli", "Rodrygo",
    "Son Heung-min", "Kaoru Mitoma",
    "Alexis Mac Allister", "Julián Álvarez", "Lisandro Martínez",
    "Ángel Di María", "Paulo Dybala",
    "Raphinha", "Rúben Dias", "Diogo Jota", "Bernardo Silva",
]);

function buildSharedDressingRooms(player, byName) {
    const shared = new Set();
    for (const entry of (player.career_history || [])) {
        for (const starName of STAR_PLAYERS) {
            if (starName === player.name) continue;
            const star = byName[starName];
            if (!star) continue;
            const overlaps = (star.career_history || []).some(
                e => e.club_name === entry.club_name && e.season === entry.season
            );
            if (overlaps) shared.add(starName);
        }
    }
    return [...shared];
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
    console.log('🌍 WC2026 Squad Scraper — Wikipedia\n');

    // Load progress (keyed by wiki_path or player name)
    let progress = {};
    if (fs.existsSync(PROGRESS_FILE)) {
        try {
            progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
            console.log(`📂 Reprise: ${Object.keys(progress).length} joueurs en cache progress\n`);
        } catch (_) { progress = {}; }
    }

    // Step 1: Fetch & parse squads page
    console.log('📋 Fetching squads page...');
    const squadsHtml = await fetchCached(SQUADS_URL);
    const $squads    = cheerio.load(squadsHtml);
    const teams      = parseSquadsPage($squads);

    if (teams.length === 0) {
        console.error('❌ Aucune équipe trouvée. Vérifiez la structure de la page.');
        process.exit(1);
    }
    const total = teams.reduce((s, t) => s + t.players.length, 0);
    console.log(`✅ ${teams.length} équipes, ${total} joueurs\n`);

    // Step 2: For each player, fetch their page if not cached
    const allPlayers = [];

    for (const { team, players } of teams) {
        const confederation = CONFEDERATIONS[team] || null;
        process.stdout.write(`\n── ${team} (${players.length}) `);

        for (const sq of players) {
            const progressKey = sq.wiki_path || sq.name;

            if (progress[progressKey]) {
                allPlayers.push(progress[progressKey]);
                process.stdout.write('·');
                continue;
            }

            let infoboxData = { birth_date: sq.birth_date, birth_country: null, height: null, position: sq.position, career_history: [] };

            if (sq.wiki_path) {
                const url = `https://en.wikipedia.org${sq.wiki_path}`;
                try {
                    const html = await fetchCached(url);
                    const parsed = parsePlayerPage(cheerio.load(html));
                    infoboxData.birth_date             = sq.birth_date    || parsed.birth_date;
                    infoboxData.birth_country          = parsed.birth_country;
                    infoboxData.height                 = parsed.height;
                    infoboxData.position               = sq.position      || parsed.position;
                    infoboxData.career_history         = parsed.career_history;
                    infoboxData.total_career_club_goals = parsed.total_career_club_goals;
                } catch (err) {
                    process.stdout.write('!');
                }
            }

            const currentLeague = lookupLeague(sq.current_club_name);
            const nameParts     = sq.name.split(' ');

            // Compute age from birth_date if not available from squad page
            let computedAge = sq.age;
            if (!computedAge && infoboxData.birth_date) {
                const dob = new Date(infoboxData.birth_date);
                const today = new Date(2026, 5, 11); // WC 2026 date
                computedAge = today.getFullYear() - dob.getFullYear()
                    - (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
            }

            const playerObj = {
                id:                         null,
                name:                       sq.name,
                firstname:                  nameParts[0] || null,
                lastname:                   nameParts.slice(1).join(' ') || null,
                birth_date:                 infoboxData.birth_date || null,
                birth_country:              infoboxData.birth_country || null,
                age:                        computedAge || null,
                position:                   infoboxData.position || null,
                foot:                       null,
                height:                     infoboxData.height || null,
                weight:                     null,
                national_team_id:           null,
                national_team_name:         team,
                national_confederation:     confederation,
                jersey_number_national:     sq.jersey_number_national,
                national_caps:              sq.national_caps,
                national_goals:             sq.national_goals,
                current_club_id:            null,
                current_club_name:          sq.current_club_name,
                current_club_league_id:     null,
                current_club_league_name:   currentLeague.league_name,
                career_history:             infoboxData.career_history,
                total_career_club_goals:    infoboxData.total_career_club_goals || null,
                seasonal_records: {
                    has_scored_20_plus_one_season: null,
                    highest_yellow_cards_season:   null,
                    total_red_cards_career:        null,
                },
                shared_dressing_rooms:      [],
                _meta: {
                    source:     'Wikipedia 2026_FIFA_World_Cup_squads',
                    wiki_path:  sq.wiki_path || null,
                    confidence: 'auto-scraped; caps/goals from squads page; career from player infobox',
                },
            };

            progress[progressKey] = playerObj;
            allPlayers.push(playerObj);

            if (allPlayers.length % 25 === 0) {
                fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
            }
            process.stdout.write('+');
        }
    }
    console.log('\n');

    // Final progress save
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

    // Step 3: shared_dressing_rooms
    console.log('🔗 Computing shared dressing rooms...');
    const byName = {};
    for (const p of allPlayers) byName[p.name] = p;
    for (const p of allPlayers) {
        p.shared_dressing_rooms = buildSharedDressingRooms(p, byName);
    }

    // Step 4: Write output
    fs.writeFileSync(OUT_FILE, JSON.stringify(allPlayers, null, 2));

    const withCareer = allPlayers.filter(p => p.career_history.length > 0).length;
    const withLeague = allPlayers.filter(p => p.current_club_league_name).length;
    console.log(`✅ ${allPlayers.length} joueurs → ${OUT_FILE}`);
    console.log(`📊 Avec carrière: ${withCareer}/${allPlayers.length}`);
    console.log(`📊 Club/ligue mappé: ${withLeague}/${allPlayers.length}`);
    console.log(`💾 Cache: ${fs.readdirSync(CACHE_DIR).length} pages`);
}

main().catch(err => {
    console.error('\n❌ Erreur fatale:', err.message);
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify({}, null, 2));
    process.exit(1);
});
