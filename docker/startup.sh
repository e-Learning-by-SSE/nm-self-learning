#!/bin/bash
source utils.sh

initialization() {
    echo -e "${RED}Initializing SelfLearn${NC}"
    echo -e "${GREEN} - Waiting for DB to be ready${NC}"
    wait_for_db

    echo -e "${GREEN} - Initializing Database${NC}"
    # Create DB, but do touch existing data
    npx prisma db push
    # TODO: Seed administration data if exists

    # Mark all migrations as applied
    echo -e "${GREEN} - Marking Migrations as applied${NC}"
    detect_migrations

    echo -e "${RED}Initializing done; starting SelfLearn${NC}"
    start
}

migration() {
    echo -e "${RED}Migrate Update${NC}"
    echo -e "${GREEN} - Waiting for DB to be ready${NC}"
    wait_for_db

    echo -e "${GREEN} - Apply Migrations${NC}"
    npx prisma migrate deploy

    echo -e "${RED}Migration done; starting SelfLearn${NC}"
    start
}

reset() {
    echo -e "${RED}Reseting SelfLearn${NC}"
    echo -e "${GREEN} - Waiting for DB to be ready${NC}"
    wait_for_db

    echo -e "${GREEN} - Clear Database${NC}"
    # Create DB, but do touch existing data
    npx prisma db push --force-reset
    # TODO: Seed administration data if exists

    # Mark all migrations as applied
    echo -e "${GREEN} - Marking Migrations as applied${NC}"
    detect_migrations

    echo -e "${RED}Reseting done; starting SelfLearn${NC}"
    start
}

startup() {
    OPTION=$1

    case $OPTION in
        init)
            initialization
            ;;
        migrate)
            migration
            ;;
        reset)
            reset
            ;;
        *)
            echo -e "${RED}Starting SelfLearn${NC}"
            start
            ;;
    esac
}