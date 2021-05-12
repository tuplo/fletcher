#!/usr/bin/env bash

rimraf dist
tsc --build tsconfig.build.json
esbuild src/index.ts --bundle --format=esm --outfile=dist/index.js \
  --external:url --external:vm --external:node-fetch --external:cheerio
cp src/fletch.d.ts dist/fletch.d.ts
