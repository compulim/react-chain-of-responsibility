import { defineConfig, type Options } from 'tsup';

const BASE_CONFIG: Options = {
  dts: true,
  entry: {
    'react-chain-of-responsibility': './src/index.ts',
    'react-chain-of-responsibility.preview': './src/index.preview.ts'
  },
  sourcemap: true
};

export default defineConfig([
  {
    ...BASE_CONFIG,
    format: ['esm'],
    target: 'esnext'
  },
  {
    ...BASE_CONFIG,
    format: ['cjs'],
    target: 'es2019'
  }
]);
