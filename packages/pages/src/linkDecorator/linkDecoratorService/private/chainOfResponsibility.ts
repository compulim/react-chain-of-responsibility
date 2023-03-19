import { createChainOfResponsibility } from 'use-render';

import type { Init, Props } from './types';

const { Provider, Proxy, types } = createChainOfResponsibility<string | undefined, Props, Init>();

export { Proxy, Provider, types };
