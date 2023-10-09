import { Proxy } from './private/chainOfResponsibility';

import type { Props } from './private/types';

const Link = ({ children, ...passingProps }: Props) => (
  <Proxy {...passingProps} request={passingProps.href}>
    {children}
  </Proxy>
);

export default Link;
