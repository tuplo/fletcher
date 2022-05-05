#!/usr/bin/env bash
set -euo pipefail

main() {
  rm -rf dist
  tsc --project tsconfig.build.json
  cp src/fletcher.d.ts dist/fletcher.d.ts
}

main
