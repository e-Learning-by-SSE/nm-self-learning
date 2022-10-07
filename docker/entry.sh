#!/bin/bash

# Wait until DB is running (only if a host was specified)
if [ ! -z "${DB_HOST}" ]; then
    while ! pg_isready -h $DB_HOST -p $DB_PORT &> /dev/null; do
        sleep 1
        echo waiting postgres
    done
fi

# Check if any configuration parameters have been changed
# Add grep '^prefix_' to filter for relevant variables
# Store all OS environment variables (includes variables passed by Docker)
env -0 | sort -z | tr '\0' '\n' > outside.env
sed -i -e 's/=/="/;s/$/"/' outside.env
# Automatically export defined variables, based on: https://unix.stackexchange.com/a/79077
set -a
# Load variables of container (as default, will overwirte OS variables)
#sed -e 's/=/="/;s/$/"/' .env > old.env
#source old.env
#rm -f old.env
source .env
# Load tmp.env to restore passed variables
source outside.env
set +a
# Store variables (sorted to make comparison more stable)
# Add grep '^prefix_' to filter for relevant variables
env -0 | sort -z | tr '\0' '\n' > tmp.env
# Check if list of environment varaibles differ (or even doesn't exist)
if [ ! -z .env ] || ! cmp -s tmp.env .env; then
    echo "Environment was changed: Recompile app"
    mv .env .env_bak
    cp -f tmp.env .env
    sed -i -e 's/=/="/;s/$/"/' .env
    
    # Next.js requires rebuild whenever DB location was changed
    npm run build
    
    # Clear database and apply sample data on first boot
    npm run prisma migrate reset --force --skip-generate
fi

# Start Next.js
npm run start:prod