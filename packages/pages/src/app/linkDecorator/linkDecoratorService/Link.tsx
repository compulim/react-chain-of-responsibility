import React from 'react';

import { Proxy } from './private/chainOfResponsibility';

import type { Props } from './private/types';

const Link = (props: Props) => {
  const { children, ...passingProps } = props;

  return (
    <Proxy {...passingProps} request={passingProps.href}>
      {children}
    </Proxy>
  );
};

export default Link;
