#!/usr/bin/env bash

rimraf dist

microbundle \
  --format cjs \
  --output dist/index.js  \
  --no-pkg-main \
  --target node \
  --sourcemap false \
  --watch
