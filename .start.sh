#!/bin/bash

touch .env

source .env

TO_DO="${1:-'no'}"

ONLY="${2:-'no'}"


if [ "$TO_DO" = "--install" ]; then
  echo "installing deps for=$ONLY"
  npm i $ONLY
  docker compose run -it api npm i $ONLY
  echo "installing dev deps for=$ONLY if any"
  npm i -D @types/$ONLY
  docker compose run -it api npm i -D @types/$ONLY
  exit 0
fi

# Simple if condition
if [ "$TO_DO" = "--generate" ]; then
  echo "generating migration for=$ONLY"
  FOR=$ONLY npm run typeorm:migration-generate
  exit 0
fi

if [ "$TO_DO" = "--dev" ]; then
  echo "prod"
  if [ "$ONLY" = "--restart" ]; then
  docker compose down redis --down
  fi
  docker compose up api
  exit 0
fi


if [ "$TO_DO" = "--prod" ]; then
  echo "prod"
  env-cmd -f .env npm run start
  exit 0
fi

if [ "$TO_DO" = "--build" ]; then
  echo "generating migration for=$ONLY"
  npm run build && cd dist && ls -al && cd ..
  exit 0
fi

if [ "$TO_DO" = "--migrate" ]; then
  echo "migrating pending db schema"
  docker compose run -it api npm run typeorm:migration-up
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

if [ "$TO_DO" = "--flush" ]; then
  rm -rf .downloads
  exit 0
fi

echo "starting the required local containers"

docker compose --file $(pwd)/docker-compose.yaml up adminer db redis -d

echo "setting up local env"

npm run dev
