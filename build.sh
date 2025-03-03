#!/bin/sh
set -euo pipefail

outdir="../sholvoir.github.io/memword"
bun run build
rm $outdir/index-*.js
mv $outdir/index-*.css $outdir/styles.css
cp public/index.txt $outdir/index.html
bun run build.ts esb
rm $outdir/index.cs*
cp -r public/icon $outdir/
cp public/manifest.json $outdir/