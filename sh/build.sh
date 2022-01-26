#!/usr/bin/env bash

rimraf dist

tsc -p tsconfig.build.json

cp src/fletcher.d.ts dist/fletcher.d.ts
