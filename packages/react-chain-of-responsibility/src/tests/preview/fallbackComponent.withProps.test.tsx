/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, type ReactNode } from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibilityAsRenderCallback';

type Props = {
  readonly children?: never;
  readonly value: number;
};

function Fallback({ value }: Props) {
  return <Fragment>Fallback ({value})</Fragment>;
}

type MyComponentProps = Props & {
  readonly renderNext?: (() => ReactNode) | undefined;
};

function MyComponent({ renderNext }: MyComponentProps) {
  return renderNext?.();
}

scenario('rendering fallback component with props', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, Proxy, reactComponent, types: _types } = createChainOfResponsibility<void, Props>();

      const middleware: readonly (typeof _types.middleware)[] = [
        () => next => request => reactComponent(MyComponent, { renderNext: next(request)?.render })
      ];

      return function TestComponent() {
        return (
          <Provider middleware={middleware}>
            <Proxy fallbackComponent={Fallback} request={undefined} value={1} />
          </Provider>
        );
      };
    })
    .when('the component is rendered', TestComponent => render(<TestComponent />))
    .then('textContent should match and props should be rendered', (_, { container }) =>
      expect(container).toHaveProperty('textContent', 'Fallback (1)')
    );
});
