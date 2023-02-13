import { wrapWith } from 'react-wrap-with';
import React from 'react';

import type { PropsWithChildren } from 'react';

const Header = ({ children }: PropsWithChildren<{ className: string }>) => <h1>{children}</h1>;

wrapWith(Header);
