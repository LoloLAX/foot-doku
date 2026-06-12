// debug_match.js — diagnostique le matching France Wikipedia vs DB
const axios   = require('axios');
const cheerio = require('cheerio');

const DB_PATH = './database_scrape.js';
delete require.cache[require.resolve(DB_PATH)];
const PLAYERS_DB = require(DB_PATH);

const HEADERS = { 'User-Agent': 'Mozilla/5.0' };

async function main() {
    // 1. Affiche les 5 premiers joueurs France dans la DB
    const france_db = PLAYERS_DB.filter(j => j.nationality_selection === 'France');
    console.log(`\n=== DB France (${france_db.length} joueurs) ===`);
    france_db.slice(0, 5).forEach(j => {
        const buf = Buffer.from(j.name);
        console.log(`  "${j.name}" — bytes: ${buf.slice(0,10).toString('hex')}`);
    });

    // 2. Fetch Wikipedia France et affiche les 5 premiers joueurs extraits
    const url = 'https://en.wikipedia.org/wiki/France_national_football_team';
    const res = await axios.get(url, { headers: HEADERS });
    const $ = cheerio.load(res.data);

    console.log(`\n=== Wikipedia France ===`);

    let count = 0;
    $('table.wikitable').each((_, table) => {
        if (count >= 5) return;
        const headers = [];
        $(table).find('tr').first().find('th').each((_, th) => {
            headers.push($(th).text().trim().toLowerCase());
        });
        if (!headers.includes('caps') || !headers.includes('club')) return;

        const idxPlayer = headers.indexOf('player');
        const idxClub   = headers.indexOf('club');
        console.log(`  Headers trouvés: [${headers.join(' | ')}]`);
        console.log(`  idxPlayer=${idxPlayer}, idxClub=${idxClub}`);

        $(table).find('tr').each((i, row) => {
            if (i === 0 || count >= 5) return;
            const cells = $(row).find('td');
            if (cells.length < 3) return;

            const offset = Math.max(0, headers.length - cells.length);

            const texte = (idx) => {
                const ri = idx - offset;
                if (ri < 0 || ri >= cells.length) return '';
                const cell = $(cells[ri]).clone();
                cell.find('span[style*="display:none"], span.sortkey').remove();
                return cell.text().trim();
            };

            const player = texte(idxPlayer);
            const club   = texte(idxClub);

            if (!player) return;
            // Affiche TOUTES les cellules pour voir la structure réelle
            const toutesLesCells = [];
            cells.each((ci, cell) => {
                const txt = $(cell).clone().find('span[style*="display:none"], span.sortkey').remove().end().text().trim().slice(0, 25);
                toutesLesCells.push(`[${ci}]="${txt}"`);
            });
            console.log(`  headers=${headers.length} cells=${cells.length} offset=${offset}`);
            console.log(`  ${toutesLesCells.join(' | ')}`);
            count++;
        });
    });
}

main().catch(console.error);
