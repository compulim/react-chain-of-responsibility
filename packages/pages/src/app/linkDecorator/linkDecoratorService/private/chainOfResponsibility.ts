import { createChainOfResponsibility } from 'react-chain-of-responsibility';

import { type Init, type Props } from './types.ts';

const { Provider, Proxy, types } = createChainOfResponsibility<string | undefined, Props, Init>();

export { Provider, Proxy, types };
