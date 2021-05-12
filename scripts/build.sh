#!/usr/bin/env bash

rimraf dist
tsc --build tsconfig.build.json
esbuild src/index.ts --bundle --outfile=dist/index.js --external:url --external:vm
cp src/fletch.d.ts dist/fletch.d.ts
