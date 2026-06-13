import {
  getSolutions,
  nbSolutions,
  genererGrilleParfaite,
  verifierReponse
} from './core/grid-engine.mjs';
import { _nameLetters } from './core/matcher.mjs';
import fs from 'fs';

// Charger la config du thème football
const configRaw = JSON.parse(fs.readFileSync('./themes/football/config.json', 'utf-8'));

globalThis._nameLetters = _nameLetters;

const rules = {};
for (const [prefix, funcStr] of Object.entries(configRaw.rulesSource)) {
  rules[prefix] = (0, eval)(`(${funcStr})`);
}

const diversityRules = {};
for (const [name, funcStr] of Object.entries(configRaw.diversityRulesSource)) {
  diversityRules[name] = (0, eval)(`(${funcStr})`);
}

const config = { ...configRaw, rules, diversityRules };

// Charger PLAYERS_DB depuis data_browser.js
const dataSrc = fs.readFileSync('./data_browser.js', 'utf-8');
const match = dataSrc.match(/const PLAYERS_DB = (\[[\s\S]*?\]);/);
const PLAYERS_DB = (0, eval)(match[1]);

console.log('\n=== TEST grid-engine.mjs ===\n');

let passed = 0;
let failed = 0;

function check(description, condition) {
  const status = condition ? '✅' : '❌';
  if (condition) passed++; else failed++;
  console.log(`${status} ${description}`);
}

// Test 1 : getSolutions / nbSolutions
const solsFrance = getSolutions('France', PLAYERS_DB, config);
check(`getSolutions('France', ...) renvoie des joueurs (${solsFrance.length})`, solsFrance.length > 0);
check(`nbSolutions('France', ...) === getSolutions(...).length`,
  nbSolutions('France', PLAYERS_DB, config) === solsFrance.length);

// Test 2 : genererGrilleParfaite
const grilleParfaite = genererGrilleParfaite(PLAYERS_DB, config, 200);
check('genererGrilleParfaite() renvoie 3 lignes et 3 colonnes',
  grilleParfaite.lignes.length === 3 && grilleParfaite.colonnes.length === 3);
check('genererGrilleParfaite() respecte minSol >= 3 et maxSol <= 40',
  grilleParfaite.minSol >= 3 && grilleParfaite.maxSol <= 40);

console.log(`   Lignes: ${grilleParfaite.lignes.join(' / ')}`);
console.log(`   Colonnes: ${grilleParfaite.colonnes.join(' / ')}`);
console.log(`   minSol=${grilleParfaite.minSol}, maxSol=${grilleParfaite.maxSol}, score=${grilleParfaite.score}\n`);

// Test 3 : verifierReponse
const matrix = [];
const utilises = new Set();
for (const ligne of grilleParfaite.lignes) {
  const row = [];
  for (const colonne of grilleParfaite.colonnes) {
    const joueur = PLAYERS_DB.find(p =>
      !utilises.has(p.name) &&
      matchesViaConfig(p, ligne) &&
      matchesViaConfig(p, colonne)
    );
    if (joueur) utilises.add(joueur.name);
    row.push(joueur);
  }
  matrix.push(row);
}

function matchesViaConfig(entite, contrainte) {
  // ré-implémentation locale équivalente à matchesContrainte pour le test
  return getSolutions(contrainte, [entite], config).length === 1;
}

const grilleComplete = { lignes: grilleParfaite.lignes, colonnes: grilleParfaite.colonnes, grille: matrix };
const allFilled = matrix.every(row => row.every(c => c));

if (allFilled) {
  const verif = verifierReponse(grilleComplete, config);
  check('verifierReponse() valide une grille correcte', verif.valid === true);
} else {
  console.log('⚠️  Grille générée non entièrement remplissable avec joueurs uniques, test verifierReponse() ignoré');
}

console.log(`\n=== RÉSULTAT ===`);
console.log(`✅ Passés: ${passed}/${passed + failed}`);
if (failed > 0) {
  console.log(`❌ Échoués: ${failed}/${passed + failed}`);
  process.exit(1);
} else {
  console.log(`✅ Phase 1.4 VALIDÉE!\n`);
  process.exit(0);
}
