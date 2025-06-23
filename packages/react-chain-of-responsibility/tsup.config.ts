import { defineConfig } from 'tsup';

export default defineConfig([
  {
    dts: true,
    entry: {
      'react-chain-of-responsibility': './src/index.ts',
      'react-chain-of-responsibility.fluentUI': './src/index.fluentUI.ts'
    },
    format: ['cjs', 'esm'],
    sourcemap: true,
    target: 'esnext'
  }
]);
