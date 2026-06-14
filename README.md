# 🎮 X-Doku — Foot-Doku & Geo-Doku

> Un Sudoku de connaissances : place la bonne entité (joueur, pays...) à
> l'intersection d'une contrainte de ligne et d'une contrainte de colonne.

X-Doku est un moteur de jeu générique « 3×3 » :
- **Foot-Doku** 🏟️ — placez des joueurs de la Coupe du Monde 2026 selon leur
  club, sélection, poste, pays de naissance, lettres du nom, etc.
- **Geo-Doku** 🌍 — placez des pays (194 membres de l'ONU) selon leur
  continent, sous-région, langue, régime politique, PIB, lettres du nom, etc.

D'autres thèmes (cinéma, musique, sport...) peuvent être ajoutés sans toucher
au moteur — voir [EXTEND.md](EXTEND.md).

---

## ✨ Fonctionnalités

### Jeu (Foot-Doku & Geo-Doku)
- Grille 3×3 quotidienne, générée et mise en cache par thème
- Sélecteur de thème (Foot-Doku / Geo-Doku) en haut de page
- Indication du nombre de solutions possibles par case (badge coloré)
- Recherche/autocomplétion **sans accents** (`maroc` → Maroc, `cote` → Côte
  d'Ivoire)
- 3 tentatives, récapitulatif final avec les bonnes réponses
- Tooltips "?" sur chaque contrainte avec explication en français

### Mode créateur ✏️
- Choix des contraintes de ligne/colonne par catégorie puis valeur, avec
  libellés clairs (« Continent: Afrique », « Poste: Gardien », « Frontières:
  0-2 »...)
- "🎲 Grille aléatoire", "🤖 Compléter automatiquement",
  "🛠️ Corriger (min 5 solutions)"
- Verrouillage de contraintes (checkbox **ou** clic direct sur une case de la
  prévisualisation 🔒)
- Prévisualisation : nombre de solutions, difficulté, et liste des entités
  par case (réservée au créateur)
- Génération d'un **lien de partage** qui ouvre la grille personnalisée dans
  le bon thème (Foot-Doku ou Geo-Doku)

---

## 🚀 Installation locale

C'est un site **statique** (HTML/CSS/JS vanilla + modules ES), aucun build
n'est nécessaire.

```bash
git clone https://github.com/LoloLAX/foot-doku.git
cd foot-doku
python3 -m http.server 8080
# ou : npx http-server -p 8080
```

Ouvrir [http://localhost:8080/index.html](http://localhost:8080/index.html).

---

## 🏗️ Architecture (vue d'ensemble)

```
index.html          ← UI + logique de jeu/créateur (vanilla JS)
index-v2.js         ← Pont générique : charge un thème, expose window.game
core/
  matcher.mjs       ← Évalue si une entité satisfait une contrainte
  grid-engine.mjs   ← Génère/valide des grilles 3x3
themes/
  football/config.json   ← Règles, pools, libellés du thème Foot
  geography/config.json  ← idem pour Geo
  geography/data.json    ← 194 pays (données)
data_browser.js     ← Données des joueurs Foot (PLAYERS_DB, généré)
grille-du-jour.json ← Grille du jour Foot-Doku (générée par script externe)
```

Détails complets : [ARCHITECTURE.md](ARCHITECTURE.md).

Pour ajouter un nouveau thème (ex: Cinema-Doku), voir
[EXTEND.md](EXTEND.md).

---

## 🛠️ Tech stack

- **Frontend** : HTML/CSS + JavaScript vanilla (ES modules)
- **Pas de framework, pas de build step** — déployable tel quel
- **Données** : JSON statiques (`themes/<theme>/data.json`,
  `data_browser.js`)
- **Hébergement** : Netlify (déploiement automatique sur push, voir
  [DEPLOY.md](DEPLOY.md) / [DEPLOIEMENT.md](DEPLOIEMENT.md))
- **Tests** : scripts Playwright (parcours utilisateurs, voir
  [RECAP.md](RECAP.md))

---

## 🗺️ Roadmap

Voir [ROADMAP.md](ROADMAP.md) pour le détail :
- **Phase A** : 6 nouveaux thèmes (Cinéma, Musique, Tennis, Basketball,
  Animaux, Histoire)
- **Phase B** : améliorations cosmétiques (animations, classement, stats)

---

## 📜 License & Crédits

- Données Coupe du Monde 2026 : agrégées depuis Wikipédia
- Données pays : ISO 3166 / ONU (194 membres)
- Projet développé avec [Claude Code](https://claude.ai/code)
