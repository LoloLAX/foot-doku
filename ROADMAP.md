# 🗺️ ROADMAP.md — Prochaines étapes

L'architecture générique (cf. [ARCHITECTURE.md](ARCHITECTURE.md)) permet
d'ajouter de nouveaux thèmes sans toucher au moteur, et de faire évoluer
l'UI/UX indépendamment des thèmes. Deux grands axes sont prévus :

- **Phase A** : nouveaux thèmes (contenu)
- **Phase B** : améliorations cosmétiques (expérience)

---

## Phase A — Nouveaux thèmes

Suivre le guide [EXTEND.md](EXTEND.md) pour chacun. Ordre de priorité
suggéré (du plus simple/données disponibles au plus complexe) :

| # | Thème | Description | Estimation | Données nécessaires |
|---|---|---|---|---|
| 1 | 🎬 **Cinéma-Doku** | Films par genre, décennie, réalisateur, lettres du titre | ~1-2j | ~150-200 films (titre, genre, décennie, réalisateur, pays) |
| 2 | 🎵 **Musique-Doku** | Artistes/groupes par genre musical, décennie, pays, lettres du nom | ~1-2j | ~150-200 artistes |
| 3 | 🎾 **Tennis-Doku** | Joueurs par nationalité, palmarès (Grand Chelem), main dominante, lettres du nom | ~1-2j | ~150-200 joueurs (ATP/WTA) |
| 4 | 🏀 **Basketball-Doku** | Joueurs NBA par équipe, poste, palmarès, pays de naissance | ~1-2j | ~150-200 joueurs NBA |
| 5 | 🐾 **Animaux-Doku** | Espèces par classe, continent, régime alimentaire, statut de conservation | ~2-3j (dataset à construire) | ~150-200 espèces |
| 6 | 📜 **Histoire-Doku** | Personnages historiques par époque, pays, domaine (politique/science/art) | ~2-3j (dataset sensible, vérifier sources) | ~150-200 personnages |

**Effort par thème** (une fois le dataset disponible) :
1. `data.json` (1248 entrées Foot / 194 Geo servent de référence de
   structure).
2. `config.json` (pools, groupes, rulesSource, fieldMapping,
   diversityRulesSource, displayLabels, constraintExplanations).
3. Ajout dans `#themeSelect`.
4. Recette (créateur + jeu) via Playwright, en réutilisant les scripts de
   test existants comme modèle.

---

## Phase B — Améliorations cosmétiques

Indépendantes du contenu, applicables à tous les thèmes via le moteur
générique.

| # | Amélioration | Description | Estimation |
|---|---|---|---|
| 1 | **Animations** | Transitions douces sur placement de réponse (✅/❌), changement de thème, ouverture/fermeture des modales | ~1j |
| 2 | **Classement / leaderboard** | Stocker les scores du jour (localStorage ou backend léger) et afficher un classement (temps, tentatives) | ~2-3j |
| 3 | **Statistiques joueur** | Historique des grilles jouées, taux de réussite par thème, série de jours consécutifs (streak) | ~2j |
| 4 | **Mode sombre** | Thème clair/sombre, persistant via `localStorage` | ~0.5j |
| 5 | **Partage social** | Boutons de partage directs (image récap générée, lien pré-rempli) | ~1j |
| 6 | **Accessibilité** | Navigation clavier complète, contrastes WCAG, labels ARIA sur la grille et le créateur | ~1-2j |

---

## Ordre de priorité recommandé

1. **Phase A #1-2** (Cinéma, Musique) — données faciles à trouver, élargit
   rapidement l'attrait du jeu.
2. **Phase B #1, #4** (animations légères, mode sombre) — gains UX rapides
   et peu coûteux.
3. **Phase A #3-4** (Tennis, Basketball) — sport, cohérent avec Foot-Doku.
4. **Phase B #2-3** (leaderboard, statistiques) — nécessite de réfléchir au
   stockage (localStorage suffisant au début, backend si multi-appareils).
5. **Phase A #5-6** (Animaux, Histoire) — datasets plus longs à constituer,
   à traiter en dernier.
6. **Phase B #5-6** (partage social, accessibilité) — améliorations
   continues, à intégrer au fil de l'eau sur chaque nouveau thème/feature.
