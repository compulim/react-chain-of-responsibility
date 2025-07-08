/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, type ReactNode } from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly value: string };

function Downstream({ value }: Props) {
  return <Fragment>({value})</Fragment>;
}

type UpstreamProps = Props & {
  readonly renderNext?: ((overridingProps: Props) => ReactNode) | undefined;
};

function Upstream({ renderNext, value }: UpstreamProps) {
  return renderNext?.({ value: value.toUpperCase() });
}

scenario('props can be overridden in renderNext()', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, Proxy, reactComponent, types: _types } = createChainOfResponsibility<void, Props>();

      const middleware: readonly (typeof _types.middleware)[] = [
        () => next => request => reactComponent(Upstream, { renderNext: next(request) }),
        () => () => () => reactComponent(Downstream)
      ];

      return function TestComponent({ value }: { value: string }) {
        return (
          <Provider middleware={middleware}>
            <Proxy request={undefined} value={value} />
          </Provider>
        );
      };
    })
    .when('the component is rendered', TestComponent => render(<TestComponent value="Hello, World!" />))
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', '(HELLO, WORLD!)')
    );
});
