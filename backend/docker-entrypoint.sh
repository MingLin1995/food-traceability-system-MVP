#!/bin/sh
set -e

# Wait for database
echo "Waiting for database..."
RETRY_COUNT=0
MAX_RETRIES=30

while ! nc -z db 5432; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "ERROR: Database connection timeout after ${MAX_RETRIES} attempts"
    exit 1
  fi
  sleep 1
done
echo "Database is ready!"

# 開發環境：生成 Prisma Client 並執行 migration dev
if [ "$NODE_ENV" = "development" ]; then
  echo "Development mode detected"

  echo "Generating Prisma Client..."
  if ! bunx prisma generate; then
    echo "ERROR: Prisma Client generation failed"
    exit 1
  fi

  echo "Running database migrations (dev mode)..."
  if ! bunx prisma migrate deploy; then
    echo "ERROR: Database migration failed"
    exit 1
  fi

  echo "Running database seed..."
  bun run prisma:seed || echo "WARNING: Seed failed or was skipped (this is usually OK)"

# 生產環境：執行 migration deploy
else
  echo "Production mode detected"

  echo "Running database migrations..."
  if ! bunx prisma migrate deploy; then
    echo "ERROR: Database migration failed"
    exit 1
  fi

  echo "Running database seed..."
  if ! bun run prisma:seed:prod; then
    echo "WARNING: Seed failed or was skipped (this is usually OK if database is already initialized)"
  fi
fi

echo "Starting application..."
exec "$@"
