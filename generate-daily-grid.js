// generate-daily-grid.js — Génère une grille du jour aléatoire
// Usage : node generate-daily-grid.js
// À lancer automatiquement chaque jour à 8h via GitHub Actions

const fs = require('fs');
const path = require('path');

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function loadPools() {
    const poolsPath = path.join(__dirname, 'pools.json');
    const poolsData = JSON.parse(fs.readFileSync(poolsPath, 'utf-8'));
    return {
        LIGNES_POOL: poolsData.LIGNES_POOL,
        COLONNES_POOL: poolsData.COLONNES_POOL
    };
}

function generateDailyGrid() {
    try {
        const { LIGNES_POOL, COLONNES_POOL } = loadPools();

        if (!Array.isArray(LIGNES_POOL) || !Array.isArray(COLONNES_POOL)) {
            throw new Error('Les pools ne sont pas des arrays');
        }

        if (LIGNES_POOL.length === 0 || COLONNES_POOL.length === 0) {
            throw new Error('Pools vides');
        }

        // Générer une grille aléatoire
        const lignes = [];
        const colonnes = [];

        for (let i = 0; i < 3; i++) {
            let ligne;
            do {
                ligne = getRandomElement(LIGNES_POOL);
            } while (lignes.includes(ligne));
            lignes.push(ligne);
        }

        for (let i = 0; i < 3; i++) {
            let colonne;
            do {
                colonne = getRandomElement(COLONNES_POOL);
            } while (colonnes.includes(colonne));
            colonnes.push(colonne);
        }

        const grille = {
            lignes: lignes,
            colonnes: colonnes,
            publieLe: new Date().toLocaleDateString('fr-FR'),
            generatedAt: new Date().toISOString()
        };

        // Écrire dans grille-du-jour.json
        fs.writeFileSync(path.join(__dirname, 'grille-du-jour.json'), JSON.stringify(grille, null, 2), 'utf-8');

        console.log('✅ Grille du jour générée !');
        console.log('   Lignes :', lignes);
        console.log('   Colonnes :', colonnes);
        console.log('   Fichier : grille-du-jour.json');
    } catch (error) {
        console.error('❌ Erreur :', error.message);
        process.exit(1);
    }
}

generateDailyGrid();
