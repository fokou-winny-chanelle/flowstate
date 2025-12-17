# Guide de Déploiement Render.com - Étape par Étape

Ce guide vous accompagne pour déployer FlowState sur Render.com. Suivez chaque étape dans l'ordre.

## 📋 Prérequis

- ✅ Compte GitHub avec le repository FlowState
- ✅ Compte Render.com (gratuit)
- ✅ Fichier `.env` local avec toutes les variables (pour référence)

---

## 🔐 ÉTAPE 1 : Créer/Connecter le Compte Render

**Action requise :**

1. Allez sur https://render.com
2. Si vous n'avez pas de compte :
   - Cliquez sur "Get Started for Free"
   - Choisissez "Sign up with GitHub"
   - Autorisez Render à accéder à votre compte GitHub
3. Si vous avez déjà un compte, connectez-vous

**✅ Une fois connecté, dites-moi "Étape 1 terminée" et je continuerai.**

---

## 🗄️ ÉTAPE 2 : Créer la Base de Données PostgreSQL

**Action requise :**

1. Dans le dashboard Render, cliquez sur **"New +"** (en haut à droite)
2. Sélectionnez **"PostgreSQL"**
3. Remplissez le formulaire :
   - **Name** : `flowstate-db`
   - **Database** : `flowstate` (laissez par défaut)
   - **User** : `flowstate_user` (laissez par défaut)
   - **Region** : Choisissez la région la plus proche (ex: **Frankfurt** ou **Ireland**)
   - **PostgreSQL Version** : `16` (ou la plus récente)
   - **Plan** : Sélectionnez **"Free"**
4. Cliquez sur **"Create Database"**
5. ⏱️ **Attendez 2-3 minutes** que la base soit créée
6. Une fois créée, cliquez sur votre base de données
7. **IMPORTANT** : Dans l'onglet "Info", copiez la **"Internal Database URL"**
   - Elle ressemble à : `postgresql://flowstate_user:xxxxx@dpg-xxxxx-a.frankfurt-postgres.render.com/flowstate`
   - ⚠️ Utilisez l'**Internal Database URL**, pas l'External !

**✅ Une fois la base créée et l'URL copiée, dites-moi "Étape 2 terminée - URL copiée" et je continuerai.**

---

## 🚀 ÉTAPE 3 : Déployer le Backend (Web Service)

**Action requise :**

1. Dans le dashboard Render, cliquez sur **"New +"**
2. Sélectionnez **"Web Service"**
3. Connectez votre repository GitHub :
   - Si c'est la première fois, cliquez sur **"Connect account"** et autorisez Render
   - Sélectionnez votre repository : `fokou-winny-chanelle/flowstate` (ou votre repo)
   - Cliquez sur **"Connect"**
4. Remplissez la configuration :

   **Basic Settings :**
   - **Name** : `flowstate-backend`
   - **Region** : **Même région** que votre base de données
   - **Branch** : `master` (ou votre branche principale)
   - **Root Directory** : Laissez **vide**
   - **Runtime** : Sélectionnez **"Docker"**
   - **Dockerfile Path** : `backend/Dockerfile`
   - **Docker Context** : `.` (un point, racine du projet)
   - **Plan** : Sélectionnez **"Free"**

5. Cliquez sur **"Advanced"** pour ajouter les variables d'environnement

6. Cliquez sur **"Add Environment Variable"** et ajoutez **CHAQUE** variable suivante :

   ```
   NODE_ENV = production
   PORT = 3000
   DATABASE_URL = [Collez l'Internal Database URL de l'étape 2]
   REDIS_URL = [On mettra à jour après l'étape 4, laissez vide pour l'instant]
   JWT_SECRET = [Votre JWT_SECRET du .env local - minimum 32 caractères]
   JWT_REFRESH_SECRET = [Votre JWT_REFRESH_SECRET du .env local - minimum 32 caractères]
   JWT_ACCESS_EXPIRES_IN = 15m
   JWT_REFRESH_EXPIRES_IN = 7d
   GMAIL_USER = [Votre GMAIL_USER du .env local]
   GMAIL_APP_PASSWORD = [Votre GMAIL_APP_PASSWORD du .env local - 16 caractères]
   APP_NAME = FlowState
   FRONTEND_URL = [On mettra à jour après le déploiement du frontend, laissez vide pour l'instant]
   CORS_ORIGINS = [On mettra à jour après, laissez vide pour l'instant]
   ```
   
   **Note**: Pour Redis, nous utiliserons `REDIS_URL` (recommandé pour Render). Nous le configurerons à l'étape 4 après avoir créé l'instance Redis.

   **⚠️ Important :**
   - Pour `DATABASE_URL`, utilisez l'**Internal Database URL** copiée à l'étape 2
   - Pour `JWT_SECRET` et `JWT_REFRESH_SECRET`, utilisez les valeurs de votre `.env` local
   - Pour `GMAIL_USER` et `GMAIL_APP_PASSWORD`, utilisez les valeurs de votre `.env` local

7. Cliquez sur **"Create Web Service"**
8. ⏱️ Le build va commencer automatiquement (5-10 minutes la première fois)
9. **Notez l'URL du service** qui sera générée (ex: `https://flowstate-backend.onrender.com`)
   - Vous la trouverez en haut de la page du service une fois créé

**✅ Une fois le backend déployé (status "Live"), dites-moi "Étape 3 terminée - Backend URL: [votre-url]" et je continuerai.**

---

## 🔴 ÉTAPE 4 : Créer Redis (Key Value) - REQUIS

**⚠️ Important :** Redis est **requis** pour la queue d'emails. Sans Redis, les emails ne seront pas envoyés et vous verrez des erreurs `ECONNREFUSED` dans les logs.

**Action requise :**

### 4.1 : Créer l'instance Redis (Key Value)

1. Dans le dashboard Render, cliquez sur **"New +"** (en haut à droite)
2. Dans le menu déroulant, sélectionnez **"Key Value"** 
   - ⚠️ **Note importante** : Sur Render, Redis s'appelle officiellement **"Key Value"**, pas "Redis"
   - Si vous ne voyez pas "Key Value" dans la liste, cherchez dans la section des services de données
3. Remplissez le formulaire :
   - **Name** : `flowstate-redis` (ou un nom de votre choix)
   - **Region** : **IMPORTANT** - Choisissez la **même région** que votre backend et PostgreSQL
     - Cela permet une communication gratuite et rapide entre les services
   - **Plan** : Sélectionnez **"Free"** (pour les tests) ou un plan payant si vous avez besoin de persistance
4. Cliquez sur **"Create Key Value"**
5. ⏱️ **Attendez 1-2 minutes** que Redis soit créé et configuré

### 4.2 : Récupérer l'URL de connexion Redis

1. Une fois créé, cliquez sur votre instance Redis (`flowstate-redis`)
2. Allez dans l'onglet **"Info"** (ou **"Connect"**)
3. **Copiez l'Internal Redis URL** - elle ressemble à :
   - `redis://red-xxxxxxxxxxxxxxxxxxxx:6379`
   - ⚠️ **Utilisez l'Internal Redis URL**, pas l'External !
   - ⚠️ Sur Render, l'URL peut aussi être au format `redis://red-xxxxx` (sans le port, le port 6379 est implicite)

### 4.3 : Configurer Redis dans le Backend

1. Retournez à votre service backend (`flowstate-backend`) sur Render
2. Cliquez sur **"Environment"** dans le menu de gauche
3. Vous avez **deux options** pour configurer Redis :

   **Option A (Recommandée) - Utiliser REDIS_URL :**
   - Cliquez sur **"Add Environment Variable"** (si `REDIS_URL` n'existe pas)
   - **Key** : `REDIS_URL`
   - **Value** : Collez l'Internal Redis URL copiée à l'étape 4.2
     - Exemple : `redis://red-xxxxxxxxxxxxxxxxxxxx:6379`
   - Cliquez sur **"Save"**

   **Option B - Utiliser REDIS_HOST et REDIS_PORT :**
   - Trouvez `REDIS_HOST` dans la liste des variables
   - Mettez à jour la valeur avec l'hostname de Redis
     - Pour extraire l'hostname : si l'URL est `redis://red-xxxxx:6379`, l'hostname est `red-xxxxx`
   - Vérifiez que `REDIS_PORT` est défini à `6379`
   - Cliquez sur **"Save Changes"**

4. ⏱️ Le service backend va **redémarrer automatiquement** avec la nouvelle configuration (1-2 minutes)

### 4.4 : Vérifier la connexion Redis

1. Une fois le backend redémarré, allez dans l'onglet **"Logs"** du service backend
2. Vous devriez voir :
   - `[PrismaService] Database connected successfully`
   - `[MailerService] SMTP server ready to send emails`
   - **Plus d'erreurs** `ECONNREFUSED` ou `Queue error occurred`
3. Si vous voyez encore des erreurs Redis, vérifiez :
   - Que `REDIS_URL` (ou `REDIS_HOST`/`REDIS_PORT`) est correctement configuré
   - Que Redis et le backend sont dans la **même région**
   - Que vous utilisez l'**Internal Redis URL**, pas l'External

**✅ Une fois Redis configuré et les logs sans erreur, dites-moi "Étape 4 terminée - Redis configuré" et je continuerai.**

---

## 🎨 ÉTAPE 5 : Déployer le Frontend (Static Site)

**Action requise :**

1. Dans le dashboard Render, cliquez sur **"New +"**
2. Sélectionnez **"Static Site"**
3. Connectez votre repository (si pas déjà fait) :
   - Sélectionnez votre repository : `fokou-winny-chanelle/flowstate`
   - Cliquez sur **"Connect"**
4. Remplissez la configuration :

   **Build Settings :**
   - **Name** : `flowstate-frontend`
   - **Region** : **Même région** que les autres services
   - **Branch** : `master` (ou votre branche principale)
   - **Root Directory** : Laissez **vide**
   - **Build Command** : `npm install && npx nx build frontend --configuration=production`
   - **Publish Directory** : `dist/apps/frontend/browser`

5. Cliquez sur **"Advanced"** pour ajouter les variables d'environnement

6. Cliquez sur **"Add Environment Variable"** et ajoutez :

   ```
   API_URL = https://flowstate-backend.onrender.com/api
   ```

   **⚠️ Important :** Remplacez `flowstate-backend` par le **nom réel** de votre service backend (celui noté à l'étape 3)

7. Cliquez sur **"Create Static Site"**
8. ⏱️ Le build va commencer (3-5 minutes)
9. **Notez l'URL du frontend** (ex: `https://flowstate-frontend.onrender.com`)
   - Vous la trouverez en haut de la page du service une fois créé

**✅ Une fois le frontend déployé (status "Live"), dites-moi "Étape 5 terminée - Frontend URL: [votre-url]" et je continuerai.**

---

## 🔄 ÉTAPE 6 : Mettre à jour FRONTEND_URL dans le Backend

**Action requise :**

1. Retournez à votre service backend (`flowstate-backend`) sur Render
2. Cliquez sur **"Environment"** dans le menu de gauche
3. Trouvez `FRONTEND_URL` et mettez à jour avec l'URL de votre frontend (ex: `https://flowstate-frontend.onrender.com`)
4. Trouvez `CORS_ORIGINS` et mettez à jour avec : `https://flowstate-frontend.onrender.com,https://flowstate-backend.onrender.com`
   - Remplacez par vos vraies URLs
5. Cliquez sur **"Save Changes"**
6. ⏱️ Le backend va redémarrer automatiquement (1-2 minutes)

**✅ Une fois les variables mises à jour, dites-moi "Étape 6 terminée" et je continuerai.**

---

## ✅ ÉTAPE 7 : Vérifier le Déploiement

**Action requise :**

1. **Testez le Backend API** :
   - Ouvrez dans votre navigateur : `https://votre-backend.onrender.com/api/health/live`
   - **Résultat attendu** : Statut 200 avec `{"status":"ok"}`

2. **Testez Swagger Docs** :
   - Ouvrez : `https://votre-backend.onrender.com/api/docs`
   - **Résultat attendu** : Documentation Swagger de l'API

3. **Testez le Frontend** :
   - Ouvrez l'URL de votre frontend dans votre navigateur
   - **Résultat attendu** : Page de login de FlowState

4. **Testez le Login** :
   - Essayez de vous connecter avec vos identifiants
   - **Résultat attendu** : Connexion réussie et redirection vers `/today`

**✅ Une fois tous les tests réussis, dites-moi "Étape 7 terminée - Tout fonctionne" et je mettrai à jour le README avec les vraies URLs.**

---

## 📝 ÉTAPE 8 : Mettre à jour le README

**Action requise de ma part :**

Une fois que vous m'aurez confirmé que tout fonctionne, je mettrai à jour le README.md avec :
- Les vraies URLs de production (frontend, backend, Swagger)
- La section "Live Demo" avec les liens fonctionnels

**✅ Dites-moi simplement "Tout est prêt" et je mettrai à jour le README.**

---

## 🎉 Félicitations !

Votre application FlowState est maintenant déployée en production sur Render.com !

**Note importante :**
- Les services gratuits sur Render s'endorment après 15 minutes d'inactivité
- Le premier démarrage après l'endormissement peut prendre 30-60 secondes
- Pour éviter l'endormissement, vous pouvez utiliser un service de ping gratuit (ex: UptimeRobot)

---

**Prêt à commencer ? Dites-moi "Je commence l'étape 1" et je vous guiderai !**

