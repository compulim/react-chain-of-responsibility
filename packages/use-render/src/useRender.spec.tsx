/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';
import React from 'react';

import useRender from './useRender';
import UseRenderProvider from './UseRenderProvider';

import type { Middleware } from './types';
import type { PropsWithChildren } from 'react';

describe('with a number middleware', () => {
  const middleware: Middleware<{ value: number }>[] = [
    () =>
      (next: any) =>
      ({ value }: { value: number }): any => {
        if (typeof value === 'number') {
          return <code>{value}</code>;
        }

        return next({ value });
      }
  ];

  const Wrapper = ({ children }: PropsWithChildren<{}>) => (
    <UseRenderProvider middleware={middleware}>{children}</UseRenderProvider>
  );

  test('should render number', () => {
    const Component = () => useRender()({ value: 123 });

    render(
      <Wrapper>
        <Component />
      </Wrapper>
    );

    expect(screen.getByText('123')).toBeTruthy();
  });

  test('should not rendering string', () => {
    const Component = () => useRender()({ value: 'abc' });

    render(
      <Wrapper>
        <Component />
      </Wrapper>
    );

    expect(screen.queryByText('abc')).toBeFalsy();
  });
});
