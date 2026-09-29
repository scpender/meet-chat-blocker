import { build } from 'esbuild';
import { cpSync, rmSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });
cpSync('public', 'dist', { recursive: true });

await build({
  entryPoints: { content: 'src/content.ts', popup: 'src/popup.ts' },
  outdir: 'dist',
  bundle: true,
  format: 'iife',
  target: 'chrome110',
  logLevel: 'info',
});
