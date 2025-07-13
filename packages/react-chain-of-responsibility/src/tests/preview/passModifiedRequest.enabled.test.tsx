/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, type ReactNode } from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: never };
type Request = string;

type DownstreamProps = Props & { readonly value: string };

function Downstream({ value }: DownstreamProps) {
  return <Fragment>({value})</Fragment>;
}

type UpstreamProps = Props & {
  readonly renderNext?: (() => ReactNode) | undefined;
};

function Upstream({ renderNext }: UpstreamProps) {
  return renderNext?.();
}

scenario('passModifiedRequest is disabled or undefined', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const {
        Provider,
        Proxy,
        reactComponent,
        types: _types
      } = createChainOfResponsibility<Request, Props>({ passModifiedRequest: true });

      const middleware: readonly (typeof _types.middleware)[] = [
        () => next => request => reactComponent(Upstream, { renderNext: next(request.toUpperCase())?.render }),
        () => () => request => reactComponent(Downstream, { value: request })
      ];

      return {
        TestComponent: function TestComponent() {
          return (
            <Provider middleware={middleware}>
              <Proxy request="Hello, World!" />
            </Provider>
          );
        }
      };
    })
    .and(
      'a console.warn spy',
      ({ TestComponent }) => ({ TestComponent, warn: jest.spyOn(console, 'warn').mockImplementation(() => {}) }),
      ({ warn }) => warn.mockRestore()
    )
    .when('the component is rendered', ({ TestComponent }) => render(<TestComponent />))
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', '(HELLO, WORLD!)')
    )
    .and('console.warn should not have been called', ({ warn }) => expect(warn).toHaveBeenCalledTimes(0));
});
