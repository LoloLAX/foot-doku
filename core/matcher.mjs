// core/matcher.mjs
// Moteur de matching générique : valide qu'une entité (joueur, pays, film...)
// satisfait une contrainte donnée, selon les règles fournies par un thème.

/**
 * @param {object} entite - l'entité à tester (ex: un joueur)
 * @param {string} contrainte - la contrainte (ex: "Né en France")
 * @param {object} config - config du thème : { rules, fieldMapping }
 *   - config.rules: { "préfixe ou nom exact": (entite, contrainte) => boolean }
 *   - config.fieldMapping: { "champ_entite": "Libellé UI" }
 */
export function matchesContrainte(entite, contrainte, config) {
  if (!contrainte) return false;

  // OU logique : composition générique, valable pour tous les thèmes
  if (contrainte.includes(' OU ')) {
    return contrainte.split(' OU ').some(p =>
      matchesContrainte(entite, p.trim(), config)
    );
  }

  // Règles spécifiques au thème (préfixes ou valeurs exactes)
  if (config.rules) {
    for (const [prefix, rule] of Object.entries(config.rules)) {
      if (contrainte.startsWith(prefix)) {
        return rule(entite, contrainte);
      }
    }
  }

  // Fallback : égalité directe sur un champ mappé du thème
  if (config.fieldMapping) {
    for (const field of Object.keys(config.fieldMapping)) {
      if (entite[field] === contrainte) return true;
    }
  }

  return false;
}

/**
 * Extrait les lettres (A-Z, sans accents) du nom d'une entité.
 */
export function _nameLetters(name) {
  return name
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toUpperCase().split('').filter(c => /[A-Z]/.test(c));
}

/**
 * Retourne un libelle lisible pour une contrainte (ex: "20M-60M" -> "Population: 20M-60M").
 * Cherche la contrainte dans les pools du theme pour determiner sa categorie,
 * puis utilise config.displayLabels[pool][valeur] si defini, sinon le label du pool,
 * sinon la valeur brute.
 */
export function getDisplayLabel(contrainte, config) {
  if (!contrainte) return contrainte;

  if (contrainte.includes(' OU ')) {
    return contrainte.split(' OU ').map(p => getDisplayLabel(p.trim(), config)).join(' ou ');
  }

  const displayLabels = config.displayLabels || {};
  for (const [poolName, items] of Object.entries(config.pools || {})) {
    const item = items.find(i => i.value === contrainte);
    if (item) {
      return (displayLabels[poolName] && displayLabels[poolName][contrainte]) || item.label;
    }
  }

  return contrainte;
}
