#!/bin/sh
set -e

# Default to postgres service name (Docker Compose)
DB_HOST=${DB_HOST:-postgres}
DB_PORT=${DB_PORT:-5432}

echo "Waiting for PostgreSQL to be ready..."
echo "Host: $DB_HOST, Port: $DB_PORT"

# Wait for PostgreSQL to be ready (max 60 seconds)
TIMEOUT=60
ELAPSED=0
until nc -z "$DB_HOST" "$DB_PORT" || [ $ELAPSED -ge $TIMEOUT ]; do
  echo "PostgreSQL is unavailable - sleeping (${ELAPSED}s/${TIMEOUT}s)"
  sleep 2
  ELAPSED=$((ELAPSED + 2))
done

if [ $ELAPSED -ge $TIMEOUT ]; then
  echo "ERROR: PostgreSQL did not become ready within ${TIMEOUT} seconds"
  exit 1
fi

echo "PostgreSQL is up - executing Prisma migrations"

# Run Prisma migrations
npx prisma migrate deploy --schema=./prisma/schema.prisma || {
  echo "WARNING: Migration failed, but continuing..."
}

echo "Migrations completed - starting application"

# Execute the main command
exec "$@"
