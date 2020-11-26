#!/usr/bin/env bash

rimraf dist
microbundle --target node --sourcemap false --format cjs,modern --tsconfig tsconfig.build.json
cp src/fletch.d.ts dist/fletch.d.ts
