import { render } from 'react-dom';
import { wrapWith } from 'react-wrap-with';
import React, { Fragment, memo } from 'react';

import { createComponentStrategy } from '../src/index';

import type { ComponentMiddleware } from '../src/index';
import type { ComponentType, FunctionComponent, PropsWithChildren, ReactElement } from 'react';

type LinkProps = PropsWithChildren<{ href: string }>;

const { Provider: LinkComponentProvider, Proxy: Link } = createComponentStrategy<LinkProps>();

function isExternalLink(href: string): boolean {
  try {
    new URL(href);

    return true;
  } catch {}

  return false;
}

// Middleware for internal links.

const InternalLink = memo(({ children, href }: LinkProps) => <a href={href}>{children}</a>);

const internalLinkMiddleware: ComponentMiddleware<LinkProps> = () => next => props => {
  const { href } = props;

  return wrapWith(!isExternalLink(href) && InternalLink, { href })(next(props));
};

// Middleware for external links.

const ExternalLink = memo(({ children, href }: LinkProps) => (
  <a href={href} rel="noopener noreferrer" target="_blank">
    {children}
  </a>
));

const withExternalLink = wrapWith(ExternalLink, {}, ['href']);

const externalLinkMiddleware: ComponentMiddleware<LinkProps> = () => next => props => {
  const { href } = props;
  const NextComponent: ComponentType<LinkProps> = next(props) || (() => <Fragment />);

  if (isExternalLink(href)) {
    return props => (
      <ExternalLink {...props}>
        <NextComponent {...props} />
      </ExternalLink>
    );
  }

  return <NextComponent {...props} />;
};

// Middleware for decorating external links with "Open in new window" icon and alt text.

const AccessibleOpenInNewWindow = ({ children }: LinkProps) => {
  return (
    <Fragment>
      <span className="sr-only">Open in new window.</span>
      {children}&nbsp;
      <span className="ms-Icon ms-Icon--OpenInNewTab" />
    </Fragment>
  );
};

const accessibleOpenInNewWindowDecorator: ComponentMiddleware<LinkProps> = () => next => props => {
  const NextComponent = next(props);

  if (!NextComponent) {
    return NextComponent;
  }

  return props => React.createElement(NextComponent, props, isExternalLink(props.href) && AccessibleOpenInNewWindow);

  // return wrapWith(next(props), {}, ['href'])(isExternalLink(props.href) && AccessibleOpenInNewWindow);
};

const App = () => {
  const middleware: ComponentMiddleware<LinkProps>[] = [
    accessibleOpenInNewWindowDecorator,
    externalLinkMiddleware,
    internalLinkMiddleware,
    () =>
      () =>
      () =>
      ({ children }) =>
        <Fragment>{children}</Fragment>
  ];

  return (
    <LinkComponentProvider middleware={middleware}>
      <Link href="/sitemap.html">Site map</Link>
      <br />
      <Link href="https://example.com/">Example.com</Link>
    </LinkComponentProvider>
  );
};

render(<App />, document.getElementById('root'));

export default App;
