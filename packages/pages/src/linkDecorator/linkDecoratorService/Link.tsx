import React from 'react';

import { Proxy } from './private/chainOfResponsibility';

import type { Props } from './private/types';

const Link = ({ children, className, href }: Props) => (
  <Proxy className={className} href={href} request={href}>
    {children}
  </Proxy>
);

export default Link;
