#!/bin/sh
set -euo pipefail

outDir=$(bun outdir.ts)
outDir2=../memword-server/static
bun run build
bun build.ts release
sed -i '/<\/head>/i \
  <link rel="icon" type="image/svg+xml" href="icon/icon.svg" />\
  <link rel="manifest" href="manifest.json" />\
  <link rel="apple-touch-startup-image" href="icon/icon-1024.png" />'\
  $outDir/index.html
rm -rf $outDir2
cp -r $outDir $outDir2