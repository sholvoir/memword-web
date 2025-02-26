/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { emptyDir } from '@std/fs/empty-dir';
import { copy } from '@std/fs/copy';
import * as esbuild from "esbuild/mod.js";
import { denoPlugins } from "esbuild-deno-loader";

const outdir = '../sholvoir.github.io/memword';

const tail = new Deno.Command('tailwindcss', {
   args: ['-i', './styles.css', '-o', `${outdir}/styles.css`], stdout: 'inherit', stderr: 'inherit'
});
const uno = new Deno.Command(Deno.execPath(), {
   args: ['-A', 'npm:@unocss/cli', './style.css', `${outdir}/index.js`, '-o', `${outdir}/styles.css`], stdout: 'inherit', stderr: 'inherit'
})
const serve = new Deno.Command(Deno.execPath(), {
   args: ['-A', 'jsr:@std/http/file-server', `${outdir}/`], stdout: 'inherit', stderr: 'inherit'
});

const esb = async (release = false) => {
   await esbuild.build({
      plugins: denoPlugins(),
      entryPoints: [
         { out: 'worker', in: "./lib/worker.ts" },
         { out: 'index', in: './src/main.tsx' }
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
   for (const arg of Deno.args) switch (arg) {
      case 'start': await serve.output(); break;
      case 'static': await copy('static', outdir, { overwrite: true }); break;
      case 'esb': await esb(); break;
      case 'uno': await uno.output(); break;
      case 'tail': await tail.output(); break;
      case 'release': {
         await emptyDir(outdir)
         await copy('static', outdir, { overwrite: true });
         await esb(true);
         await tail.output();
         break;
      }
      default: console.log('Not a Command!!!');
   }
   
}