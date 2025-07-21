import { defineConfig } from 'tsup';

export default defineConfig([
  {
    dts: true,
    entry: {
      ['react-chain-of-responsibility'.split('/').reverse()[0]]: './src/index.ts'
    },
    format: ['cjs', 'esm'],
    sourcemap: true,
    target: 'esnext'
  }
]);
