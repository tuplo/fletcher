#!/usr/bin/env bash
set -euo pipefail

main() {
  rm -rf dist
  tsc \
    --project tsconfig.build.json \
    --watch
}

main
