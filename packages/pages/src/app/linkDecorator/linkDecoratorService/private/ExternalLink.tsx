import React from 'react';

import OpenInNewTabIcon from './OpenInNewTabIcon.tsx';
import { type Props } from './types.ts';

const ExternalLink = ({ children, className, href }: Props) => {
  return (
    <a className={className} href={href} rel="noopener noreferrer" target="_blank">
      {children} <OpenInNewTabIcon />
    </a>
  );
};

export default ExternalLink;
