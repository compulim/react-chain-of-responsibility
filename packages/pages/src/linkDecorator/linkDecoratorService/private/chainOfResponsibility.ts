import { createChainOfResponsibility } from 'react-chain-of-responsibility';

import type { Init, Props } from './types';

const { Provider, Proxy, types } = createChainOfResponsibility<string | undefined, Props, Init>();

export { Proxy, Provider, types };
