// extract-pools.js — Extrait les pools de generateur.js et les sauvegarde en JSON
const fs = require('fs');

const code = fs.readFileSync('./generateur.js', 'utf-8');
const ENCODING = 'utf-8';

// Fonction pour extraire un array d'une ligne "const NAME = [...];"
function extractArray(name) {
    const regex = new RegExp(`const ${name}\\s*=\\s*(\\[.*?\\]);`, 's');
    const match = code.match(regex);
    if (!match) throw new Error(`Impossible de trouver ${name}`);

    // Évaluer l'array
    try {
        return eval(match[1]);
    } catch (e) {
        console.error(`Erreur en évaluant ${name}:`, e.message);
        throw e;
    }
}

try {
    const CLUBS       = extractArray('CLUBS');
    const ANCIENS_CLUBS = extractArray('ANCIENS_CLUBS');
    const CHAMPIONNATS = extractArray('CHAMPIONNATS');
    const SELECTIONS  = extractArray('SELECTIONS');
    const POSTES      = extractArray('POSTES');
    const NAISSANCES  = extractArray('NAISSANCES');
    const LETTRES     = extractArray('LETTRES');
    const STATS       = extractArray('STATS');

    const LIGNES_POOL   = [...CLUBS, ...ANCIENS_CLUBS, ...CHAMPIONNATS];
    const COLONNES_POOL = [...SELECTIONS, ...POSTES, ...NAISSANCES, ...LETTRES, ...STATS];

    const pools = {
        LIGNES_POOL,
        COLONNES_POOL
    };

    fs.writeFileSync('./pools.json', JSON.stringify(pools, null, 2), 'utf-8');
    console.log('✅ pools.json généré !');
    console.log(`   LIGNES: ${LIGNES_POOL.length} éléments`);
    console.log(`   COLONNES: ${COLONNES_POOL.length} éléments`);
} catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
}
