#!/usr/bin/env bash

rimraf dist
tsc --build tsconfig.build.json

esbuild src/index.cjs --bundle --platform=node --outfile=dist/index.cjs
esbuild src/index.ts --bundle --platform=node --format=esm --outfile=dist/index.mjs

cp src/fletcher.d.ts dist/fletcher.d.ts
