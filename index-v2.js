// index-v2.js
// Module générique pour charger un thème (config + données) et exposer
// les fonctions du moteur générique (core/matcher.mjs, core/grid-engine.mjs)
// sans toucher au jeu Foot-Doku existant.

import { matchesContrainte, _nameLetters, getDisplayLabel } from './core/matcher.mjs';
import {
  genererGrilleParfaite,
  getSolutions,
  verifierReponse
} from './core/grid-engine.mjs';

globalThis._nameLetters = _nameLetters;

let currentTheme = 'football';
let currentConfig = null;
let currentEntities = null; // joueurs, pays, etc.

/**
 * Charge un thème (config + données)
 */
export async function loadTheme(themeName) {
  console.log(`Loading theme: ${themeName}`);

  try {
    // Charger config
    const configRaw = await fetch(`themes/${themeName}/config.json`).then(r => {
      if (!r.ok) throw new Error(`config.json introuvable (${r.status})`);
      return r.json();
    });

    // Convertir les règles (strings) en vraies fonctions
    const rules = {};
    for (const [prefix, funcStr] of Object.entries(configRaw.rulesSource || {})) {
      rules[prefix] = (0, eval)(`(${funcStr})`);
    }
    const diversityRules = {};
    for (const [name, funcStr] of Object.entries(configRaw.diversityRulesSource || {})) {
      diversityRules[name] = (0, eval)(`(${funcStr})`);
    }
    const config = { ...configRaw, rules, diversityRules };

    // Charger données
    let entities;
    if (themeName === 'football') {
      // Pour foot: utiliser data_browser.js existant (déjà chargé sur window)
      entities = window.PLAYERS_DB || [];
    } else {
      // Pour autres thèmes: charger themes/{themeName}/data.json
      entities = await fetch(`themes/${themeName}/data.json`).then(r => {
        if (!r.ok) throw new Error(`data.json introuvable (${r.status})`);
        return r.json();
      });
    }

    currentTheme = themeName;
    currentConfig = config;
    currentEntities = entities;

    console.log(`✅ Theme ${themeName} loaded (${entities.length} entities)`);
    return { config, entities };

  } catch (err) {
    console.error(`❌ Failed to load theme ${themeName}:`, err);
    throw err;
  }
}

/**
 * Génère une nouvelle grille (pour le thème actuel)
 */
export function generateNewGrid() {
  if (!currentConfig || !currentEntities) {
    throw new Error('Theme not loaded');
  }
  return genererGrilleParfaite(currentEntities, currentConfig);
}

/**
 * Obtient les solutions pour une contrainte (pour l'UI créateur)
 */
export function getSolutionsForConstraint(contrainte) {
  if (!currentConfig || !currentEntities) return [];
  return getSolutions(contrainte, currentEntities, currentConfig);
}

/**
 * Vérifie une réponse utilisateur
 */
export function checkAnswer(grille) {
  if (!currentConfig) {
    throw new Error('Theme not loaded');
  }
  return verifierReponse(grille, currentConfig);
}

/**
 * Exporte les globales pour que index.html les utilise
 */
export function getGlobals() {
  return {
    matchesContrainte: (entite, contrainte) => matchesContrainte(entite, contrainte, currentConfig),
    getDisplayLabel: (contrainte) => getDisplayLabel(contrainte, currentConfig),
    getSolutions: getSolutionsForConstraint,
    generateNewGrid,
    checkAnswer,
    currentConfig,
    currentEntities,
    currentTheme
  };
}
