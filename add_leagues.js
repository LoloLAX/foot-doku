// add_leagues.js — injecte league_current depuis le nom du club
// Usage : node add_leagues.js

const fs = require('fs');
const DB_PATH = './database_scrape.js';

delete require.cache[require.resolve(DB_PATH)];
const PLAYERS_DB = require(DB_PATH);

// ─── MAPPING CLUB → CHAMPIONNAT ──────────────────────────────────────────────

const CLUB_LEAGUE = {

  // Premier League
  "Arsenal": "Premier League",
  "Aston Villa": "Premier League",
  "Bournemouth": "Premier League",
  "Brentford": "Premier League",
  "Brighton": "Premier League",
  "Chelsea": "Premier League",
  "Crystal Palace": "Premier League",
  "Everton": "Premier League",
  "Fulham": "Premier League",
  "Ipswich Town": "Premier League",
  "Leicester City": "Premier League",
  "Liverpool": "Premier League",
  "Manchester City": "Premier League",
  "Manchester United": "Premier League",
  "Newcastle United": "Premier League",
  "Nottingham Forest": "Premier League",
  "Southampton": "Premier League",
  "Tottenham Hotspur": "Premier League",
  "West Ham United": "Premier League",
  "Wolves": "Premier League",
  "Wolverhampton Wanderers": "Premier League",

  // Championship (D2 Angleterre)
  "Burnley": "Championship",
  "Leeds United": "Championship",
  "Middlesbrough": "Championship",
  "Norwich City": "Championship",
  "Queens Park Rangers": "Championship",
  "Sheffield United": "Championship",
  "Sunderland": "Championship",
  "Swansea City": "Championship",
  "West Bromwich Albion": "Championship",

  // La Liga
  "Athletic Bilbao": "La Liga",
  "Atlético Madrid": "La Liga",
  "Barcelona": "La Liga",
  "Betis": "La Liga",
  "Real Betis": "La Liga",
  "Celta Vigo": "La Liga",
  "Getafe": "La Liga",
  "Girona": "La Liga",
  "Las Palmas": "La Liga",
  "Leganés": "La Liga",
  "Mallorca": "La Liga",
  "Osasuna": "La Liga",
  "Rayo Vallecano": "La Liga",
  "Real Madrid": "La Liga",
  "Real Sociedad": "La Liga",
  "Real Valladolid": "La Liga",
  "Sevilla": "La Liga",
  "Valencia": "La Liga",
  "Villarreal": "La Liga",
  "Espanyol": "La Liga",
  "Deportivo Alavés": "La Liga",

  // Bundesliga
  "Bayer Leverkusen": "Bundesliga",
  "Bayern Munich": "Bundesliga",
  "Borussia Dortmund": "Bundesliga",
  "Borussia Mönchengladbach": "Bundesliga",
  "Eintracht Frankfurt": "Bundesliga",
  "Freiburg": "Bundesliga",
  "Hamburger SV": "2. Bundesliga",
  "Hoffenheim": "Bundesliga",
  "Holstein Kiel": "Bundesliga",
  "Augsburg": "Bundesliga",
  "Heidenheim": "Bundesliga",
  "Mainz": "Bundesliga",
  "RB Leipzig": "Bundesliga",
  "SC Freiburg": "Bundesliga",
  "Stuttgart": "Bundesliga",
  "Union Berlin": "Bundesliga",
  "Werder Bremen": "Bundesliga",
  "Wolfsburg": "Bundesliga",
  "St. Pauli": "Bundesliga",
  "Kaiserslautern": "2. Bundesliga",
  "Schalke": "2. Bundesliga",
  "Hertha BSC": "2. Bundesliga",
  "Karlsruher SC": "2. Bundesliga",

  // Serie A
  "AC Milan": "Serie A",
  "Atalanta": "Serie A",
  "Bologna": "Serie A",
  "Cagliari": "Serie A",
  "Como": "Serie A",
  "Empoli": "Serie A",
  "Fiorentina": "Serie A",
  "Genoa": "Serie A",
  "Hellas Verona": "Serie A",
  "Inter Milan": "Serie A",
  "Internazionale": "Serie A",
  "Juventus": "Serie A",
  "Lazio": "Serie A",
  "Lecce": "Serie A",
  "Milan": "Serie A",
  "Monza": "Serie A",
  "Napoli": "Serie A",
  "Parma": "Serie A",
  "Roma": "Serie A",
  "Torino": "Serie A",
  "Udinese": "Serie A",
  "Venezia": "Serie A",

  // Ligue 1
  "Auxerre": "Ligue 1",
  "Brest": "Ligue 1",
  "Le Havre": "Ligue 1",
  "Lens": "Ligue 1",
  "Lille": "Ligue 1",
  "Lyon": "Ligue 1",
  "Marseille": "Ligue 1",
  "Monaco": "Ligue 1",
  "Montpellier": "Ligue 1",
  "Nantes": "Ligue 1",
  "Nice": "Ligue 1",
  "Paris Saint-Germain": "Ligue 1",
  "Reims": "Ligue 1",
  "Rennes": "Ligue 1",
  "Saint-Étienne": "Ligue 1",
  "Strasbourg": "Ligue 1",
  "Toulouse": "Ligue 1",
  "Angers": "Ligue 1",

  // Liga Portugal
  "Benfica": "Liga Portugal",
  "Braga": "Liga Portugal",
  "Estoril": "Liga Portugal",
  "Famalicão": "Liga Portugal",
  "Gil Vicente": "Liga Portugal",
  "Moreirense": "Liga Portugal",
  "Portimonense": "Liga Portugal",
  "Porto": "Liga Portugal",
  "Sporting CP": "Liga Portugal",
  "Vitória SC": "Liga Portugal",

  // Eredivisie
  "Ajax": "Eredivisie",
  "AZ Alkmaar": "Eredivisie",
  "AZ": "Eredivisie",
  "Feyenoord": "Eredivisie",
  "FC Twente": "Eredivisie",
  "Twente": "Eredivisie",
  "NEC Nijmegen": "Eredivisie",
  "PSV Eindhoven": "Eredivisie",
  "PSV": "Eredivisie",
  "Utrecht": "Eredivisie",

  // Pro League (Belgique)
  "Anderlecht": "Pro League",
  "Club Brugge": "Pro League",
  "Gent": "Pro League",
  "Genk": "Pro League",
  "Standard Liège": "Pro League",
  "Union SG": "Pro League",

  // Super Lig (Turquie)
  "Beşiktaş": "Süper Lig",
  "Besiktas": "Süper Lig",
  "Fenerbahçe": "Süper Lig",
  "Fenerbahce": "Süper Lig",
  "Galatasaray": "Süper Lig",
  "Trabzonspor": "Süper Lig",
  "Başakşehir": "Süper Lig",

  // Scottish Premiership
  "Celtic": "Scottish Premiership",
  "Hearts": "Scottish Premiership",
  "Hibernian": "Scottish Premiership",
  "Kilmarnock": "Scottish Premiership",
  "Rangers": "Scottish Premiership",

  // Otras ligas europeas
  "Dynamo Kyiv": "Ukrainian Premier League",
  "Shakhtar Donetsk": "Ukrainian Premier League",
  "Sparta Prague": "Czech First League",
  "Slavia Prague": "Czech First League",
  "Viktoria Plzeň": "Czech First League",
  "Rapid Wien": "Austrian Bundesliga",
  "Red Bull Salzburg": "Austrian Bundesliga",
  "Sturm Graz": "Austrian Bundesliga",
  "Basel": "Swiss Super League",
  "Grasshopper": "Swiss Super League",
  "Servette": "Swiss Super League",
  "Young Boys": "Swiss Super League",
  "Zürich": "Swiss Super League",
  "Dinamo Zagreb": "HNL",
  "Hajduk Split": "HNL",
  "Malmö": "Allsvenskan",
  "Malmö FF": "Allsvenskan",
  "Hammarby": "Allsvenskan",
  "IFK Göteborg": "Allsvenskan",
  "Rosenborg": "Eliteserien",
  "Bodø/Glimt": "Eliteserien",
  "Molde": "Eliteserien",
  "Viking": "Eliteserien",
  "PAOK": "Super League Greece",
  "Olympiacos": "Super League Greece",
  "Red Star Belgrade": "SuperLiga Serbia",
  "Partizan": "SuperLiga Serbia",
  "FCSB": "SuperLiga Romania",

  // Saudi Pro League
  "Al-Ahli": "Saudi Pro League",
  "Al-Ettifaq": "Saudi Pro League",
  "Al-Fateh": "Saudi Pro League",
  "Al-Hilal": "Saudi Pro League",
  "Al-Ittihad": "Saudi Pro League",
  "Al-Nassr": "Saudi Pro League",
  "Al-Qadsiah": "Saudi Pro League",
  "Al-Qadisiyah": "Saudi Pro League",
  "Al-Shabab": "Saudi Pro League",
  "Al-Taawoun": "Saudi Pro League",
  "Al-Wehda": "Saudi Pro League",

  // MLS
  "Atlanta United": "MLS",
  "Austin FC": "MLS",
  "Charlotte FC": "MLS",
  "Chicago Fire": "MLS",
  "Colorado Rapids": "MLS",
  "Columbus Crew": "MLS",
  "D.C. United": "MLS",
  "FC Cincinnati": "MLS",
  "FC Dallas": "MLS",
  "Houston Dynamo": "MLS",
  "Inter Miami": "MLS",
  "LA Galaxy": "MLS",
  "LAFC": "MLS",
  "Los Angeles FC": "MLS",
  "Minnesota United": "MLS",
  "Montreal Impact": "MLS",
  "CF Montréal": "MLS",
  "Nashville SC": "MLS",
  "New England Revolution": "MLS",
  "New York City FC": "MLS",
  "New York Red Bulls": "MLS",
  "Orlando City": "MLS",
  "Philadelphia Union": "MLS",
  "Portland Timbers": "MLS",
  "Real Salt Lake": "MLS",
  "San Jose Earthquakes": "MLS",
  "Seattle Sounders": "MLS",
  "Sporting KC": "MLS",
  "Sporting Kansas City": "MLS",
  "St. Louis City SC": "MLS",
  "Toronto FC": "MLS",
  "Vancouver Whitecaps": "MLS",
  "San Diego FC": "MLS",

  // Liga MX
  "América": "Liga MX",
  "Atlas": "Liga MX",
  "Atlético San Luis": "Liga MX",
  "Chivas": "Liga MX",
  "Cruz Azul": "Liga MX",
  "FC Juárez": "Liga MX",
  "Guadalajara": "Liga MX",
  "León": "Liga MX",
  "Mazatlán": "Liga MX",
  "Monterrey": "Liga MX",
  "Necaxa": "Liga MX",
  "Pachuca": "Liga MX",
  "Pumas UNAM": "Liga MX",
  "Querétaro": "Liga MX",
  "Santos Laguna": "Liga MX",
  "Santos": "Liga MX",
  "Tijuana": "Liga MX",
  "Tigres UANL": "Liga MX",
  "Toluca": "Liga MX",
  "UANL": "Liga MX",
  "UNAM": "Liga MX",

  // Liga Profesional (Argentine)
  "Boca Juniors": "Liga Profesional",
  "Racing": "Liga Profesional",
  "Racing Club": "Liga Profesional",
  "River Plate": "Liga Profesional",
  "San Lorenzo": "Liga Profesional",
  "Estudiantes": "Liga Profesional",
  "Independiente": "Liga Profesional",
  "Lanús": "Liga Profesional",
  "Huracán": "Liga Profesional",
  "Vélez Sársfield": "Liga Profesional",
  "Vélez": "Liga Profesional",
  "Talleres": "Liga Profesional",
  "Defensa y Justicia": "Liga Profesional",
  "Argentinos Juniors": "Liga Profesional",

  // Brasileirão
  "Athletico Paranaense": "Brasileirão",
  "Atlético Mineiro": "Brasileirão",
  "Bahia": "Brasileirão",
  "Botafogo": "Brasileirão",
  "Corinthians": "Brasileirão",
  "Cruzeiro": "Brasileirão",
  "Flamengo": "Brasileirão",
  "Fluminense": "Brasileirão",
  "Fortaleza": "Brasileirão",
  "Grêmio": "Brasileirão",
  "Internacional": "Brasileirão",
  "Palmeiras": "Brasileirão",
  "RB Bragantino": "Brasileirão",
  "Santos": "Brasileirão",
  "São Paulo": "Brasileirão",
  "Vasco da Gama": "Brasileirão",

  // Autres Amériques
  "Nacional": "Primera División Uruguay",
  "Peñarol": "Primera División Uruguay",
  "Olimpia": "División Profesional Paraguay",
  "Cerro Porteño": "División Profesional Paraguay",
  "Barcelona SC": "LigaPro Ecuador",
  "Emelec": "LigaPro Ecuador",
  "Liga de Quito": "LigaPro Ecuador",

  // Moyen-Orient / Asie
  "Al-Ain": "UAE Pro League",
  "Al-Jazira": "UAE Pro League",
  "Al-Sadd": "Qatar Stars League",
  "Al-Duhail": "Qatar Stars League",
  "Al-Rayyan": "Qatar Stars League",
  "Al-Arabi": "Qatar Stars League",
  "Al-Gharafa": "Qatar Stars League",
  "Al-Wakrah": "Qatar Stars League",
  "Persepolis": "Persian Gulf Pro League",
  "Esteghlal": "Persian Gulf Pro League",
  "Sepahan": "Persian Gulf Pro League",
  "Al-Shorta": "Iraqi Premier League",
  "Erbil": "Iraqi Premier League",
  "Faisaly": "Jordan Pro League",
  "Al-Wahdat": "Jordan Pro League",
  "Bunyodkor": "Uzbek Super League",
  "Nasaf": "Uzbek Super League",
  "Pakhtakor": "Uzbek Super League",
  "Lokomotiv Tashkent": "Uzbek Super League",
  "AGMK": "Uzbek Super League",
  "Neftchi Tashkent": "Uzbek Super League",

  // Afrique
  "Al-Ahly": "Egyptian Premier League",
  "Zamalek": "Egyptian Premier League",
  "Wydad AC": "Botola Pro",
  "Raja CA": "Botola Pro",
  "TP Mazembe": "Ligue nationale du football",
  "Espérance Tunis": "Ligue professionnelle 1",
  "Club Africain": "Ligue professionnelle 1",
  "Étoile du Sahel": "Ligue professionnelle 1",
  "MC Alger": "Ligue Professionnelle 1 Algérie",
  "USM Alger": "Ligue Professionnelle 1 Algérie",
  "CR Belouizdad": "Ligue Professionnelle 1 Algérie",
  "Mamelodi Sundowns": "Premier Soccer League",
  "Kaizer Chiefs": "Premier Soccer League",
  "Orlando Pirates": "Premier Soccer League",
  "Asante Kotoko": "Ghana Premier League",
  "Hearts of Oak": "Ghana Premier League",

  // Japon / Corée / Australie
  "Gamba Osaka": "J1 League",
  "Kashima Antlers": "J1 League",
  "Kawasaki Frontale": "J1 League",
  "Urawa Red Diamonds": "J1 League",
  "Vissel Kobe": "J1 League",
  "Yokohama F. Marinos": "J1 League",
  "Jeonbuk": "K League 1",
  "Ulsan": "K League 1",
  "Melbourne City": "A-League",
  "Melbourne Victory": "A-League",
  "Sydney FC": "A-League",
  "Western Sydney Wanderers": "A-League",
  "Wellington Phoenix": "A-League",
  "Central Coast Mariners": "A-League",

  // Autres
  "CFR Cluj": "SuperLiga Romania",
  "Lechia Gdańsk": "Ekstraklasa",
  "Legia Warsaw": "Ekstraklasa",
  "Lech Poznań": "Ekstraklasa",
};

// ─── MAPPING COMPLÉMENTAIRE ───────────────────────────────────────────────────

const CLUB_LEAGUE_EXTRA = {
  // Allemagne — variantes + D2
  "1. FC Heidenheim": "Bundesliga", "1. FC Köln": "Bundesliga", "FC Köln": "Bundesliga",
  "FC Augsburg": "Bundesliga", "FC St. Pauli": "Bundesliga", "TSG Hoffenheim": "Bundesliga",
  "VfB Stuttgart": "Bundesliga", "VfL Wolfsburg": "Bundesliga", "Mainz 05": "Bundesliga",
  "Fortuna Dusseldorf": "2. Bundesliga", "Fortuna Düsseldorf": "2. Bundesliga",
  "Greuther Fürth": "2. Bundesliga", "Hannover 96": "2. Bundesliga",
  "Preußen Münster": "2. Bundesliga", "SV Elversberg": "2. Bundesliga",
  "Darmstadt 98": "2. Bundesliga", "SV Ried": "Austrian Bundesliga",

  // Angleterre — D2/D3
  "Brighton & Hove Albion": "Premier League",
  "Birmingham City": "Championship", "Blackburn Rovers": "Championship",
  "Bristol City": "Championship", "Cardiff City": "Championship",
  "Coventry City": "Championship", "Derby County": "Championship",
  "Hull City": "Championship", "Millwall": "Championship",
  "Oxford United": "Championship", "Plymouth Argyle": "Championship",
  "Portsmouth": "Championship", "Preston North End": "Championship",
  "Rotherham United": "Championship", "Stoke City": "Championship",
  "Watford": "Championship", "Wigan Athletic": "Championship",
  "Wrexham": "League One", "Barnsley": "League One",
  "Charlton Athletic": "League One", "Doncaster Rovers": "League Two",
  "Barnet": "League Two", "Port Vale": "League One",
  "Swindon Town": "League Two",

  // Turquie
  "Alanyaspor": "Süper Lig", "Amedspor": "TFF First League",
  "Antalyaspor": "Süper Lig", "Çaykur Rizespor": "Süper Lig",
  "Eyüpspor": "Süper Lig", "Fatih Karagümrük": "Süper Lig",
  "Gaziantep": "Süper Lig", "Göztepe": "Süper Lig",
  "İstanbul Başakşehir": "Süper Lig", "Kasımpaşa": "Süper Lig",
  "Kayserispor": "Süper Lig", "Kocaelispor": "Süper Lig",
  "Konyaspor": "Süper Lig", "Manisa": "TFF First League",
  "Samsunspor": "Süper Lig",

  // Belgique
  "Antwerp": "Pro League", "Beveren": "Pro League",
  "Cercle Brugge": "Pro League", "Charleroi": "Pro League",
  "Dender": "Pro League", "Eupen": "Pro League",
  "Mechelen": "Pro League", "Sint-Truiden": "Pro League",
  "Union Saint-Gilloise": "Pro League", "Westerlo": "Pro League",
  "Zulte Waregem": "Pro League", "RAAL La Louvière": "Pro League",
  "La Louvière": "Pro League", "Francs Borains": "National Division",
  "RSCA Futures": "Pro League", "RWDM Brussels": "Pro League",

  // Portugal — variantes + D2
  "Estoril Praia": "Liga Portugal", "Alverca": "Liga Portugal 2",
  "Casa Pia": "Liga Portugal", "Chaves": "Liga Portugal",
  "Estrela Amadora": "Liga Portugal", "Farense": "Liga Portugal",
  "Leixões": "Liga Portugal 2", "Paços de Ferreira": "Liga Portugal",
  "Tondela": "Liga Portugal 2", "Torreense": "Liga Portugal 2",
  "União de Leiria": "Liga Portugal 2", "Vizela": "Liga Portugal",
  "Vitória de Guimarães": "Liga Portugal", "Sporting B": "Liga Portugal 2",
  "Vitória SC": "Liga Portugal",

  // Pays-Bas
  "Almere City": "Eredivisie", "Cambuur": "Eredivisie",
  "Den Bosch": "Eerste Divisie", "Dordrecht": "Eerste Divisie",
  "Eindhoven": "Eerste Divisie", "Groningen": "Eredivisie",
  "Heracles Almelo": "Eredivisie", "Jong Ajax": "Eerste Divisie",
  "MVV": "Eerste Divisie", "NAC Breda": "Eredivisie",
  "NEC": "Eredivisie", "PEC Zwolle": "Eerste Divisie",
  "RKC Waalwijk": "Eredivisie", "Sparta Rotterdam": "Eredivisie",
  "Telstar": "Eerste Divisie", "VVV-Venlo": "Eerste Divisie",
  "Volendam": "Eredivisie",

  // Grèce / Chypre
  "AEK Athens": "Super League Greece", "Panathinaikos": "Super League Greece",
  "Omonia": "First Division Cyprus", "APOEL": "First Division Cyprus",
  "Apollon Limassol": "First Division Cyprus", "Aris Limassol": "First Division Cyprus",
  "AEK Larnaca": "First Division Cyprus", "Anorthosis Famagusta": "First Division Cyprus",
  "Pafos": "First Division Cyprus", "A.E. Kifisia": "Super League Greece",
  "Kifisia": "Super League Greece", "Makedonikos": "Super League Greece",

  // Scandinavie
  "AGF": "Superliga Denmark", "Brøndby": "Superliga Denmark",
  "Copenhagen": "Superliga Denmark", "Esbjerg": "Superliga Denmark",
  "Midtjylland": "Superliga Denmark", "Nordsjælland": "Superliga Denmark",
  "OB": "Superliga Denmark", "AIK": "Allsvenskan",
  "GAIS": "Allsvenskan", "Hammarby IF": "Allsvenskan",
  "Häcken": "Allsvenskan", "IFK Norrköping": "Allsvenskan",
  "Mjällby AIF": "Allsvenskan", "Brann": "Eliteserien",
  "Sarpsborg": "Eliteserien", "Tromsø": "Eliteserien",

  // Europe centrale
  "Ferencváros": "OTP Bank Liga", "Győr": "OTP Bank Liga",
  "Puskás Akadémia": "OTP Bank Liga", "LASK": "Austrian Bundesliga",
  "Grazer AK": "Austrian Bundesliga", "Wolfsberger AC": "Austrian Bundesliga",
  "Austria Wien": "Austrian Bundesliga",
  "Slovan Bratislava": "Slovak Super Liga", "Tatran Prešov": "Slovak Super Liga",
  "Sparta Prague": "Czech First League", "Slavia Prague": "Czech First League",
  "Baník Ostrava": "Czech First League", "Hradec Králové": "Czech First League",
  "Jablonec": "Czech First League", "Mladá Boleslav": "Czech First League",
  "Pardubice": "Czech First League", "Sigma Olomouc": "Czech First League",
  "Slovan Liberec": "Czech First League",
  "Cracovia": "Ekstraklasa", "Górnik Zabrze": "Ekstraklasa",
  "Jagiellonia Białystok": "Ekstraklasa", "Widzew Łódź": "Ekstraklasa",
  "Wisła Płock": "Ekstraklasa", "Arka Gdynia": "I liga",
  "Lokomotiva Zagreb": "HNL", "Osijek": "HNL", "Rijeka": "HNL",
  "Slaven Belupo": "HNL", "Dinamo Samarqand": "Uzbek Super League",
  "Navbahor": "Uzbek Super League", "Neftchi": "Uzbek Super League",
  "Sogdiana": "Uzbek Super League", "Surkhon": "Uzbek Super League",
  "Andijon": "Uzbek Super League", "AGMK": "Uzbek Super League",
  "Noah": "Armenian Premier League", "Turan Tovuz": "Azerbaijan Premier League",
  "Žalgiris": "A Lyga", "Auda": "SynotTip Virsliga",
  "Astana": "Kazakhstan Premier League",
  "Ludogorets Razgrad": "efbet League", "Slavia Sofia": "efbet League",
  "Rapid București": "SuperLiga Romania", "Universitatea Cluj": "SuperLiga Romania",
  "FCSB": "SuperLiga Romania", "CFR Cluj": "SuperLiga Romania",
  "Zimbru Chisinau": "Moldovan National Division",
  "Sheriff Tiraspol": "Moldovan National Division",
  "Borac Banja Luka": "Premier League Bosnia", "Sarajevo": "Premier League Bosnia",
  "Velež Mostar": "Premier League Bosnia",

  // Russie
  "Akron Tolyatti": "Russian Premier League", "Baltika Kaliningrad": "Russian Premier League",
  "Dynamo Moscow": "Russian Premier League", "Krasnodar": "Russian Premier League",
  "Lokomotiv Moscow": "Russian Premier League", "Spartak Moscow": "Russian Premier League",
  "Zenit Saint Petersburg": "Russian Premier League",
  "Dynamo Makhachkala": "Russian Premier League",
  "Pari Nizhny Novgorod": "Russian Premier League",

  // Ukraine
  "Chornomorets Odesa": "Ukrainian Premier League",
  "Kryvbas Kryvyi Rih": "Ukrainian Premier League",

  // Afrique
  "AS FAR": "Botola Pro", "FUS Rabat": "Botola Pro",
  "MAS Fès": "Botola Pro", "Raja Casablanca": "Botola Pro",
  "RS Berkane": "Botola Pro", "Wydad Casablanca": "Botola Pro",
  "ASEC Mimosas": "MTN Ligue 1", "Dreams": "Ghana Premier League",
  "Medeama": "Ghana Premier League", "Mount Pleasant": "Ghana Premier League",
  "JS Kabylie": "Ligue Professionnelle 1 Algérie",
  "MC Alger": "Ligue Professionnelle 1 Algérie",
  "USM Alger": "Ligue Professionnelle 1 Algérie",
  "CR Belouizdad": "Ligue Professionnelle 1 Algérie",
  "Olympique Akbou": "Ligue Professionnelle 1 Algérie",
  "CS Constantine": "Ligue Professionnelle 1 Algérie",
  "Espérance de Tunis": "Ligue professionnelle 1",
  "CS Sfaxien": "Ligue professionnelle 1",
  "AS Marsa": "Ligue professionnelle 1",
  "US Monastir": "Ligue professionnelle 1",
  "Stade Tunisien": "Ligue professionnelle 1",
  "Ceramica Cleopatra": "Egyptian Premier League",
  "ENPPI": "Egyptian Premier League",
  "Ghazl El Mahalla": "Egyptian Premier League",
  "National Bank of Egypt": "Egyptian Premier League",
  "Petrojet": "Egyptian Premier League",
  "Pyramids": "Egyptian Premier League",
  "Zamalek": "Egyptian Premier League",
  "AmaZulu": "Premier Soccer League",
  "Chippa United": "Premier Soccer League",
  "Durban City": "Premier Soccer League",
  "Polokwane City": "Premier Soccer League",
  "Sekhukhune United": "Premier Soccer League",
  "Siwelele": "Premier Soccer League",
  "Stellenbosch": "Premier Soccer League",
  "TS Galaxy": "Premier Soccer League",
  "Young Africans": "Tanzania Premier League",

  // Moyen-Orient
  "Abha": "Saudi Pro League", "Ajman": "UAE Pro League",
  "Baniyas": "UAE Pro League", "Damac": "Saudi Pro League",
  "Dibba Al Fujairah": "UAE Pro League", "Khor Fakkan": "UAE Pro League",
  "Kalba": "UAE Pro League", "Neom": "Saudi Pro League",
  "Qatar SC": "Qatar Stars League", "Duhok": "Iraqi Premier League",
  "Zakho": "Iraqi Premier League", "Asswehly": "Libyan Premier League",
  "Modern Sport": "Libyan Premier League",
  "Foolad": "Persian Gulf Pro League", "Gol Gohar": "Persian Gulf Pro League",
  "Mes Rafsanjan": "Persian Gulf Pro League", "Paykan": "Persian Gulf Pro League",
  "Tractor": "Persian Gulf Pro League", "Chadormalou": "Persian Gulf Pro League",
  "Zob Ahan": "Persian Gulf Pro League", "Sabah": "UAE Pro League",
  "Selangor": "Malaysia Super League", "Terengganu": "Malaysia Super League",

  // Asie
  "Albirex Niigata": "J1 League", "FC Tokyo": "J1 League",
  "Kashiwa Reysol": "J1 League", "Machida Zelvia": "J1 League",
  "Nagoya Grampus": "J1 League", "Sanfrecce Hiroshima": "J1 League",
  "Shimizu S-Pulse": "J1 League", "RB Omiya Ardija": "J2 League",
  "Daejeon Hana Citizen": "K League 1", "FC Seoul": "K League 1",
  "Gangwon FC": "K League 1", "Gimcheon Sangmu": "K League 1",
  "Gimpo": "K League 2", "Jeonbuk Hyundai Motors": "K League 1",
  "Pohang Steelers": "K League 1", "Ulsan HD": "K League 1",
  "PSM Makassar": "Liga 1 Indonesia", "Persib": "Liga 1 Indonesia",
  "Bunyodkor": "Uzbek Super League",

  // Amérique du Sud
  "Atlético Nacional": "Liga BetPlay", "Once Caldas": "Liga BetPlay",
  "Deportes Tolima": "Liga BetPlay",
  "Bolívar": "División de Fútbol Profesional", "The Strongest": "División de Fútbol Profesional",
  "Comunicaciones": "Liga Nacional Guatemala",
  "Danubio": "Primera División Uruguay", "Montevideo City Torque": "Primera División Uruguay",
  "Liverpool Montevideo": "Primera División Uruguay",
  "Guaraní": "División Profesional Paraguay", "Libertad": "División Profesional Paraguay",
  "Independiente del Valle": "LigaPro Ecuador",
  "LDU Quito": "LigaPro Ecuador", "Barcelona SC": "LigaPro Ecuador",
  "Newell's Old Boys": "Liga Profesional", "Rosario Central": "Liga Profesional",
  "Independiente Rivadavia": "Liga Profesional",
  "Estudiantes de Mérida": "Liga FUTVE",
  "Monagas": "Liga FUTVE", "Puerto Cabello": "Liga FUTVE",
  "Deportivo": "Liga FUTVE",
  "Cobresal": "Primera División Chile",
  "Universidad Católica": "Primera División Chile",
  "Universidad de Concepción": "Primera División Chile",
  "Real España": "Liga Nacional Honduras",
  "Marathón": "Liga Nacional Honduras", "Motagua": "Liga Nacional Honduras",
  "Atlético Ottawa": "CPL", "Forge": "CPL", "Forge FC": "CPL",
  "Cavalry FC": "CPL", "Calvary FC": "CPL", "Pacific FC": "CPL",
  "Inter Toronto": "CPL",
  "Saprissa": "Liga Promerica", "Plaza Amador": "Liga Panameña",
  "Tauro": "Liga Panameña", "Sporting San Miguelito": "Liga Panameña",
  "Violette": "Haiti Ligue 1", "Victory Boys": "Haiti Ligue 1",

  // Australie
  "Adelaide United": "A-League", "Brisbane Roar": "A-League",
  "Macarthur FC": "A-League", "Perth Glory": "A-League",

  // Israël
  "Maccabi Haifa": "Ligat Ha'Al", "Maccabi Netanya": "Ligat Ha'Al",
  "Maccabi Herzliya": "Ligat Ha'Al", "Ironi Kiryat Shmona": "Ligat Ha'Al",
  "Hapoel Hadera": "Ligat Ha'Al",

  // Autres
  "Shamrock Rovers": "League of Ireland", "Dundee United": "Scottish Premiership",
  "Livingston": "Scottish Premiership", "Heart of Midlothian": "Scottish Premiership",
  "Aberdeen": "Scottish Premiership",
  "Lausanne-Sport": "Swiss Super League", "Lugano": "Swiss Super League",
  "Luzern": "Swiss Super League", "St. Gallen": "Swiss Super League",
  "Winterthur": "Swiss Super League",
  "Sparta Rotterdam": "Eredivisie",
  "SJK": "Veikkausliiga",
  "Metz": "Ligue 2", "Troyes": "Ligue 2", "Bastia": "Ligue 2",
  "Sochaux": "Ligue 2", "Caen": "Ligue 2", "Guingamp": "Ligue 2",
  "Lorient": "Ligue 1", "Frosinone": "Serie B", "Bari": "Serie B",
  "Cremonese": "Serie B", "Sampdoria": "Serie B", "Cesena": "Serie B",
  "Triestina": "Serie C", "Sassuolo": "Serie B",
  "Elche": "La Liga 2", "Granada": "La Liga 2", "Burgos": "La Liga 2",
  "Zaragoza": "La Liga 2", "Oviedo": "La Liga 2", "Huesca": "La Liga 2",
  "Cultural Leonesa": "Primera RFEF", "Sporting Gijón": "La Liga 2",
  "Racing de Santander": "La Liga 2", "Castellón": "La Liga 2",
  "Ibiza Islas Pitiusas": "La Liga 2", "Barcelona Atlètic": "La Liga 2",
  "Barcelona B": "La Liga 2", "Alavés B": "La Liga 2",
  "Atlético": "Liga Profesional",
  "Fursan Hispania": "Saudi Pro League",
  "AV Alta": "Eliteserien", "Brann": "Eliteserien",
  "Häcken": "Allsvenskan",
  "Leinefelde": "Regionalliga",
  "Fleury": "Division 1 Féminine",
  "Nations": null, "Free agent": null, "Unattached": null,
  "University of Louisville": null, "Inter FA": null, "Iberia 1999": null,
  "Qatar": null,
  "Paris": "Ligue 1", "Paris FC": "Ligue 2",

  // MLS variantes
  "New York City": "MLS", "New York Red Bulls II": "MLS",
  "Montréal": "MLS", "San Diego": "MLS", "St. Louis City": "MLS",
  "Sacramento Republic": "USL Championship", "Huntsville City": "USL Championship",
  "El Paso Locomotive": "USL Championship", "Monterey Bay": "USL Championship",
  "Tulsa": "USL Championship", "San Francisco": "USL Championship",
  "San Francisco II": "USL Championship", "Los Angeles FC 2": "MLS Next Pro",
  "Colorado Springs Switchbacks": "USL Championship",
  "Toronto": "MLS", "Nashville": "MLS", "Dallas": "MLS",
  "Cincinnati": "MLS", "Orlando City B": "MLS Next Pro",
  "Miami FC": "USL Championship",

  // Mexique variantes
  "Juárez": "Liga MX", "Puebla": "Liga MX",
  "Jaguares": "Liga MX", "Necaxa": "Liga MX",
  "Monterrey": "Liga MX",

  // Brésil
  "Coritiba": "Brasileirão", "Red Bull Bragantino": "Brasileirão",

  // Pérou / Bolivie
  "Los Chankas": "Liga 1 Peru",
  "Montana": "Uzbek Super League",

  // France D2/D3
  "Nancy": "Ligue 2", "Villefranche": "National",
  "Stade Nyonnais": "National 2",

  // Italie D2
  "Pisa": "Serie B",

  // Espagne D2/D3
  "Albacete": "La Liga 2",

  // Allemagne
  "Schalke 04": "2. Bundesliga",

  // Chypre
  "AEL": "First Division Cyprus", "Krasava Ypsonas": "First Division Cyprus",

  // Ambigus
  "Albion": "Championship", "Dinamo": "HNL",

  // Afrique
  "ZED": "Egyptian Premier League", "Port": "Ghana Premier League",

  // Canada MLS/CPL
  "Atlético Ottawa": "CPL",
};

// Nettoyage des artifacts Wikipedia (footnotes)
function nettoyer(club) {
  if (!club) return null;
  return club
    .replace(/\[.\]$/, '')        // Monaco[a] → Monaco
    .replace(/\s+Youth$/, '')     // PSG Youth → PSG
    .replace(/\s+U\d+$/, '')      // Man Utd U18 → Man Utd
    .replace(/\s+B$/, '')         // Barcelona B → Barcelona... attention aux cas légitimes
    .trim();
}

// ─── RÈGLES PAR PATTERN (fallback pour clubs non listés) ─────────────────────

function deduireChampionnat(clubBrut) {
  if (!clubBrut) return null;

  const club = nettoyer(clubBrut);
  if (!club) return null;

  // Mapping exact
  if (CLUB_LEAGUE[club])       return CLUB_LEAGUE[club];
  if (CLUB_LEAGUE_EXTRA[club]) return CLUB_LEAGUE_EXTRA[club];

  // Essai avec le nom brut aussi
  if (CLUB_LEAGUE[clubBrut])       return CLUB_LEAGUE[clubBrut];
  if (CLUB_LEAGUE_EXTRA[clubBrut]) return CLUB_LEAGUE_EXTRA[clubBrut];

  const c = club.toLowerCase();

  // Patterns saoudiens
  if (c.startsWith('al-') || c.startsWith('al ')) return 'Saudi Pro League';

  // MLS fragments
  if (['toronto', 'dallas', 'cincinnati', 'montreal', 'nashville', 'houston',
       'orlando', 'miami', 'atlanta', 'colorado', 'portland', 'seattle',
       'vancouver', 'minnesota', 'austin', 'charlotte'].some(k => c.includes(k))) return 'MLS';

  return null;
}

// ─── APPLICATION ─────────────────────────────────────────────────────────────

let renseignes = 0;
let inconnus = new Set();

for (const joueur of PLAYERS_DB) {
  if (!joueur.club_current) continue;
  if (joueur.league_current) continue; // déjà renseigné

  const NON_CLUBS = new Set(["Free agent", "Unattached", "Nations", "Inter FA",
    "Iberia 1999", "University of Louisville", "Qatar"]);
  if (NON_CLUBS.has(joueur.club_current)) {
    joueur.club_current = null;
    continue;
  }

  const ligue = deduireChampionnat(joueur.club_current);
  // Aussi nettoyer le nom du club des artifacts Wikipedia
  const clubNettoye = nettoyer(joueur.club_current);
  if (clubNettoye && clubNettoye !== joueur.club_current) joueur.club_current = clubNettoye;
  if (ligue) {
    joueur.league_current = ligue;
    renseignes++;
  } else {
    inconnus.add(joueur.club_current);
  }
}

// Sauvegarde
const avecLigue = PLAYERS_DB.filter(j => j.league_current).length;
const total = PLAYERS_DB.filter(j => j.club_current).length;
const pct = Math.round(avecLigue / PLAYERS_DB.length * 100);

const contenu = `// Effectifs CdM 2026 — enrichi via Wikipedia + mapping clubs
// Mis à jour le : ${new Date().toLocaleDateString('fr-FR')}
// Championnat renseigné : ${avecLigue}/${PLAYERS_DB.length} joueurs (${pct}%)

const PLAYERS_DB = ${JSON.stringify(PLAYERS_DB, null, 2)};

module.exports = PLAYERS_DB;
`;

fs.writeFileSync(DB_PATH, contenu);

console.log(`\n✅ ${renseignes} championnats ajoutés`);
console.log(`📊 Couverture championnat : ${avecLigue}/${PLAYERS_DB.length} (${pct}%)`);

if (inconnus.size > 0) {
  console.log(`\n⚠️  ${inconnus.size} clubs sans championnat connu :`);
  [...inconnus].sort().forEach(c => console.log(`   - ${c}`));
}
