import React from 'react';

import { Proxy } from './private/chainOfResponsibility.ts';
import { type Props } from './private/types.ts';

const Link = ({ children, ...passingProps }: Props) => (
  <Proxy {...passingProps} request={passingProps.href}>
    {children}
  </Proxy>
);

export default Link;
