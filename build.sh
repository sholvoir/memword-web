#!/bin/sh
set -euo pipefail

outDir=$(deno outdir.ts)
bun run build
sed -i '/<\/head>/i \
  <link rel="icon" type="image/svg+xml" href="icon/icon.svg" />\
  <link rel="manifest" href="manifest.json" />\
  <link rel="apple-touch-startup-image" href="icon/icon-1024.png" />'\
  $outDir/index.html
#bun build.ts release