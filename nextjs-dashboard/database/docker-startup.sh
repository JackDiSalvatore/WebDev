#!/usr/bin/env bash

set -e

if command -v realpath >/dev/null 2>&1; then
    SCRIPT_DIR="$(dirname "$(realpath "${BASH_SOURCE[0]:-}")")"
elif command -v readlink >/dev/null 2>&1; then
    SCRIPT_DIR="$(dirname "$(readlink -f "${BASH_SOURCE[0]:-}")")"
else
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-}")" && pwd)"
fi
cd "${SCRIPT_DIR}"

REBUILD=false

for arg in "$@"; do
    if [ "$arg" == "--rebuild" ]; then
        REBUILD=true
        break
    fi
done

if [ "$REBUILD" == true ]; then
    echo "Rebuild flag detected. Stopping and removing existing containers."
    docker compose -f ./docker-compose.yml -p nextjs-dashboard-infrastructure down
fi

echo "Starting NextJS Dashboard Local Developer Infrastructure Infrastructure"
docker compose -f ./docker-compose.yml -p nextjs-dashboard-infrastructure up -d