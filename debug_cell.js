const DB = require('./database_scrape.js');

// Brésiliens dans la DB et leurs championnats
const brésiliens = DB.filter(j => j.nationality_selection === 'Brazil');
console.log(`\nBrésiliens : ${brésiliens.length}`);
const ligues = {};
brésiliens.forEach(j => { ligues[j.league_current || '(null)'] = (ligues[j.league_current || '(null)'] || 0) + 1; });
Object.entries(ligues).sort((a,b) => b[1]-a[1]).forEach(([l,n]) => console.log(`  ${n}x ${l}`));

// Joueurs Bundesliga
const bund = DB.filter(j => j.league_current === 'Bundesliga');
console.log(`\nJoueurs Bundesliga : ${bund.length}`);
const pays = {};
bund.forEach(j => { pays[j.nationality_selection] = (pays[j.nationality_selection] || 0) + 1; });
Object.entries(pays).sort((a,b) => b[1]-a[1]).slice(0, 10).forEach(([p,n]) => console.log(`  ${n}x ${p}`));

// Croisement Bundesliga × Brazil
const cross = DB.filter(j => j.nationality_selection === 'Brazil' && j.league_current === 'Bundesliga');
console.log(`\nBrésil × Bundesliga : ${cross.length}`);
cross.forEach(j => console.log(`  ${j.name} — ${j.club_current}`));
