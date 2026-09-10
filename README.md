# Plateforme Web de Cyber Threat Intelligence (CTI)

Application complète (backend + frontend) implémentant les 5 modules décrits dans le mémoire :
tableau de bord, recherche d'indicateurs de compromission (IoC), flux de menaces, gestion des
alertes, et authentification/gestion des utilisateurs.

## Structure du projet

```
cti-platform/
├── backend/     API REST (Node.js + Express + MongoDB/Mongoose)
└── frontend/    Application web (React + Vite)
```

---

## Tester en local

### Prérequis
- Node.js 18+, npm
- MongoDB (local, Docker, ou Atlas — voir plus bas)

### 0. Démarrer MongoDB
```bash
docker run -d --name cti-mongo -p 27017:27017 mongo:7
```

### 1. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
API sur **http://localhost:4000**. Compte admin créé automatiquement :
`admin@cti-platform.local` / `Admin123!`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Interface sur **http://localhost:5173** (le proxy Vite redirige `/api` vers le backend local).

---

## Tester en ligne (déploiement gratuit)

Trois services à héberger : la base de données, le backend, le frontend. Voici un parcours
gratuit et simple, avec Render + Vercel + MongoDB Atlas (aucun de ces choix n'est obligatoire —
Railway, Fly.io, Netlify fonctionnent tout aussi bien).

### Étape 1 — Base de données : MongoDB Atlas (gratuit)

1. Créez un compte sur https://www.mongodb.com/cloud/atlas
2. Créez un cluster gratuit (tier **M0**)
3. Dans *Database Access*, créez un utilisateur avec mot de passe
4. Dans *Network Access*, autorisez `0.0.0.0/0` (toutes les IP) pour simplifier
5. Cliquez sur *Connect → Drivers*, copiez la chaîne de connexion, du type :
   ```
   mongodb+srv://<utilisateur>:<motdepasse>@cluster0.xxxxx.mongodb.net/cti-platform
   ```

### Étape 2 — Backend : Render (gratuit)

1. Poussez le dossier `backend/` sur un dépôt GitHub
2. Sur https://render.com, créez un **Web Service** relié à ce dépôt
3. Renseignez :
   - **Build command** : `npm install`
   - **Start command** : `npm start`
4. Dans *Environment*, ajoutez les variables (reprises de `.env.example`) :
   - `MONGODB_URI` → votre chaîne Atlas de l'étape 1
   - `JWT_SECRET` → une chaîne aléatoire longue
   - `CORS_ORIGIN` → laissez vide pour l'instant, à renseigner après l'étape 3
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` → vos identifiants admin souhaités
5. Déployez. Notez l'URL générée, ex. `https://cti-platform-backend.onrender.com`
6. Vérifiez : `https://<votre-url>/api/health` doit répondre `{"status":"ok",...}`

> Note : sur le plan gratuit de Render, le service s'endort après 15 minutes d'inactivité et met
> ~30 secondes à se réveiller au premier appel suivant — normal pour une démo/soutenance.

### Étape 3 — Frontend : Vercel (gratuit)

1. Poussez le dossier `frontend/` sur un dépôt GitHub (ou le même dépôt que le backend)
2. Sur https://vercel.com, importez ce dépôt (*Root Directory* : `frontend`)
3. Ajoutez la variable d'environnement :
   - `VITE_API_URL` → l'URL Render de l'étape 2, **sans slash final**
     (ex. `https://cti-platform-backend.onrender.com`)
4. Déployez. Vercel vous donne une URL, ex. `https://cti-platform.vercel.app`

### Étape 4 — Autoriser le frontend sur le backend

Retournez sur Render, dans les variables d'environnement du backend, renseignez :
```
CORS_ORIGIN=https://cti-platform.vercel.app
```
puis redéployez le backend (*Manual Deploy*). Sans cette étape, le navigateur bloquera les
requêtes du frontend vers l'API (erreur CORS dans la console).

### Résultat

Votre plateforme est accessible à `https://cti-platform.vercel.app`, connectée à une vraie base
MongoDB dans le cloud — testable depuis n'importe quel navigateur, à partager pour la soutenance.

---

## Connecter de vraies sources de Threat Intelligence

Par défaut, la plateforme fonctionne en **mode démonstration** (scores simulés mais cohérents).
Pour activer les appels réels, renseignez dans les variables d'environnement du backend :

| Variable | Source |
|---|---|
| `VIRUSTOTAL_API_KEY` | https://www.virustotal.com/gui/my-apikey |
| `ABUSEIPDB_API_KEY` | https://www.abuseipdb.com/account/api |
| `OTX_API_KEY` | https://otx.alienvault.com/api (Settings → OTX Key) |

Si une clé est absente ou si l'appel échoue, la plateforme bascule automatiquement sur les
données simulées pour la source concernée.

## Fonctionnalités par module

| Module | Description | Fichiers backend | Page frontend |
|---|---|---|---|
| 1. Tableau de bord | KPI, répartition des menaces, évolution 30 jours, top pays, alertes récentes | `routes/dashboard.js` | `pages/Dashboard.jsx` |
| 2. Recherche IoC | Recherche IP / domaine / hash, score de dangerosité agrégé | `routes/ioc.js`, `models/Ioc.js`, `utils/threatIntel.js` | `pages/IocSearch.jsx` |
| 3. Flux de menaces | Agrégation de flux RSS + filtres catégorie/sévérité | `routes/feeds.js`, `models/FeedCache.js`, `utils/threatFeed.js` | `pages/ThreatFeeds.jsx` |
| 4. Gestion des alertes | Criticité, statut, notes d'analyse | `routes/alerts.js`, `models/Alert.js` | `pages/Alerts.jsx` |
| 5. Authentification & utilisateurs | Inscription/connexion JWT, rôles, gestion des comptes | `routes/auth.js`, `routes/users.js`, `models/User.js` | `pages/Login.jsx`, `pages/Register.jsx`, `pages/Users.jsx` |

## Sécurité

- Mots de passe hachés avec bcrypt
- Authentification par jeton JWT (durée de vie configurable)
- Contrôle d'accès par rôle (`analyste` / `administrateur`) sur les routes sensibles
- CORS restreint à l'origine du frontend en production (`CORS_ORIGIN`)
- Pensez à changer `JWT_SECRET`, `MONGODB_URI` et le mot de passe administrateur avant tout
  déploiement réel

## Prochaines étapes suggérées

- Ajouter des tests automatisés (Jest/Vitest)
- Conteneuriser l'application (Docker + docker-compose)
- Ajouter un export/import au format STIX/TAXII (cf. mémoire, perspectives)
- Ajouter des index MongoDB (ex. sur `email`, `createdAt`) pour les performances à grande échelle
