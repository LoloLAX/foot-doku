# 🚀 Guide de déploiement Foot-Doku

## ✨ Avant de déployer

1. **Vérifier les changements locaux**
   ```bash
   cd D:\Documents\Claude\Projects\Foot-Doku
   git status
   ```

2. **Régénérer les données** (si vous avez modifié les joueurs)
   ```bash
   node generer_browser_db.js    # Génère data_browser.js avec pays en français
   node generer_contraintes.js   # Génère moteur.js et generateur.js
   node generateur.js            # Test: génère une grille de test
   ```

3. **Valider les fichiers** (l'encodage UTF-8 est important pour les accents)
   - Tous les fichiers `.js` et `.html` doivent être en **UTF-8 sans BOM**
   - Les pays français comme "Côte d'Ivoire", "Guinée-Bissau" doivent s'afficher correctement

---

## 📋 Option 1 : Netlify (Recommandé - Gratuit, Déploiement auto)

### Étape 1 : Préparer Git

```bash
cd D:\Documents\Claude\Projects\Foot-Doku

# Voir les changements
git status

# Ajouter tous les fichiers
git add .

# Créer un commit
git commit -m "Feature: Countries in French + UTF-8 encoding fix"

# Créer le dépôt GitHub si pas encore fait
git remote add origin https://github.com/VOTRE_USERNAME/foot-doku.git
git branch -M main
git push -u origin main
```

### Étape 2 : Connecter à Netlify

1. **Allez sur** https://app.netlify.com/signup (inscrivez-vous avec GitHub)
2. **Cliquez** "Add new site" → "Import an existing project"
3. **Sélectionnez** votre dépôt `foot-doku`
4. **Configuration automatique** :
   - Build command: (laisser vide - site statique)
   - Publish directory: `.` (racine du projet)
5. **Cliquez** "Deploy site"

**✅ Votre site est live !** → `https://foot-doku.netlify.app`

### À chaque mise à jour :
```bash
git add .
git commit -m "Description des changements"
git push origin main
# Netlify déploie automatiquement en ~30 secondes
```

---

## 🌍 Option 2 : Vercel (Très rapide)

1. **Allez sur** https://vercel.com/import
2. **Connectez** votre compte GitHub
3. **Sélectionnez** le dépôt `foot-doku`
4. Vercel détecte automatiquement c'est un site statique
5. **Cliquez** "Deploy"

**✅ Site live** → `https://foot-doku.vercel.app`

---

## 📦 Option 3 : GitHub Pages (Zéro config)

1. **Allez** dans Settings du dépôt
2. **GitHub Pages** → Source: `main` branch
3. **Deploy**

**✅ Site live** → `https://username.github.io/foot-doku`

---

## 🎯 Configuration du domaine personnalisé

### Netlify
- **Site settings** → **Domain management** → **Custom domain**
- Ajouter `footdoku.fr` ou votre domaine
- Configurer les DNS (instructions dans Netlify)

### Vercel / GitHub Pages
- Même processus via les paramètres du site

---

## 🔧 Structure du projet

```
foot-doku/
├── index.html              # Jeu (accueil + créateur)
├── admin.html              # Admin (créer grilles du jour)
├── data_browser.js         # BD joueurs (généré)
├── players_wc2026.json     # Source de vérité
├── package.json            # Dépendances (Node.js)
├── generer_browser_db.js   # Génère data_browser.js
├── generer_contraintes.js  # Génère moteur.js
├── moteur.js               # Validation + solutions
├── _redirects              # Config Netlify (SPA)
├── DEPLOY.md               # Guide (ancien)
└── DEPLOIEMENT.md          # Guide (ce fichier)
```

---

## ✅ Checklist avant de déployer

- [ ] Tous les fichiers en UTF-8 (accents corrects)
- [ ] `node generateur.js` fonctionne (teste la grille)
- [ ] Noms de pays en **français** visibles dans l'admin
- [ ] Pas d'erreurs console (`F12` → Console)
- [ ] Mode créateur fonctionne (créer → partager → jouer)
- [ ] Accents affichés correctement ("Côte d'Ivoire", "Défenseur", etc.)

---

## 🐛 Troubleshooting

| Problème | Solution |
|----------|----------|
| Accents affichés mal ("Défenseur" → "D©fenseur") | Vérifier encodage UTF-8 du fichier HTML/JS |
| Admin vierge | Vérifier `data_browser.js` est bien chargé (`F12` → Network) |
| Pays affichés en anglais | Relancer `node generer_browser_db.js` |
| Grille ne charge pas | Vérifier `moteur.js` existe et est à jour |

---

## 📊 Statistiques post-déploiement

- **Taille du site** : ~400 KB compressé
- **Performance** : <500ms load time avec CDN
- **Joueurs** : 1248 (France, Allemagne, Brésil, etc.)
- **Contraintes** : 119 colonnes (sélections, postes, lettres, stats)

---

## 🎮 Après le déploiement

1. **Admin** → Créez une grille du jour
   - URL: `https://foot-doku.netlify.app/admin.html`
   - Cliquez "Publier" → sauvegardée en localStorage

2. **Jeu** → Joueurs peuvent :
   - Jouer la grille du jour
   - Créer une grille personnalisée
   - Partager le lien avec des amis

3. **Monitoring** (optionnel)
   - Netlify Analytics : gratuit
   - Google Analytics : ajouter script dans `<head>`

---

**Vous êtes prêt !** 🚀 Des questions ? Vérifiez l'encodage UTF-8 du fichier.
