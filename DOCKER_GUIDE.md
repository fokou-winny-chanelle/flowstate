# Guide Docker - FlowState Backend

## Démarrage rapide avec Docker

### Prérequis
- Docker Desktop installé et démarré
- Fichier `.env` configuré à la racine de `flowstate/`

### Option 1 : Développement local (sans Docker)

```bash
# Démarrer Redis et PostgreSQL uniquement
docker-compose up postgres redis -d

# Vérifier que les services tournent
docker-compose ps

# Démarrer le backend en mode développement
npm run start:dev
```

### Option 2 : Tout avec Docker (production-like)

```bash
# Build et démarrer tous les services
docker-compose up --build -d

# Voir les logs
docker-compose logs -f backend

# Vérifier la santé
curl http://localhost:3000/health

# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (ATTENTION: perte de données)
docker-compose down -v
```

## Configuration du fichier .env

Créer un fichier `.env` à la racine de `flowstate/` avec ces variables :

```env
# Database
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/flowstate?schema=public"
DB_PASSWORD="your_secure_password"

# JWT (MINIMUM 32 caractères chacun)
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key-change-in-production-min-32-chars"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Email (Resend)
RESEND_API_KEY="re_your_actual_resend_api_key"
RESEND_FROM_EMAIL="onboarding@resend.dev"

# Application
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:4200"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
```

## Commandes utiles

### Gestion des services

```bash
# Démarrer un service spécifique
docker-compose up postgres -d

# Redémarrer un service
docker-compose restart backend

# Voir les logs d'un service
docker-compose logs -f postgres

# Exécuter une commande dans un container
docker-compose exec backend node -v
docker-compose exec postgres psql -U postgres -d flowstate
```

### Migrations Prisma

```bash
# En développement local
npx prisma migrate dev

# Dans le container Docker
docker-compose exec backend npx prisma migrate deploy
```

### Health Checks

Le backend expose 3 endpoints de santé :

```bash
# Health check complet (DB incluse)
curl http://localhost:3000/health

# Readiness check
curl http://localhost:3000/health/ready

# Liveness check (basique)
curl http://localhost:3000/health/live
```

Réponse attendue :
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up",
      "message": "Database is healthy"
    }
  }
}
```

### Tester les schedulers

```bash
# Vérifier le statut des cron jobs
curl http://localhost:3000/scheduler/status

# Exécuter manuellement task-reminders
curl http://localhost:3000/scheduler/test/task-reminders

# Exécuter manuellement overdue-summary
curl http://localhost:3000/scheduler/test/overdue-summary

# Exécuter manuellement focus-report
curl http://localhost:3000/scheduler/test/focus-report
```

### Monitoring Redis

```bash
# Connexion Redis CLI
docker-compose exec redis redis-cli

# Dans le CLI Redis:
> PING
PONG

> KEYS *
# Liste toutes les clés

> LLEN bull:email:wait
# Nombre de jobs en attente

> LLEN bull:email:active
# Nombre de jobs en cours

> ZRANGE bull:email:failed 0 -1
# Liste des jobs échoués
```

### Debugging

```bash
# Voir les logs détaillés du backend
docker-compose logs -f backend

# Entrer dans le container backend
docker-compose exec backend sh

# Inspecter les variables d'environnement
docker-compose exec backend env | grep -i jwt

# Tester la connexion DB depuis le container
docker-compose exec backend node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('Connected')).catch(e => console.error(e))"
```

## Déploiement Production

### Variables d'environnement de production

Assure-toi que ces variables sont bien configurées :

```env
NODE_ENV="production"
JWT_SECRET="[SECRET DE 64+ CARACTERES ALEATOIRES]"
JWT_REFRESH_SECRET="[AUTRE SECRET DE 64+ CARACTERES]"
DATABASE_URL="[URL DE VOTRE DB PRODUCTION]"
REDIS_HOST="[URL REDIS PRODUCTION]"
RESEND_API_KEY="[CLE API RESEND PRODUCTION]"
```

### Build de l'image

```bash
# Build l'image de production
docker build -f backend/Dockerfile -t flowstate-backend:latest .

# Tag pour le registry
docker tag flowstate-backend:latest your-registry.com/flowstate-backend:latest

# Push vers le registry
docker push your-registry.com/flowstate-backend:latest
```

### Déploiement sur des plateformes cloud

#### Railway

1. Connecter le repo GitHub à Railway
2. Ajouter les variables d'environnement
3. Railway détecte automatiquement le Dockerfile
4. Déploiement automatique à chaque push

#### Render.com

1. Créer un nouveau Web Service
2. Runtime: Docker
3. Dockerfile Path: `backend/Dockerfile`
4. Docker Context: `.` (racine du projet)
5. Configurer les variables d'environnement (voir RENDER_DEPLOYMENT_STEPS.md)
6. **Important**: Le script `docker-entrypoint.sh` détecte automatiquement `DATABASE_URL` et utilise directement Prisma pour les migrations (pas besoin de résolution DNS)
7. Ajouter PostgreSQL et Redis depuis Render
8. Utiliser l'**Internal Database URL** pour `DATABASE_URL` (pas l'External)

**Note**: Le script d'initialisation supporte maintenant deux modes :
- **Mode Render/Cloud** : Détecte `DATABASE_URL` et utilise directement Prisma
- **Mode Docker Compose** : Utilise la résolution DNS pour `postgres:5432`

#### AWS ECS/Fargate

1. Push l'image sur ECR
2. Créer un Task Definition avec le Dockerfile
3. Créer un Service ECS
4. Configurer RDS (PostgreSQL) et ElastiCache (Redis)

## Troubleshooting

### Le backend ne démarre pas

```bash
# Vérifier les logs
docker-compose logs backend

# Erreurs communes :
# 1. DATABASE_URL invalide
# 2. Redis non accessible
# 3. Secrets JWT trop courts (< 32 caractères)
```

### La DB n'est pas accessible

```bash
# Vérifier que PostgreSQL tourne
docker-compose ps postgres

# Tester la connexion
docker-compose exec postgres psql -U postgres -c "SELECT 1"

# Recréer le container si nécessaire
docker-compose down postgres
docker-compose up postgres -d
```

### Redis connection failed

```bash
# Vérifier Redis
docker-compose exec redis redis-cli ping

# Redémarrer Redis
docker-compose restart redis
```

### Les migrations Prisma échouent

```bash
# Vérifier la connexion DB
docker-compose exec backend npx prisma db pull

# Forcer les migrations
docker-compose exec backend npx prisma migrate deploy --force

# Générer le client Prisma
docker-compose exec backend npx prisma generate
```

**Sur Render.com** : Le script `docker-entrypoint.sh` détecte automatiquement `DATABASE_URL` et exécute les migrations. Si les migrations échouent :
1. Vérifiez que `DATABASE_URL` utilise l'**Internal Database URL** (sans `.oregon-postgres.render.com`)
2. Vérifiez les logs du service backend sur Render
3. Le script affichera "DATABASE_URL detected - using direct connection" si tout est correct

### Les cron jobs ne s'exécutent pas

Les cron jobs démarrent automatiquement avec le backend. Vérifier :

```bash
# Logs du backend au démarrage
docker-compose logs backend | grep -i cron

# Tester manuellement
curl http://localhost:3000/scheduler/test/task-reminders

# Vérifier la timezone
docker-compose exec backend date
```

## Performance et Scaling

### Augmenter les ressources Docker

Dans `docker-compose.yml`, ajouter :

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        cpus: '1'
        memory: 1G
```

### Scaling horizontal

```bash
# Démarrer plusieurs instances du backend
docker-compose up --scale backend=3 -d

# Utiliser un load balancer (nginx, traefik)
```

### Caching et optimisation

- Redis déjà configuré pour les queues
- Activer le query caching Prisma en production
- Utiliser CDN pour les assets statiques

## Sécurité

### Bonnes pratiques

1. Ne jamais commit le fichier `.env`
2. Utiliser des secrets de 64+ caractères en production
3. Activer HTTPS en production
4. Limiter l'accès aux ports (firewall)
5. Scanner régulièrement les vulnérabilités : `docker scan flowstate-backend`
6. Mettre à jour les images régulièrement

### Secrets management

En production, utiliser :
- AWS Secrets Manager
- HashiCorp Vault
- Docker Secrets (avec Swarm)
- Kubernetes Secrets

## Monitoring et Logs

### Logs centralisés

```bash
# Exporter les logs vers un fichier
docker-compose logs > logs.txt

# Utiliser un service de logging
# - CloudWatch (AWS)
# - Stackdriver (GCP)
# - Papertrail
# - Datadog
```

### Métriques

Le healthcheck Docker permet :
- Auto-restart en cas de crash
- Monitoring via Docker API
- Intégration avec orchestrateurs (K8s, ECS)

## Backup et Restore

### Backup PostgreSQL

```bash
# Backup manuel
docker-compose exec postgres pg_dump -U postgres flowstate > backup.sql

# Backup automatique (cron)
0 2 * * * docker-compose exec -T postgres pg_dump -U postgres flowstate > /backups/flowstate-$(date +\%Y\%m\%d).sql
```

### Restore

```bash
# Restore depuis un backup
docker-compose exec -T postgres psql -U postgres flowstate < backup.sql
```

### Backup Redis (données de queue)

```bash
# Forcer un save
docker-compose exec redis redis-cli SAVE

# Copier le dump
docker cp flowstate-redis:/data/dump.rdb ./redis-backup.rdb
```

## Support

Pour les problèmes persistants :
1. Vérifier les logs : `docker-compose logs`
2. Vérifier les health checks : `curl http://localhost:3000/health`
3. Tester les composants individuellement
4. Consulter la documentation Prisma, NestJS, Bull

