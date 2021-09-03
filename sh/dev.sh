#!/usr/bin/env bash

rimraf dist
tsc --build tsconfig.build.json

esbuild src/index.ts \
  --bundle \
  --platform=node \
  --format=esm \
  --outfile=dist/index.mjs \
  --watch
