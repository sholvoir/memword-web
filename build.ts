import * as esbuild from "esbuild";
import { denoPlugins } from "esbuild-deno-loader";

const run = async () => {
  await esbuild.build({
    plugins: denoPlugins(),
    entryPoints: [
      { out: 'worker', in: "./lib/worker.ts" },
      { out: 'index', in: './src/main.tsx' }
    ],
    outdir: './dist',
    bundle: true,
    format: "esm",
    jsx: "automatic",
    jsxImportSource: "preact",
    sourcemap: true,
    //minify: true
  });
  esbuild.stop();
};

if (import.meta.main) run();
