import React from 'react';

import { Proxy } from './private/chainOfResponsibility';

import type { Props } from './private/types';

const Link = ({ children, className, href }: Props) => (
  // TODO: Fix this typing.
  // <Proxy className={className} href={href} request={href}>
  <Proxy request={href} {...{ ...(className ? { className } : {}), ...(href ? { href } : {}) }}>
    {children}
  </Proxy>
);

export default Link;
