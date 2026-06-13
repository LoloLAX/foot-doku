import { genererGrilleParfaite, getSolutions } from './core/grid-engine.mjs';
import fs from 'fs';

const configRaw = JSON.parse(fs.readFileSync('./themes/geography/config.json', 'utf-8'));
const rules = {};
for (const [prefix, funcStr] of Object.entries(configRaw.rulesSource || {})) {
  rules[prefix] = (0, eval)(`(${funcStr})`);
}
const diversityRules = {};
for (const [name, funcStr] of Object.entries(configRaw.diversityRulesSource || {})) {
  diversityRules[name] = (0, eval)(`(${funcStr})`);
}
const config = { ...configRaw, rules, diversityRules };

const countries = JSON.parse(fs.readFileSync('./themes/geography/data.json', 'utf-8'));

console.log('\n=== TEST grid-engine.mjs (Geo-Doku) ===\n');

console.log('Test 1: getSolutions("Europe")');
const solutionsEurope = getSolutions('Europe', countries, config);
console.log(`✅ ${solutionsEurope.length} pays en Europe\n`);

console.log('Test 2: genererGrilleParfaite()');
try {
  const grille = genererGrilleParfaite(countries, config, 100);
  console.log(`✅ Grille générée avec score ${grille.score}`);
  console.log(`   Lignes: ${grille.lignes.join(', ')}`);
  console.log(`   Colonnes: ${grille.colonnes.join(', ')}\n`);

  console.log('=== RÉSULTAT ===');
  console.log('✅ Phase 1.4b VALIDÉE (Geo-Doku)!\n');
} catch (err) {
  console.error(`❌ Erreur: ${err.message}\n`);
  process.exit(1);
}
