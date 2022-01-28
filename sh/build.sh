#!/usr/bin/env bash

rimraf dist

tsc --project tsconfig.build.json

cp src/fletcher.d.ts dist/fletcher.d.ts
