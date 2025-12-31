import React from 'react';
import createChainOfResponsibility from '../../createChainOfResponsibility.tsx';

const { Proxy } = createChainOfResponsibility<undefined>();

// @ts-expect-error Property 'request' is missing in type '{}' but required in type '{ readonly fallbackComponent?: ComponentType<{ readonly children?: undefined; }> | undefined; readonly request: undefined; }'
<Proxy />;
