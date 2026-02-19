import { defineConfig } from 'tsup';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: !isProd,
  clean: true,
  outDir: 'dist',
  target: 'node16',
  shims: false,
  treeshake: true,
});
