#!/usr/bin/env bash
# This script copies the migration script from sourceloop to migration folder.
set -x
set -e

ROOT_DIR="$(pwd)"
SRC_MIGRATIONS_DIR="$ROOT_DIR/node_modules/@sourceloop/authentication-service/migrations"
DEST_MIGRATIONS_DIR="$ROOT_DIR/migration/migrations"

rm -rf $DEST_MIGRATIONS_DIR
cp -LR "$SRC_MIGRATIONS_DIR" "$DEST_MIGRATIONS_DIR"
cd "$ROOT_DIR/migration"
npm i --omit=dev
