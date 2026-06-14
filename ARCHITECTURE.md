# 🏗️ ARCHITECTURE.md — Guide technique

Ce document décrit comment le moteur générique fonctionne et comment les
thèmes (Foot-Doku, Geo-Doku, ...) s'y branchent.

---

## 1. Diagramme d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│ index.html                                                        │
│  - UI (grille, créateur, modales, tooltips)                       │
│  - Logique de jeu (cells, attemptsLeft, recap, autocomplete)       │
│  - Logique créateur (selects, preview, locks, partage)            │
│  - utilise window.game = getGlobals()                             │
└───────────────────────────┬───────────────────────────────────────┘
                             │ import
┌───────────────────────────▼───────────────────────────────────────┐
│ index-v2.js                                                        │
│  - loadTheme(themeName)                                            │
│      → fetch themes/<theme>/config.json                           │
│      → fetch themes/<theme>/data.json (sauf football)             │
│      → convertit rulesSource/diversityRulesSource (string→fn)     │
│  - getGlobals() : expose matchesContrainte, getDisplayLabel,       │
│    getConstraintExplanation, generateNewGrid, currentConfig, ...   │
└───────────────────────────┬───────────────────────────────────────┘
                             │ import
┌───────────────────────────▼───────────────────────────────────────┐
│ core/                                                              │
│  matcher.mjs      : matchesContrainte, getDisplayLabel,            │
│                      getConstraintExplanation, _nameLetters        │
│  grid-engine.mjs  : genererGrilleParfaite, getSolutions,           │
│                      verifierReponse, diversiteOK                  │
│  → Ne connaissent AUCUNE règle spécifique à un thème :             │
│    tout vient de `config` (themes/<theme>/config.json)            │
└─────────────────────────────────────────────────────────────────┘
                             ▲
                             │ JSON
┌────────────────────────────┴──────────────────────────────────────┐
│ themes/<theme>/                                                    │
│   config.json   : pools, groupes, règles (rulesSource), libellés, │
│                    explications, searchField, fieldMapping...      │
│   data.json     : tableau d'entités (pays, films...)               │
│   (football fait exception : data_browser.js → window.PLAYERS_DB) │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Généricité : comment ça marche

Le principe central : **`index.html` et `core/*.mjs` ne contiennent aucune
règle spécifique à un thème**. Tout passe par `config` :

1. `index-v2.js#loadTheme(themeName)` charge `config.json`, transforme les
   chaînes `rulesSource`/`diversityRulesSource` en vraies fonctions JS via
   `eval`, charge les entités (`data.json` ou `PLAYERS_DB`), et stocke tout
   dans les variables module-scope `currentConfig` / `currentEntities` /
   `currentTheme`.
2. `getGlobals()` retourne un objet `window.game` qui « ferme » ces
   fonctions génériques sur `currentConfig` :
   ```js
   matchesContrainte: (entite, contrainte) => matchesContrainte(entite, contrainte, currentConfig)
   ```
3. `index.html` n'appelle jamais `core/*.mjs` directement : il passe
   toujours par `window.game.*`.
4. `window.switchTheme(themeName)` (dans `index.html`) ré-exécute
   `loadTheme`, regénère `window.game`, met à jour le titre, l'UI du
   créateur, et recharge la grille du jour propre au thème
   (`loadDailyGridForTheme`).

---

## 3. Anatomie de `config.json`

Chaque thème (`themes/<theme>/config.json`) suit cette structure :

```jsonc
{
  "name": "geography",
  "label": "Geo-Doku",          // Affiché dans le header / titre d'onglet
  "entity": "pays",              // Utilisé pour "N pays" / "N joueurs" dans la preview

  // searchField : champ de l'entité utilisé pour l'affichage/recherche/unicité
  // ("name" pour Foot, "name_fr" pour Geo)
  "searchField": "name_fr",

  // pools : pour chaque catégorie de contrainte, la liste des valeurs possibles
  // { label: "libellé brut", value: "valeur utilisée comme contrainte" }
  "pools": {
    "CONTINENTS": [
      { "label": "Europe", "value": "Europe" },
      { "label": "Africa", "value": "Africa" }
    ],
    "BORDERS_COUNTS": [
      { "label": "0-2 frontières", "value": "0-2" }
    ]
    // ...
  },

  // colonnesPool / lignesPool : quels pools peuvent être tirés pour les
  // contraintes de colonne / ligne lors de la génération aléatoire
  "colonnesPool": ["CONTINENTS", "SUBREGIONS", "..."],
  "lignesPool":   ["CONTINENTS", "SUBREGIONS", "..."],

  // colonnesGroupes / lignesGroupes : catégories affichées dans le créateur
  // (label = nom de la catégorie dans le <select>, pool = clé dans `pools`)
  "colonnesGroupes": [
    { "label": "Continent", "pool": "CONTINENTS" },
    { "label": "Nom du pays · Commence par", "pool": "NAME_FIRST_LETTERS" }
  ],
  "lignesGroupes": [ /* idem */ ],

  // rulesSource : règles de matching, sous forme de STRING (eval'ées au
  // chargement). Clé = préfixe (ou contrainte exacte) ; valeur = fonction
  // (entite, contrainte) => boolean
  "rulesSource": {
    "Commence par ": "(pays, contrainte) => pays.name_first_letter === contrainte.slice(13).toLowerCase()"
  },

  // fieldMapping : fallback pour les contraintes qui correspondent
  // directement à un champ de l'entité (égalité stricte champ === contrainte)
  "fieldMapping": {
    "continent": "Continent",
    "government": "Régime politique"
  },

  // diversityRulesSource : catégorise une contrainte de ligne/colonne pour
  // éviter les grilles "monotones" (cf. grid-engine.diversiteOK)
  "diversityRulesSource": {
    "typeLigne": "(ligne, config) => { ... return poolName; }",
    "typeColonne": "(colonne, config) => { ... return poolName; }"
  },

  // displayLabels[pool][value] : libellé affiché en jeu/créateur
  // (ex: "0-2" → "Frontières: 0-2")
  "displayLabels": {
    "BORDERS_COUNTS": { "0-2": "Frontières: 0-2" }
  },

  // constraintExplanations[pool] : texte affiché dans le popup "?"
  "constraintExplanations": {
    "BORDERS_COUNTS": "Nombre de pays frontaliers"
  },

  "rulesText": "<p>Règles du jeu en HTML, affichées dans la modale Règles</p>"
}
```

---

## 4. Anatomie de `data.json`

`themes/<theme>/data.json` est un tableau d'objets « entité » (un par pays,
film, joueur...). Chaque champ référencé par `rulesSource` ou
`fieldMapping` **doit exister** sur chaque entité.

Exemple (Geo-Doku, `themes/geography/data.json`) :

```jsonc
{
  "name": "Afghanistan",          // nom anglais (donnée brute / source)
  "name_fr": "Afghanistan",        // nom affiché/recherché (searchField)
  "continent": "Asia",             // utilisé par fieldMapping.continent
  "subregion": "South Asia",
  "capital": "Kabul",              // utilisé par la règle "Lettre " (1re lettre de la capitale)
  "borders_count": "3-6",          // utilisé par fieldMapping.borders_count
  "population_category": "20M-60M",
  "gdp_rank": "Autres",
  "language": "Dari",
  "government": "Autocratie",
  "type": "Indépendant",
  "coastline": "Enclavé",
  "name_first_letter": "a",        // utilisé par la règle "Commence par "
  "name_last_letter": "n",         // utilisé par la règle "Finit par "
  "name_vowels": ["a", "i"],        // utilisé par la règle "Contient "
  "name_composition": "Nom simple" // utilisé par fieldMapping.name_composition
}
```

Pour Foot-Doku, les entités sont des joueurs (`data_browser.js` →
`window.PLAYERS_DB`), avec des champs comme `name`, `birth_country`,
`nationality_selection`, `club_current`, `league_current`, `position`,
`caps`, `goals_selection`, `age`, `clubs_historique`.

---

## 5. Règles de matching (`core/matcher.mjs`)

`matchesContrainte(entite, contrainte, config)` :

1. **`" OU "`** : si la contrainte contient `" OU "`, elle est découpée et
   l'entité doit satisfaire **au moins une** des parties (générique, tous
   thèmes).
2. **`config.rules`** (issu de `rulesSource`) : pour chaque `[prefix, rule]`,
   si `contrainte.startsWith(prefix)`, on appelle `rule(entite, contrainte)`
   et on retourne son résultat. L'ordre des clés dans `rulesSource` compte
   (premier préfixe qui matche gagne).
   - Règles **avec préfixe** : la fonction extrait la valeur via
     `contrainte.slice(prefix.length)` (ex: `"Commence par A"` → `"A"`).
   - Règles **sans paramètre** (contrainte exacte, ex: `"50+ sélections"`) :
     la fonction ignore `contrainte` et teste juste l'entité.
3. **`config.fieldMapping`** (fallback) : pour chaque champ `field` de
   `fieldMapping`, si `entite[field] === contrainte`, c'est un match. Permet
   de déclarer des contraintes "simples" (`pays.continent === "Africa"`)
   sans écrire de règle.

`getDisplayLabel(contrainte, config)` et
`getConstraintExplanation(contrainte, config)` suivent le même principe :
ils retrouvent dans quel `pools[poolName]` se trouve la `value === contrainte`,
puis cherchent `config.displayLabels[poolName][contrainte]` /
`config.constraintExplanations[poolName]`.

---

## 6. Grid engine (`core/grid-engine.mjs`)

- **`getSolutions(contrainte, entites, config)`** : filtre `entites` qui
  satisfont `contrainte`.
- **`nbSolutions(...)`** : compte (utilisé pour les badges et la preview).
- **`diversiteOK(lignes, colonnes, config)`** :
  - rejette les doublons (lignes ou colonnes en double)
  - si `config.diversityRules.typeLigne`/`typeColonne` sont définis et que
    les 3 lignes ET les 3 colonnes sont toutes du même "type" (même pool),
    la grille est jugée trop monotone et rejetée.
- **`genererGrilleParfaite(entites, config, maxTentatives=200)`** :
  1. Tire 3 colonnes aléatoires dans `colonnesPool` (en respectant la
     diversité).
  2. Filtre les lignes possibles (`lignesPool`) telles que chaque
     croisement ligne×colonne ait entre `MIN_SOL=3` et `MAX_SOL=40`
     solutions.
  3. Tire 3 lignes parmi celles-ci (en respectant la diversité).
  4. Calcule un score (`minSol*2 + (MAX_SOL - maxSol)`), garde la meilleure
     grille sur `maxTentatives` essais.
  5. Retourne `{ lignes, colonnes, minSol, maxSol, score }`.
- **`verifierReponse(grille, config)`** : vérifie qu'une grille remplie est
  valide (chaque entité satisfait sa ligne+colonne, pas de doublon).

---

## 7. Theme switching (`index.html`)

`window.switchTheme(themeName)` :

1. `await loadTheme(themeName)` → recharge `config`/`entities`, met à jour
   `window.game = getGlobals()`.
2. `updatePageTitle()` : met à jour `#header-title` **et** `document.title`
   (titre d'onglet) à partir de `currentConfig.label`.
3. `updateGameUI()` / `updateRulesText()` : régénèrent l'UI dépendante du
   thème (grille, règles).
4. Resynchronise `#themeSelect` (dropdown) avec `themeName`.
5. Si le créateur est ouvert : `populateConstraintSelects()` régénère les
   `<select>` de catégories/valeurs pour le nouveau thème, et réinitialise
   la preview.
6. Sinon (et si on n'est pas sur une grille personnalisée) :
   `await loadDailyGridForTheme(themeName)` recharge la grille du jour du
   thème sélectionné.

---

## 8. Grille du jour par thème (`loadDailyGridForTheme`)

Football et les autres thèmes n'ont **pas** la même source :

| | Foot-Doku | Autres thèmes (Geo-Doku, ...) |
|---|---|---|
| Source | `grille-du-jour.json` (généré par un script externe, statique) | générée à la volée via `window.game.generateNewGrid()` (= `genererGrilleParfaite`) |
| Cache | `localStorage.footdoku_grille` (fallback si fetch échoue) | `localStorage['dailyGrid_<theme>_<DD/MM/YYYY>']` |
| Stabilité | identique pour tous les joueurs (même fichier JSON) | générée une fois par jour et par navigateur (mise en cache) |

`today = new Date().toLocaleDateString('fr-FR')` (format `DD/MM/YYYY`) sert
de clé de cache pour les thèmes génériques — la grille est régénérée
automatiquement chaque jour.

**Grilles personnalisées** : si l'URL contient `?gridData=<base64>`, le JSON
décodé contient `{ colonnes, lignes, publieLe, theme }`. `init()` bascule
d'abord sur `theme` via `switchTheme()` (si différent du thème courant) avant
d'afficher la grille — ce qui garantit qu'un lien partagé en Geo-Doku ouvre
bien Geo-Doku, même si le visiteur arrive depuis une URL "nue".
