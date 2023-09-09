import React from 'react';

import type { Props } from './types';

const PlainText = ({ children, className }: Props) => <span className={className}>{children}</span>;

export default PlainText;
