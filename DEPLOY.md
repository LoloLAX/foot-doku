# 📦 Guide de déploiement Foot-Doku

## Option 1 : Netlify (Recommandé - Gratuit)

### Étape 1 : Préparer le dépôt Git

```bash
cd D:/Documents/Claude/Projects/Foot-Doku
git init
git add .
git commit -m "Initial commit: Foot-Doku avec mode créateur"
```

### Étape 2 : Créer un dépôt GitHub

1. Allez sur [github.com/new](https://github.com/new)
2. Nommez-le `foot-doku`
3. Faites **Push** :

```bash
git remote add origin https://github.com/VOTRE_USERNAME/foot-doku.git
git branch -M main
git push -u origin main
```

### Étape 3 : Déployer sur Netlify

**Option A : Via interface Netlify (plus simple)**

1. Allez sur [netlify.com](https://netlify.com)
2. Cliquez **"Add new site"** → **"Import an existing project"**
3. Connectez GitHub
4. Sélectionnez le dépôt `foot-doku`
5. Configuration automatique :
   - **Build command** : (laisser vide - site statique)
   - **Publish directory** : `.` (racine)
6. Cliquez **"Deploy site"**

**Votre site sera live à :** `https://foot-doku.netlify.app`

**Option B : CLI Netlify (plus rapide)**

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=.
```

### Étape 4 : Domaine personnalisé (optionnel)

Dans les paramètres Netlify :
- **Site settings** → **Domain management** → **Custom domain**
- Ajoutez `footdoku.fr` (ou votre domaine)

---

## Option 2 : Vercel (Très rapide)

1. Allez sur [vercel.com/import](https://vercel.com/import)
2. Importez votre dépôt GitHub
3. Vercel détecte automatiquement que c'est un site statique
4. Deploy en 1 clic → `foot-doku.vercel.app`

---

## Option 3 : GitHub Pages (Zéro config)

1. Allez dans les **Settings** du dépôt
2. **Pages** → **Source** : `main` branch
3. Site live à : `https://username.github.io/foot-doku`

---

## ✨ Fonctionnalités après déploiement

### Jouer (mode quotidien)
- URL : `https://foot-doku.netlify.app/`
- Charge la grille du jour depuis `localStorage`

### Créer une grille personnalisée
- Cliquez sur **"✏️ Créer une grille"**
- Choisissez 3 colonnes + 3 lignes
- Cliquez **"Créer la grille"**
- Copiez le lien et envoyez-le à un ami

### Jouer une grille reçue
- Ami reçoit le lien : `https://foot-doku.netlify.app/?gridData=...`
- Le lien charge directement la grille personnalisée
- Pas besoin de compte, totalement anonyme

---

## 📝 Comment publier une grille du jour (Admin)

Sur `https://foot-doku.netlify.app/admin.html` :

1. Créez une grille (contraintes col/lig)
2. Complétez-la avec le bouton **"🎲 Compléter"**
3. Cliquez **"Publier"** pour la sauvegarder
4. Elle apparaît sur `/index.html` comme grille du jour

---

## 🚀 Cheat-sheet déploiement rapide

```bash
# 1. Créer le dépôt GitHub
git init && git add . && git commit -m "init"
git remote add origin https://github.com/USER/foot-doku.git
git push -u origin main

# 2. Déployer sur Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=.

# ✅ Site live !
```

---

## 💡 Configuration avancée

### Redirection du domaine racine
Pour diriger `footdoku.fr` → `/index.html` (jeu) au lieu de `/admin.html` :

Dans **Netlify**, créer un fichier `_redirects` :
```
/ /index.html 200
```

### Variables d'environnement (si nécessaire)
Utilisez les **Build & deploy settings** → **Environment** dans Netlify

### Analytics
- Netlify Analytics gratuit ou Google Analytics (ajouter script dans `<head>`)

---

## 🛠 Troubleshooting

| Problème | Solution |
|----------|----------|
| Grille ne se charge pas | Vérifier `data_browser.js` dans les fichiers déployés |
| Liens de partage cassés | URL encodée > 2000 chars ? Utiliser compression LZ4 (optionnel) |
| Admin vierge | `players_wc2026.json` présent ? Générer avec `node generer_browser_db.js` |

---

## 📊 Statistiques (post-déploiement)

- Site statique, 0 backend = **très rapide**
- Netlify CDN global = **latence faible** 🌍
- Grilles encodées en URL = **pas de base de données**
- Données joueur 1248 × 25 champs = **~400 KB** compressé

---

**Prêt à partager ? Let's go ! ⚽**
