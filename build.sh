#!/bin/sh
set -euo pipefail

outdir="../sholvoir.github.io/memword"
bun run build
sed -i '/<\/head>/i \
  <link rel="icon" type="image/svg+xml" href="icon/icon.svg" />\
  <link rel="manifest" href="manifest.json" />\
  <link rel="apple-touch-startup-image" href="icon/icon-1024.png" />'\
  $outdir/index.html
cp -r public/icon $outdir/
cp public/manifest.json $outdir/
bun build.ts release