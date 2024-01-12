#!/bin/bash

touch .env

source .env

TO_DO="${1:-'no'}"

ONLY="${2:-'no'}"

# Simple if condition
if [ "$TO_DO" = "--generate" ]; then
  echo "generating migration for=$ONLY"
  FOR=$ONLY npm run typeorm:migration-generate
  exit 0
fi

if [ "$TO_DO" = "--migrate" ]; then
  echo "migrating pending db schema"
  npm run typeorm:migration-up
  exit 0
fi


if [ "$TO_DO" = "--migrate-down" ]; then
  echo "reverting last migration"
  FOR=$ONLY npm run typeorm:migration-down
  exit 0
fi

if [ "$TO_DO" = "--install" ]; then
  npm install
  exit 0
fi

echo "starting the required local containers"

docker compose --file $(pwd)/docker-compose.yml up adminer db -d

echo "setting up local env"

npm run dev
