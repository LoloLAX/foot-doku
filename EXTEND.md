# 🧩 EXTEND.md — Ajouter un nouveau thème

Ce guide explique comment ajouter un thème (ex: Cinema-Doku, Tennis-Doku...)
**sans toucher** à `index.html`, `index-v2.js` ou `core/*.mjs` (sauf l'étape
finale d'enregistrement dans le sélecteur).

Voir [ARCHITECTURE.md](ARCHITECTURE.md) pour le détail du fonctionnement
générique avant de commencer.

---

## ✅ Checklist (7 étapes)

### Étape 1 — Créer le dossier `themes/<newtheme>/`

```bash
mkdir -p themes/cinema
```

### Étape 2 — Créer `data.json`

Un tableau d'objets « entité » (films, acteurs, joueurs de tennis...). Chaque
entité doit avoir :
- un champ `searchField` unique (utilisé pour la recherche/autocomplétion et
  l'affichage), ex: `"title"` ou `"name_fr"`.
- tous les champs référencés par `rulesSource` / `fieldMapping` dans
  `config.json` (étape 3).

Template minimal (Cinema-Doku) :

```jsonc
[
  {
    "title": "Inception",
    "title_first_letter": "i",
    "title_last_letter": "n",
    "title_vowels": ["i", "e", "o"],
    "director": "Christopher Nolan",
    "release_decade": "2010s",
    "genre": "Science-fiction",
    "country": "USA",
    "duration_category": "Long (>2h)"
  }
]
```

### Étape 3 — Créer `config.json`

Reprendre la structure documentée dans [ARCHITECTURE.md §3](ARCHITECTURE.md#3-anatomie-de-configjson) :

```jsonc
{
  "name": "cinema",
  "label": "Cinema-Doku",
  "entity": "films",
  "searchField": "title",

  "pools": {
    "GENRES": [
      { "label": "Science-fiction", "value": "Science-fiction" },
      { "label": "Comédie", "value": "Comédie" }
    ],
    "DECADES": [
      { "label": "2010s", "value": "2010s" }
    ],
    "TITLE_FIRST_LETTERS": [
      { "label": "Commence par I", "value": "Commence par i" }
    ]
  },

  "colonnesPool": ["GENRES", "DECADES"],
  "lignesPool":   ["DECADES", "TITLE_FIRST_LETTERS"],

  "colonnesGroupes": [
    { "label": "Genre", "pool": "GENRES" },
    { "label": "Titre · Commence par", "pool": "TITLE_FIRST_LETTERS" }
  ],
  "lignesGroupes": [
    { "label": "Décennie", "pool": "DECADES" }
  ],

  "rulesSource": {
    "Commence par ": "(film, contrainte) => film.title_first_letter === contrainte.slice(13).toLowerCase()"
  },

  "fieldMapping": {
    "genre": "Genre",
    "release_decade": "Décennie"
  },

  "diversityRulesSource": {
    "typeLigne": "(ligne, config) => 'DECADES'",
    "typeColonne": "(colonne, config) => 'GENRES'"
  },

  "displayLabels": {},
  "constraintExplanations": {},

  "rulesText": "<p>Règles du jeu Cinema-Doku...</p>"
}
```

### Étape 4 — Ajouter `displayLabels` et `constraintExplanations`

Pour chaque `pool`, ajouter (si nécessaire) :
- `displayLabels[pool][value]` : libellé clair affiché dans le créateur et
  en jeu (ex: `"2010s": "Décennie : 2010s"`).
- `constraintExplanations[pool]` : texte affiché dans le popup "?" en jeu
  (ex: `"GENRES": "Genre principal du film"`).

Sans ces entrées, le jeu retombe sur le `label` brut du pool (fonctionnel
mais moins clair).

### Étape 5 — Tester le créateur (cascading + preview)

1. Lancer le serveur local (`python3 -m http.server 8080`).
2. Ouvrir le créateur ("Créer une grille").
3. Vérifier que le `<select>` de catégorie de colonne/ligne propose bien
   `colonnesGroupes`/`lignesGroupes` du nouveau thème.
4. Choisir une catégorie → vérifier que le `<select>` de valeurs se remplit
   avec les `pools[pool]` correspondants, libellés via `getDisplayLabel`.
5. Lancer "🎲 Grille aléatoire" et "🛠️ Corriger (min 5 solutions)" → vérifier
   que la prévisualisation affiche un nombre de solutions cohérent (3-40)
   par case.

### Étape 6 — Tester le jeu (autocomplete, validation, tooltips)

1. Depuis le créateur, cliquer "Créer la grille" puis ouvrir le lien de
   partage généré (`?gridData=...&theme=cinema` encodé en base64).
2. Vérifier que la grille s'affiche avec le thème **Cinema-Doku** (titre,
   contraintes).
3. Cliquer une case vide → taper dans la recherche → vérifier
   l'autocomplétion (basée sur `searchField`, sans accents).
4. Valider une réponse correcte et une incorrecte → vérifier
   `verifierReponse` (badge ✅/❌, compteur de tentatives, récapitulatif).
5. Cliquer les icônes "?" sur les contraintes → vérifier que
   `getConstraintExplanation` affiche un texte pertinent (pas le nom brut du
   pool).

### Étape 7 — Enregistrer le thème dans le sélecteur

Dans `index.html`, ajouter une `<option>` dans `#themeSelect` :

```html
<select id="themeSelect">
  <option value="football">⚽ Foot-Doku</option>
  <option value="geography">🌍 Geo-Doku</option>
  <option value="cinema">🎬 Cinema-Doku</option>
</select>
```

C'est la **seule** modification requise dans `index.html` / `index-v2.js` :
`loadTheme('cinema')` ira automatiquement chercher
`themes/cinema/config.json` + `themes/cinema/data.json`.

---

## 🎬 Exemple complet : ajouter Cinema-Doku

1. `mkdir -p themes/cinema`
2. Créer `themes/cinema/data.json` avec ~150-200 films, en veillant à ce que
   chaque film ait : `title`, `title_first_letter`, `title_last_letter`,
   `title_vowels`, `genre`, `release_decade`, `director`, `country`.
3. Créer `themes/cinema/config.json` avec :
   - `pools.GENRES` (Action, Comédie, Drame, Science-fiction, Animation...)
   - `pools.DECADES` (1980s, 1990s, 2000s, 2010s, 2020s...)
   - `pools.TITLE_FIRST_LETTERS` / `TITLE_LAST_LETTERS` / `TITLE_VOWELS`
     (mêmes règles que Foot/Geo : "Commence par ", "Finit par ", "Contient ")
   - `colonnesGroupes`/`lignesGroupes` mêlant `GENRES`, `DECADES`,
     `TITLE_*`.
   - `rulesSource` réutilisant les mêmes patterns que Geo (`Commence par `,
     `Finit par `, `Contient `) adaptés au champ `title_*`.
   - `fieldMapping.genre`, `fieldMapping.release_decade`.
   - `diversityRulesSource` pour éviter des grilles 100% "GENRES" ou 100%
     "DECADES".
4. Renseigner `displayLabels`/`constraintExplanations` pour chaque pool
   (ex: `"2010s": "Décennie : 2010s"`, explication `"DECADES": "Décennie de
   sortie du film"`).
5. Ajouter `<option value="cinema">🎬 Cinema-Doku</option>` dans
   `#themeSelect` (`index.html`).
6. Suivre les étapes 5 et 6 ci-dessus pour valider créateur + jeu.
7. Mettre à jour `loadDailyGridForTheme` n'est **pas** nécessaire : Cinema-Doku
   suivra automatiquement le flux générique (génération à la volée +
   cache `localStorage['dailyGrid_cinema_<DD/MM/YYYY>']`), comme Geo-Doku.

Aucune modification de `core/matcher.mjs` ni `core/grid-engine.mjs` n'est
nécessaire : tout passe par `config.json`.
