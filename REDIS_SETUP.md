# 🔴 Redis Setup Guide pour FlowState

## Pourquoi Redis ?

Redis est utilisé pour **Bull**, notre système de queue pour les emails. Voici les avantages :

### ✅ Avantages du système de queue :
1. **Performance** : Les requêtes HTTP ne sont jamais bloquées par l'envoi d'emails
2. **Fiabilité** : Retry automatique en cas d'échec (3 tentatives par défaut)
3. **Scalabilité** : Traitement asynchrone et parallèle
4. **Monitoring** : Logs détaillés de chaque job
5. **Exponential Backoff** : Délai progressif entre les tentatives (2s, 4s, 8s)

## Installation avec Docker (Recommandé)

### Option 1 : Redis standalone (Simple)

```bash
# Démarrer Redis
docker run -d \
  --name flowstate-redis \
  -p 6379:6379 \
  redis:7-alpine

# Vérifier que Redis fonctionne
docker ps | grep flowstate-redis

# Tester la connexion
docker exec -it flowstate-redis redis-cli ping
# Devrait retourner: PONG
```

### Option 2 : Redis avec persistence (Production-ready)

```bash
# Créer un volume pour persister les données
docker volume create flowstate-redis-data

# Démarrer Redis avec persistence
docker run -d \
  --name flowstate-redis \
  -p 6379:6379 \
  -v flowstate-redis-data:/data \
  redis:7-alpine redis-server --appendonly yes

# Vérifier
docker logs flowstate-redis
```

### Option 3 : Utiliser docker-compose (Le plus pro)

Crée un fichier `docker-compose.yml` à la racine de `flowstate/` :

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: flowstate-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: flowstate
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: flowstate-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

Puis :

```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f redis

# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

## Configuration dans FlowState

Ton `.env` doit contenir :

```env
# Redis Configuration (for Bull queue)
REDIS_HOST=localhost
REDIS_PORT=6379
```

Si Redis est sur un autre serveur ou avec mot de passe :

```env
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_password  # Optionnel
REDIS_TLS=true                        # Optionnel pour production
```

## Commandes utiles

### Vérifier l'état de Redis

```bash
# Via Docker
docker exec -it flowstate-redis redis-cli ping

# Voir les infos
docker exec -it flowstate-redis redis-cli info

# Voir les clés (queues)
docker exec -it flowstate-redis redis-cli keys "*"

# Voir le contenu d'une queue Bull
docker exec -it flowstate-redis redis-cli LRANGE bull:email:wait 0 -1
```

### Monitoring des queues

```bash
# Nombre de jobs en attente
docker exec -it flowstate-redis redis-cli LLEN bull:email:wait

# Nombre de jobs actifs
docker exec -it flowstate-redis redis-cli LLEN bull:email:active

# Nombre de jobs complétés
docker exec -it flowstate-redis redis-cli ZCARD bull:email:completed

# Nombre de jobs en échec
docker exec -it flowstate-redis redis-cli ZCARD bull:email:failed
```

### Nettoyage

```bash
# Vider toutes les queues (ATTENTION : perte de données)
docker exec -it flowstate-redis redis-cli FLUSHALL

# Redémarrer Redis
docker restart flowstate-redis

# Arrêter et supprimer le container
docker stop flowstate-redis
docker rm flowstate-redis
```

## Cron Jobs et Scheduler

### Comment ça fonctionne ?

Les **cron jobs sont automatiques** ! Une fois le backend démarré, NestJS Schedule s'occupe de tout :

#### 📅 Planning des notifications :

1. **Task Reminders** : Tous les jours à 9h00
   - Envoie un rappel pour les tâches dues demain
   - Cron expression : `0 9 * * *`

2. **Overdue Tasks Summary** : Tous les jours à 7h00
   - Résumé des tâches en retard
   - Cron expression : `0 7 * * *`

3. **Weekly Focus Report** : Tous les dimanches à 17h00
   - Rapport hebdomadaire de productivité
   - Cron expression : `0 17 * * 0`

### Tu n'as RIEN à faire !

Les schedulers démarrent automatiquement avec ton backend. Dans les logs tu verras :

```
[TaskReminderService] Starting task reminder job
[TaskReminderService] Found 5 tasks due tomorrow
[TaskReminderService] Task reminder job completed: 5 reminders queued
```

### Tester les cron jobs manuellement

Si tu veux tester sans attendre, tu peux créer un endpoint temporaire :

```typescript
// Dans un controller de test
@Get('/test/cron')
async testCron() {
  await this.taskReminderService.sendTaskReminders();
  return { message: 'Cron job executed manually' };
}
```

## Architecture du système de queue

```
┌─────────────┐
│   Client    │
│  (Frontend) │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────┐
│  NestJS API │ ──────────► Returns immediately (non-blocking)
│  (Backend)  │
└──────┬──────┘
       │ Add job to queue
       ▼
┌─────────────┐
│    Redis    │ ──────────► Stores jobs in queue
│   (Queue)   │
└──────┬──────┘
       │ Process jobs
       ▼
┌─────────────┐
│Email Worker │ ──────────► Sends emails asynchronously
│ (Processor) │             - 3 retry attempts
└─────────────┘             - Exponential backoff
                            - Error logging
```

## Troubleshooting

### Erreur : "connect ECONNREFUSED 127.0.0.1:6379"

Redis n'est pas démarré. Lance :
```bash
docker start flowstate-redis
```

Ou démarre-le avec :
```bash
docker run -d --name flowstate-redis -p 6379:6379 redis:7-alpine
```

### Erreur : "port 6379 is already in use"

Un autre service utilise le port. Trouve le processus :
```bash
# Windows
netstat -ano | findstr :6379

# Linux/Mac
lsof -i :6379
```

Puis arrête-le ou change le port Redis dans `.env`.

### Les emails ne partent pas

1. Vérifie Redis :
   ```bash
   docker exec -it flowstate-redis redis-cli ping
   ```

2. Vérifie les jobs en échec :
   ```bash
   docker exec -it flowstate-redis redis-cli ZRANGE bull:email:failed 0 -1
   ```

3. Consulte les logs du backend :
   ```bash
   # Dans les logs, cherche :
   [EmailProcessor] Failed to send email
   ```

4. Vérifie ta clé Resend :
   ```bash
   # Dans .env
   RESEND_API_KEY=re_...
   ```

## Production Recommendations

Pour la production, considère :

1. **Redis Cloud** : [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
2. **AWS ElastiCache** : Service Redis managé AWS
3. **Upstash** : Redis serverless
4. **Railway/Render** : Redis intégré

## Résumé

```bash
# 1. Démarre Redis
docker run -d --name flowstate-redis -p 6379:6379 redis:7-alpine

# 2. Vérifie que c'est OK
docker exec -it flowstate-redis redis-cli ping

# 3. Démarre ton backend
npm run start:dev

# 4. Les cron jobs démarrent automatiquement !
# 5. Les emails sont envoyés en arrière-plan via la queue
```

C'est tout ! 🎉

