/** @jest-environment jsdom */

import { render } from '@testing-library/react';
import { wrapWith } from 'react-wrap-with';
import React from 'react';

import createComponentStrategy from './createComponentStrategy';

import type { ComponentMiddleware } from './types';
import type { PropsWithChildren } from 'react';
import type { RenderResult } from '@testing-library/react';

type LinkProps = PropsWithChildren<{ href: string }>;

const InternalLink = ({ children, href }: LinkProps) => {
  return <a href={href}>{children}</a>;
};

const ExternalLink = ({ children, href }: LinkProps) => {
  return (
    <a href={href} rel="noopener noreferrer" target="_blank">
      {children}
      <img src="open-in-new-window.svg" />
    </a>
  );
};

describe('with a link middleware', () => {
  const middleware: ComponentMiddleware<LinkProps>[] = [
    () => next => props => !props.href.includes(':') ? InternalLink : next(props),
    () => () => () => ExternalLink
  ];

  const { Provider, useComponent } = createComponentStrategy<LinkProps>();

  const RenderLink = wrapWith(Provider, { middleware })(({ children, href }: LinkProps) => {
    const LinkComponent = useComponent()({ href });

    if (LinkComponent) {
      return <LinkComponent href={href}>{children}</LinkComponent>;
    }

    return null;
  });

  describe('render /sitemap.html', () => {
    let link: HTMLElement | null;
    let result: RenderResult;

    beforeAll(() => {
      result = render(<RenderLink href="/sitemap.html">Site map</RenderLink>);
      link = result.queryByText('Site map');
    });

    test('should render', () => {
      expect(link).toBeTruthy();
    });

    test('should link to /sitemap.html', () => {
      expect(link?.getAttribute('href')).toBe('/sitemap.html');
    });

    test('should allow opener/referrer', () => {
      expect(link?.getAttribute('rel')).toBeNull();
    });

    test('should not open in new window', () => {
      expect(link?.getAttribute('target')).toBeNull();
    });
  });

  describe('render https://example.com/', () => {
    let link: HTMLElement | null;
    let result: RenderResult;

    beforeAll(() => {
      result = render(<RenderLink href="https://example.com/">Example.com</RenderLink>);
      link = result.queryByText('Example.com');
    });

    test('should render', () => {
      expect(link).toBeTruthy();
    });

    test('should link to https://example.com/', () => {
      expect(link?.getAttribute('href')).toBe('https://example.com/');
    });

    test('should not allow opener/referrer', () => {
      expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
    });

    test('should open in new window', () => {
      expect(link?.getAttribute('target')).toBe('_blank');
    });
  });
});
