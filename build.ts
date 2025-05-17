/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />

import * as esbuild from "esbuild";
import { outDir } from "./outdir.ts";

const esb = async (release = false) => {
   await esbuild.build({
      entryPoints: [
         { out: 'worker', in: "./lib/worker.ts" }
      ],
      outdir: outDir,
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
         case 'esb': await esb(); break;
         case 'release': await esb(true); break;
         default: console.log('Not a Command!!!');
      }
   }
}