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
   REDIS_HOST = [Nous créerons Redis après]
   REDIS_PORT = 6379
   JWT_SECRET = [Votre JWT_SECRET du .env]
   JWT_REFRESH_SECRET = [Votre JWT_REFRESH_SECRET du .env]
   JWT_ACCESS_EXPIRES_IN = 15m
   JWT_REFRESH_EXPIRES_IN = 7d
   GMAIL_USER = [Votre GMAIL_USER]
   GMAIL_APP_PASSWORD = [Votre GMAIL_APP_PASSWORD]
   APP_NAME = FlowState
   FRONTEND_URL = [Nous mettrons à jour après avoir déployé le frontend]
   ```

   **Important**: Pour `DATABASE_URL`, utilisez l'**Internal Database URL** de Render, pas l'External.

6. Cliquez sur "Create Web Service"
7. Le build va commencer automatiquement (5-10 minutes la première fois)
8. **Notez l'URL du service** qui sera générée (ex: `https://flowstate-backend.onrender.com`)

## Étape 4: Créer Redis (Optionnel mais Recommandé)

1. Dans le dashboard Render, cliquez sur "New +"
2. Sélectionnez "Redis"
3. Remplissez:
   - **Name**: `flowstate-redis`
   - **Region**: Même région que les autres services
   - **Plan**: Free
4. Cliquez sur "Create Redis"
5. Une fois créé, cliquez sur votre Redis
6. **Copiez l'Internal Redis URL** (ex: `redis://red-xxxxx:6379`)
7. Retournez à votre service backend
8. Cliquez sur "Environment" dans le menu de gauche
9. Mettez à jour `REDIS_HOST` avec l'hostname de Redis (ex: `red-xxxxx`)
10. Cliquez sur "Save Changes" - le service va redémarrer automatiquement

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
