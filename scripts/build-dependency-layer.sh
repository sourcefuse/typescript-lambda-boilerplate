#!/usr/bin/env bash
# This script packages node_modules into a Lambda layer. This is required to avoid the 50MB package size limit.
# Refer to https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html for more information.
set -x
set -e

OUTPUT_DIR="$(pwd)/dist"
LAYER_DIR="$OUTPUT_DIR/layers/nodejs"

mkdir -p "$LAYER_DIR"
cp -LR node_modules "$LAYER_DIR"
cd "$OUTPUT_DIR/layers"

zip -r layers.zip ./*
