import React from 'react';

import type { Props } from './types';

const InternalLink = ({ children, className, href }: Props) => {
  return (
    <a className={className} href={href}>
      {children}
    </a>
  );
};

export default InternalLink;
