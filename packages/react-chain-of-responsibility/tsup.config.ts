import { defineConfig } from 'tsup';

export default defineConfig([
  {
    dts: true,
    entry: {
      'react-chain-of-responsibility': './src/index.ts'
    },
    format: ['cjs', 'esm'],
    sourcemap: true
  }
]);
