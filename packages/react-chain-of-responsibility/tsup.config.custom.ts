import { type Options } from 'tsup';

export default {
  entry: {
    'react-chain-of-responsibility': './src/index.ts',
    'react-chain-of-responsibility.preview': './src/index.preview.ts'
  }
} satisfies Options;
