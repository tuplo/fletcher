#!/usr/bin/env bash

rimraf dist

tsc \
  --project tsconfig.build.json \
  --watch

