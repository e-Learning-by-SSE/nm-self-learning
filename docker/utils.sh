#!/bin/bash
RED='\033[0;31m'
GREEN='\033[1;32m'
NC='\033[0m'
MIGRATION_DIR="/app/libs/data-access/database/prisma/migrations"

detect_migrations() {
    # Based on: https://stackoverflow.com/a/2108296
    for dir in ${MIGRATION_DIR}/*/
        do
        # Extract migration name
        dir=${dir%*/}
        migration="${dir##*/}"

        echo -e "   Found migration ${GREEN}${migration}${NC}; marked as applied"
        npx prisma migrate resolve --applied $migration
    done
}

start() {
    # Start Next.js
    if [ ! -z "${RUN_AS_DEMO}" ]; then
        npm run start:demo
    else
        npm run start:prod
    fi
}

wait_for_db() {
    # Wait until DB is running (only if a host was specified)
    if [ ! -z "${DB_HOST}" ]; then
        while ! pg_isready -h $DB_HOST -p $DB_PORT &> /dev/null; do
            sleep 1
            echo "Waiting for Postgres"
        done
    fi
}