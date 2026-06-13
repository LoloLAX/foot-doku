// core/grid-engine.js
// Logique de génération et de validation de grilles 3x3, générique et
// paramétrée par la config d'un thème (cf. themes/<theme>/config.json).

import { matchesContrainte } from './matcher.mjs';

const MIN_SOL = 3;
const MAX_SOL = 40;

/**
 * Retourne toutes les entités qui satisfont une contrainte.
 */
export function getSolutions(contrainte, entites, config) {
  return entites.filter(e => matchesContrainte(e, contrainte, config));
}

/**
 * Compte les entités qui satisfont une contrainte.
 */
export function nbSolutions(contrainte, entites, config) {
  return entites.reduce((count, e) =>
    count + (matchesContrainte(e, contrainte, config) ? 1 : 0), 0
  );
}

/**
 * Vérifie que la diversité d'un trio lignes/colonnes respecte les règles
 * du thème (évite les grilles trop faciles, ex: 3 championnats au foot).
 *
 * config.diversityRules = { typeLigne, typeColonne } : fonctions
 * (valeur, config) => string, qui catégorisent une contrainte.
 *
 * Les règles ci-dessous reprennent celles du foot (generateur.js) :
 * - pas 3 lignes de type "ligue"
 * - pas 3 colonnes de type "poste"
 * - au moins 1 colonne de type "selection"
 * À généraliser par thème dans une phase ultérieure si besoin.
 */
export function diversiteOK(lignes, colonnes, config) {
  const { typeLigne, typeColonne } = config.diversityRules || {};
  if (!typeLigne || !typeColonne) return true;

  const typesL = lignes.map(l => typeLigne(l, config));
  const typesC = colonnes.map(c => typeColonne(c, config));

  if (typesL.length === 3 && typesL.filter(t => t === 'ligue').length === 3) return false;
  if (typesC.filter(t => t === 'poste').length >= 3) return false;
  if (typesC.length === 3 && !typesC.includes('selection')) return false;

  return true;
}

/**
 * Génère une grille 3x3 valide : pour chaque case (ligne x colonne),
 * MIN_SOL <= nbSolutions <= MAX_SOL, en favorisant les grilles équilibrées
 * (score = minSol*2 + (MAX_SOL - maxSol)).
 *
 * Retourne { lignes, colonnes, minSol, maxSol, score }.
 */
export function genererGrilleParfaite(entites, config, maxTentatives = 200) {
  const colonnesPool = extrairePool(config, config.colonnesPool);
  const lignesPool = extrairePool(config, config.lignesPool);

  let meilleureGrille = null;
  let meilleurScore = -Infinity;

  for (let attempt = 0; attempt < maxTentatives; attempt++) {
    const colonnes = tirerAleatoires(colonnesPool, 3);
    if (!diversiteOK([], colonnes, config)) continue;

    const lignesValides = lignesPool.filter(ligne =>
      colonnes.every(col => {
        const n = nbSolutions2(ligne, col, entites, config);
        return n >= MIN_SOL && n <= MAX_SOL;
      })
    );
    if (lignesValides.length < 3) continue;

    const lignes = tirerAleatoires(lignesValides, 3);
    if (!diversiteOK(lignes, colonnes, config)) continue;

    let minSol = Infinity, maxSol = 0;
    for (const ligne of lignes) {
      for (const col of colonnes) {
        const n = nbSolutions2(ligne, col, entites, config);
        minSol = Math.min(minSol, n);
        maxSol = Math.max(maxSol, n);
      }
    }

    const score = minSol * 2 + (MAX_SOL - maxSol);
    if (score > meilleurScore) {
      meilleurScore = score;
      meilleureGrille = { lignes, colonnes, minSol, maxSol, score };
    }
  }

  if (!meilleureGrille) {
    throw new Error(`Impossible de générer une grille après ${maxTentatives} tentatives`);
  }
  return meilleureGrille;
}

/**
 * Vérifie qu'une grille remplie (3x3 d'entités) est valide : chaque entité
 * satisfait sa ligne et sa colonne, et aucune entité n'est utilisée deux fois.
 *
 * grille = { lignes: [...], colonnes: [...], grille: [[entite x3] x3] }
 */
export function verifierReponse(grille, config) {
  const { lignes, colonnes, grille: matrix } = grille;

  if (!matrix || matrix.length !== 3 || matrix.some(row => !row || row.length !== 3)) {
    return { valid: false, error: 'Grille mal formée' };
  }

  const nomsUtilises = new Set();

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const entite = matrix[i][j];
      const ligne = lignes[i];
      const colonne = colonnes[j];

      if (!matchesContrainte(entite, ligne, config) || !matchesContrainte(entite, colonne, config)) {
        return { valid: false, error: `${entite.name} ne satisfait pas ${ligne} x ${colonne}` };
      }

      if (nomsUtilises.has(entite.name)) {
        return { valid: false, error: `${entite.name} utilisé plusieurs fois` };
      }
      nomsUtilises.add(entite.name);
    }
  }

  return { valid: true };
}

// ── Helpers ──────────────────────────────────────────────────────────────

function nbSolutions2(ligne, colonne, entites, config) {
  return entites.reduce((count, e) =>
    count + (matchesContrainte(e, ligne, config) && matchesContrainte(e, colonne, config) ? 1 : 0), 0
  );
}

function extrairePool(config, poolNames) {
  const result = [];
  for (const poolName of poolNames) {
    if (config.pools[poolName]) {
      result.push(...config.pools[poolName].map(p => p.value));
    }
  }
  return result;
}

function tirerAleatoires(array, count) {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
