import { defineConfig, type Options } from 'tsup';
import customConfig from './tsup.config.custom.ts';

const baseConfig: Options = {
  dts: true,
  entry: {
    '$package-local-name': './src/index.ts'
  },
  format: ['cjs', 'esm'],
  sourcemap: true,
  target: 'esnext'
};

export default defineConfig([{ ...baseConfig, ...customConfig }]);
