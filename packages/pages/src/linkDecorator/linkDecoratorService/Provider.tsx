import React from 'react';

import { Provider as RawProvider, types } from './private/chainOfResponsibility';
import ExternalLink from './private/ExternalLink';
import InternalLink from './private/InternalLink';
import isInternalLink from './private/util/isInternalLink';
import PlainText from './private/PlainText';

import type { PropsWithChildren } from 'react';

const middleware: (typeof types.middleware)[] = [
  // If it does not have "href", treat it as plain text.
  () => next => href => !href ? PlainText : next(href),

  // If it is an internal link, whitelisted domain, or empty string, then treat it as internal link.
  internalHosts => next => href => !href || isInternalLink(href, internalHosts) ? InternalLink : next(href),

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
