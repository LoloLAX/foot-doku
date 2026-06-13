import { matchesContrainte, _nameLetters } from './core/matcher.mjs';
import fs from 'fs';

// Charger la config du thème football
const configRaw = JSON.parse(fs.readFileSync('./themes/football/config.json', 'utf-8'));

// Convertir les règles (strings) en vraies fonctions.
// _nameLetters est exposée globalement pour les règles qui en ont besoin.
globalThis._nameLetters = _nameLetters;
const rules = {};
for (const [prefix, funcStr] of Object.entries(configRaw.rulesSource)) {
  rules[prefix] = (0, eval)(`(${funcStr})`);
}
const config = { ...configRaw, rules };

// Joueur de test (Mbappé)
const joueur = {
  name: "Kylian Mbappé",
  nationality_selection: "France",
  position: "Attaquant",
  club_current: "Paris Saint-Germain",
  league_current: "Ligue 1",
  birth_country: "France",
  caps: 60,
  goals_selection: 45,
  age: 25,
  clubs_historique: ["AS Monaco", "Paris Saint-Germain"]
};

console.log('\n=== TEST matchesContrainte() ===\n');

const tests = [
  [joueur, 'France', true, "Sélection France"],
  [joueur, 'Attaquant', true, "Poste Attaquant"],
  [joueur, 'Né en France', true, "Lieu de naissance"],
  [joueur, 'Lettre K', true, "Première lettre K"],
  [joueur, '50+ sélections', true, "Seuil sélections (60)"],
  [joueur, 'Allemagne', false, "Sélection Allemagne (faux)"],
  [joueur, 'Ex-AS Monaco', true, "Club historique"],
  [joueur, 'Paris Saint-Germain', true, "Club actuel"],
  [joueur, 'Ligue 1', true, "Championnat actuel"],
];

let passed = 0;
let failed = 0;

for (const [entite, contrainte, expected, description] of tests) {
  const result = matchesContrainte(entite, contrainte, config);
  const status = result === expected ? '✅' : '❌';

  if (result === expected) passed++; else failed++;

  console.log(`${status} ${description}`);
  console.log(`   Contrainte: "${contrainte}" → ${result} (attendu: ${expected})\n`);
}

console.log(`\n=== RÉSULTAT ===`);
console.log(`✅ Passés: ${passed}/${tests.length}`);
if (failed > 0) {
  console.log(`❌ Échoués: ${failed}/${tests.length}`);
  process.exit(1);
} else {
  console.log(`✅ Phase 1.2-1.3 VALIDÉE!\n`);
  process.exit(0);
}
