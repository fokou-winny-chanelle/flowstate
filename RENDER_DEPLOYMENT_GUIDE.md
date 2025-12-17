# Guide Complet de Déploiement sur Render.com

Ce guide vous accompagne étape par étape pour déployer FlowState sur Render.com.

## Prérequis

1. Un compte GitHub avec le repository FlowState poussé
2. Un compte Render.com (gratuit)
3. Votre fichier `.env` avec toutes les variables nécessaires

## Étape 1: Créer un Compte Render.com

1. Allez sur https://render.com
2. Cliquez sur "Get Started for Free" (en haut à droite)
3. Choisissez "Sign up with GitHub"
4. Autorisez Render à accéder à votre compte GitHub
5. Votre compte est créé

## Étape 2: Créer la Base de Données PostgreSQL

1. Dans le dashboard Render, cliquez sur "New +" (en haut à droite)
2. Sélectionnez "PostgreSQL"
3. Remplissez le formulaire:
   - **Name**: `flowstate-db` (ou un nom de votre choix)
   - **Database**: `flowstate` (laissez par défaut ou changez)
   - **User**: `flowstate_user` (laissez par défaut ou changez)
   - **Region**: Choisissez la région la plus proche (ex: Frankfurt, Ireland)
   - **PostgreSQL Version**: `16` (ou la version la plus récente)
   - **Plan**: Sélectionnez "Free" (pour commencer)
4. Cliquez sur "Create Database"
5. **IMPORTANT**: Attendez que la base de données soit créée (2-3 minutes)
6. Une fois créée, cliquez sur votre base de données
7. **Copiez la "Internal Database URL"** - vous en aurez besoin pour le backend
   - Elle ressemble à: `postgresql://flowstate_user:password@dpg-xxxxx-a/flowstate`

## Étape 3: Déployer le Backend (Web Service)

1. Dans le dashboard Render, cliquez sur "New +"
2. Sélectionnez "Web Service"
3. Connectez votre repository GitHub:
   - Si c'est la première fois, cliquez sur "Connect account" et autorisez Render
   - Sélectionnez votre repository: `fokou-winny-chanelle/flowstate`
   - Cliquez sur "Connect"
4. Remplissez la configuration du service:

   **Basic Settings:**
   - **Name**: `flowstate-backend` (ou un nom de votre choix)
   - **Region**: Même région que votre base de données
   - **Branch**: `master` (ou votre branche principale)
   - **Root Directory**: Laissez vide (racine du projet)
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Docker Context**: `.` (point, racine du projet)

   **Plan:**
   - Sélectionnez "Free" (pour commencer)

5. Cliquez sur "Advanced" pour ajouter les variables d'environnement:

   Cliquez sur "Add Environment Variable" et ajoutez chacune de ces variables:

   ```
   NODE_ENV = production
   PORT = 3000
   DATABASE_URL = [Collez l'Internal Database URL de l'étape 2]
   REDIS_URL = [Nous créerons Redis à l'étape 4 - laissez vide pour l'instant]
   JWT_SECRET = [Votre JWT_SECRET du .env]
   JWT_REFRESH_SECRET = [Votre JWT_REFRESH_SECRET du .env]
   JWT_ACCESS_EXPIRES_IN = 15m
   JWT_REFRESH_EXPIRES_IN = 7d
   GMAIL_USER = [Votre GMAIL_USER]
   GMAIL_APP_PASSWORD = [Votre GMAIL_APP_PASSWORD]
   APP_NAME = FlowState
   FRONTEND_URL = [Nous mettrons à jour après avoir déployé le frontend]
   ```
   
   **Note**: Pour Redis, vous pouvez utiliser soit `REDIS_URL` (recommandé pour Render), soit `REDIS_HOST`/`REDIS_PORT`. Nous configurerons `REDIS_URL` à l'étape 4.

   **Important**: Pour `DATABASE_URL`, utilisez l'**Internal Database URL** de Render, pas l'External.

6. Cliquez sur "Create Web Service"
7. Le build va commencer automatiquement (5-10 minutes la première fois)
8. **Notez l'URL du service** qui sera générée (ex: `https://flowstate-backend.onrender.com`)

## Étape 4: Créer Redis (Key Value) - REQUIS

**Important**: Redis est requis pour la queue d'emails. Sans Redis, les emails ne seront pas envoyés.

### 4.1: Créer l'instance Redis (Key Value)

1. Dans le dashboard Render, cliquez sur **"New +"** (en haut à droite)
2. Dans le menu déroulant, sélectionnez **"Key Value"** (c'est le nom officiel de Redis sur Render)
3. Remplissez le formulaire:
   - **Name**: `flowstate-redis` (ou un nom de votre choix)
   - **Region**: **IMPORTANT** - Choisissez la **même région** que votre backend et PostgreSQL
     - Cela permet une communication gratuite et rapide entre les services
   - **Plan**: Sélectionnez **"Free"** (pour les tests) ou un plan payant si vous avez besoin de persistance des données
4. Cliquez sur **"Create Key Value"**
5. ⏱️ **Attendez 1-2 minutes** que Redis soit créé et configuré

### 4.2: Récupérer l'URL de connexion Redis

1. Une fois créé, cliquez sur votre instance Redis (`flowstate-redis`)
2. Allez dans l'onglet **"Info"** (ou **"Connect"**)
3. **Copiez l'Internal Redis URL** - elle ressemble à :
   - `redis://red-xxxxxxxxxxxxxxxxxxxx:6379`
   - ⚠️ **Utilisez l'Internal Redis URL**, pas l'External !
   - ⚠️ Notez que sur Render, l'URL peut aussi être au format `redis://red-xxxxx` (sans le port, le port 6379 est implicite)

### 4.3: Configurer Redis dans le Backend

1. Retournez à votre service backend (`flowstate-backend`) sur Render
2. Cliquez sur **"Environment"** dans le menu de gauche
3. Vous avez **deux options** pour configurer Redis :

   **Option A (Recommandée) - Utiliser REDIS_URL :**
   - Cliquez sur **"Add Environment Variable"** (si `REDIS_URL` n'existe pas)
   - **Key**: `REDIS_URL`
   - **Value**: Collez l'Internal Redis URL copiée à l'étape 4.2 (ex: `redis://red-xxxxxxxxxxxxxxxxxxxx:6379`)
   - Cliquez sur **"Save"**

   **Option B - Utiliser REDIS_HOST et REDIS_PORT :**
   - Trouvez `REDIS_HOST` dans la liste des variables
   - Mettez à jour la valeur avec l'hostname de Redis (ex: `red-xxxxxxxxxxxxxxxxxxxx`)
     - Pour extraire l'hostname : si l'URL est `redis://red-xxxxx:6379`, l'hostname est `red-xxxxx`
   - Vérifiez que `REDIS_PORT` est défini à `6379`
   - Cliquez sur **"Save Changes"**

4. ⏱️ Le service backend va **redémarrer automatiquement** avec la nouvelle configuration (1-2 minutes)

### 4.4: Vérifier la connexion Redis

1. Une fois le backend redémarré, allez dans l'onglet **"Logs"** du service backend
2. Vous devriez voir :
   - `[PrismaService] Database connected successfully`
   - `[MailerService] SMTP server ready to send emails`
   - **Plus d'erreurs** `ECONNREFUSED` ou `Queue error occurred`
3. Si vous voyez encore des erreurs Redis, vérifiez :
   - Que `REDIS_URL` (ou `REDIS_HOST`/`REDIS_PORT`) est correctement configuré
   - Que Redis et le backend sont dans la **même région**
   - Que vous utilisez l'**Internal Redis URL**, pas l'External

**✅ Redis est maintenant configuré et la queue d'emails devrait fonctionner correctement !**

## Étape 5: Déployer le Frontend (Static Site)

1. Dans le dashboard Render, cliquez sur "New +"
2. Sélectionnez "Static Site"
3. Connectez votre repository (si pas déjà fait)
4. Remplissez la configuration:

   **Build Settings:**
   - **Name**: `flowstate-frontend`
   - **Region**: Même région
   - **Branch**: `master`
   - **Root Directory**: Laissez vide
   - **Build Command**: `npm install && npx nx build frontend --configuration=production`
   - **Publish Directory**: `dist/apps/frontend/browser`

5. Cliquez sur "Advanced" pour ajouter les variables d'environnement:

   ```
   API_URL = https://flowstate-backend.onrender.com/api
   ```

   **Important**: Remplacez `flowstate-backend` par le nom réel de votre service backend.

6. Cliquez sur "Create Static Site"
7. Le build va commencer (3-5 minutes)
8. **Notez l'URL du frontend** (ex: `https://flowstate-frontend.onrender.com`)

## Étape 6: Mettre à jour FRONTEND_URL dans le Backend

1. Retournez à votre service backend sur Render
2. Allez dans "Environment"
3. Mettez à jour `FRONTEND_URL` avec l'URL de votre frontend (ex: `https://flowstate-frontend.onrender.com`)
4. Cliquez sur "Save Changes"
5. Le backend va redémarrer

## Étape 7: Vérifier le Déploiement

1. **Frontend**: Ouvrez l'URL du frontend dans votre navigateur
   - Devrait afficher la page de login

2. **Backend API**: Ouvrez `https://votre-backend.onrender.com/api/health/live`
   - Devrait retourner un statut 200

3. **Swagger Docs**: Ouvrez `https://votre-backend.onrender.com/api/docs`
   - Devrait afficher la documentation Swagger

## Notes Importantes

- Les services gratuits sur Render s'endorment après 15 minutes d'inactivité
- Le premier démarrage après l'endormissement peut prendre 30-60 secondes
- Pour éviter l'endormissement, vous pouvez utiliser un service de ping gratuit (ex: UptimeRobot)

## URLs Finales

Une fois déployé, vous aurez:
- **Frontend**: `https://flowstate-frontend.onrender.com`
- **Backend API**: `https://flowstate-backend.onrender.com/api`
- **Swagger Docs**: `https://flowstate-backend.onrender.com/api/docs`

Ces URLs seront à ajouter en haut du README.md dans la section "Live Demo".
