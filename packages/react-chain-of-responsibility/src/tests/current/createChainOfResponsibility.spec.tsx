/** @jest-environment jsdom */
/// <reference types="@types/jest" />

// TODO: Remove this test when we end-to-end test our samples.

import type { RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';
import React, { type ComponentType, type PropsWithChildren } from 'react';
import { withProps, wrapWith } from 'react-wrap-with';

import createChainOfResponsibility from '../../createChainOfResponsibility';
import type { ComponentMiddleware } from '../../types';

type LinkProps = PropsWithChildren<{ className: string; href: string }>;

const InternalLink = ({ children, className, href }: LinkProps) => {
  return (
    <a className={className} href={href}>
      {children}
    </a>
  );
};

const ExternalLink = ({ children, className, href }: LinkProps) => {
  return (
    <a className={className} href={href} rel="noopener noreferrer" target="_blank">
      {children}
      <img src="open-in-new-window.svg" />
    </a>
  );
};

function isInternalLink(href: string, internalHosts: string[]) {
  if (!href.includes(':')) {
    return true;
  }

  try {
    const url = new URL(href);

    if (internalHosts.includes(url.host)) {
      return true;
    }
  } catch {}

  return false;
}

describe('with a link middleware', () => {
  const middleware: ComponentMiddleware<string, LinkProps, string[]>[] = [
    (internalHosts: string[]) => next => href => (isInternalLink(href, internalHosts) ? InternalLink : next(href)),
    () => () => () => ExternalLink
  ];

  const { Provider, Proxy, useBuildComponentCallback } = createChainOfResponsibility<string, LinkProps, string[]>();

  describe.each(['hook', 'proxy'])('when rendering with %s', type => {
    let RenderLink: ComponentType<LinkProps>;

    beforeAll(() => {
      if (type === 'proxy') {
        RenderLink = wrapWith(withProps(Provider, { init: ['internal.example.com'], middleware }))(
          (props: LinkProps) => <Proxy {...props} request={props.href} />
        );
      } else {
        RenderLink = wrapWith(withProps(Provider, { init: ['internal.example.com'], middleware }))(
          ({ children, className, href }: LinkProps) => {
            const LinkComponent = useBuildComponentCallback()(href);

            if (LinkComponent) {
              return (
                <LinkComponent className={className} href={href}>
                  {children}
                </LinkComponent>
              );
            }

            return null;
          }
        );
      }
    });

    describe('render /sitemap.html', () => {
      let link: HTMLElement | null;
      let result: RenderResult;

      beforeAll(() => {
        result = render(
          <RenderLink className="link" href="/sitemap.html">
            Site map
          </RenderLink>
        );
        link = result.queryByText('Site map');
      });

      test('should render', () => {
        expect(link).toBeTruthy();
      });

      test('should have "className" attribute', () => {
        expect(link).toHaveProperty('className', 'link');
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
        result = render(
          <RenderLink className="link" href="https://example.com/">
            Example.com
          </RenderLink>
        );
        link = result.queryByText('Example.com');
      });

      test('should render', () => {
        expect(link).toBeTruthy();
      });

      test('should have "className" attribute', () => {
        expect(link).toHaveProperty('className', 'link');
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

    describe('render https://internal.example.com/sitemap.html', () => {
      let link: HTMLElement | null;
      let result: RenderResult;

      beforeAll(() => {
        result = render(
          <RenderLink className="link" href="https://internal.example.com/sitemap.html">
            Site map
          </RenderLink>
        );
        link = result.queryByText('Site map');
      });

      test('should render as internal link', () => {
        expect(link).toBeTruthy();
        expect(link).toHaveProperty('className', 'link');
        expect(link?.getAttribute('href')).toBe('https://internal.example.com/sitemap.html');
        expect(link?.getAttribute('rel')).toBeNull();
        expect(link?.getAttribute('target')).toBeNull();
      });
    });
  });
});
