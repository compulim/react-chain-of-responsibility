import { wrapWith } from 'react-wrap-with';
import React from 'react';

import type { PropsWithChildren } from 'react';

const Header = ({ children }: PropsWithChildren<Record<any, never>>) => <h1>{children}</h1>;

wrapWith(Header, { className: '123' });
