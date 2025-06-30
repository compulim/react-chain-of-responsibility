import React from 'react';
import createChainOfResponsibility from '../../src/createChainOfResponsibility.ts';
// const { createChainOfResponsibility } = require('../../dist/react-chain-of-responsibility.js');
// import { createChainOfResponsibility } from '../../dist/react-chain-of-responsibility.mjs';

const { Proxy } = createChainOfResponsibility<void>();

<Proxy request={undefined} />;
