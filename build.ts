/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />

import * as esbuild from "esbuild";

const outdir = '../sholvoir.github.io/memword';

const esb = async (release = false) => {
   await esbuild.build({
      entryPoints: [
         { out: 'worker', in: "./lib/worker.ts" }
      ],
      outdir,
      bundle: true,
      format: "esm",
      jsx: "automatic",
      jsxImportSource: "preact",
      sourcemap: !release,
      minify: release
   });
   await esbuild.stop();
};

if (import.meta.main) {
   for (const arg of Bun.argv.slice(2)) {
      switch (arg) {
         //case 'static': await copy('static', outdir, { overwrite: true }); break;
         case 'esb': await esb(); break;
         case 'release': {
            //await copy('public/index.html', `${outdir}/index.html`, { overwrite: true });
            //await copy('public/manifest.json', `${outdir}/manifest.json`);
            //await copy('public/icon', `${outdir}/icon`);
            await esb(true);
            break;
         }
         default: console.log(`Not a Command!!!`);
      }
   }
}