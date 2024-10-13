import React, { type PropsWithChildren } from 'react';

import ExternalLink from './private/ExternalLink.tsx';
import InternalLink from './private/InternalLink.tsx';
import PlainText from './private/PlainText.tsx';
import { Provider as RawProvider, types } from './private/chainOfResponsibility.ts';
import isInternalLink from './private/util/isInternalLink.ts';

const middleware: (typeof types.middleware)[] = [
  // If it does not have "href", treat it as plain text.
  () => next => href => (!href ? PlainText : next(href)),

  // If it is an internal link, whitelisted domain, or empty string, then treat it as internal link.
  internalHosts => next => href => (!href || isInternalLink(href, internalHosts) ? InternalLink : next(href)),

  // Otherwise, treat it as external link:
  // - Add rel="noopener noreferrer"
  // - Open in new tab
  // - Add "open in new tab" icon and label
  () => () => () => ExternalLink
];

type Props = PropsWithChildren<{
  internalHosts: string[];
}>;

const Provider = ({ children, internalHosts }: Props) => (
  <RawProvider init={internalHosts} middleware={middleware}>
    {children}
  </RawProvider>
);

export default Provider;
