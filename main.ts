import { emptyDir } from '@std/fs/empty-dir';
import { copy } from '@std/fs/copy';
import * as esbuild from "esbuild";
import { denoPlugins } from "esbuild-deno-loader";

const outdir = '../sholvoir.github.io/memword';
let release = false;

const tail = new Deno.Command('tailwindcss', {
   args: ['-i', './styles.css', '-o', `${outdir}/styles.css`], stdout: 'inherit', stderr: 'inherit' });
const serve = new Deno.Command(Deno.execPath(), {
   args: ['-A', 'jsr:@std/http/file-server', `${outdir}/`], stdout: 'inherit', stderr: 'inherit' });

const esb = async () => {
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
   esbuild.stop();
};

if (import.meta.main) {
   switch (Deno.args[0]) {
      case 'build': {
         release = false;
         //await copy('static', outdir, { overwrite: true });
         await esb();
         await tail.output();
         break;
      }
      case 'release': {
         release = true;
         await emptyDir(outdir)
         await copy('static', outdir, { overwrite: true });
         await esb();
         await tail.output();
         break;
      }
      case 'start': {
         await serve.output();
      }
   }
   
}