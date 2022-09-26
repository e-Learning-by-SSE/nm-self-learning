#!/bin/bash

# Wait until DB is running (only if a host was specified)
if [ ! -z "${DB_HOST}" ]; then
    while ! pg_isready -h $DB_HOST -p $DB_PORT &> /dev/null; do
        sleep 1
        echo waiting postgres
    done
fi


# Determine DB connection string (may be passed via paramter to container)
if [ -z "${DATABASE_URL}" ]; then
  # Load from file if not passed as parameter
  source /app/.env
fi

if [ ! -e /app/initialization ]; then
    echo "First boot, initialize app with DB connection: ${DATABASE_URL}"
    
    # Next.js requires rebuild whenever DB location was changed
    npm run build
    
    # Clear database and apply sample data on first boot
    npm run prisma migrate reset --force --skip-generate

    echo "${DATABASE_URL}" > /app/initialization
elif [ $(< /app/initialization) != "${DATABASE_URL}" ]; then
    echo "Reconfigure app with DB connection: ${DATABASE_URL}"
    
    # Next.js requires rebuild whenever DB location was changed
    npm run build
    
    # Clear database and apply sample data on first boot
    npm run prisma migrate reset --force --skip-generate

    echo "${DATABASE_URL}" > /app/initialization
fi

# Start Next.js
npm run start:prod