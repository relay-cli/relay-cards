import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.tsx'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  target: 'node20',
  external: ['ink', 'react'],
});
