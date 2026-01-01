import { type Options } from 'tsup';

export default function override(options: Options): Options {
  return {
    ...options,
    entry: {
      'react-chain-of-responsibility': './src/index.ts',
      'react-chain-of-responsibility.preview': './src/index.preview.ts'
    }
  };
}
