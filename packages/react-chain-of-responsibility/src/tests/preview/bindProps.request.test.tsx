/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment } from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: never };

type MyComponentProps = Props & { readonly value: number };

function MyComponent({ value }: MyComponentProps) {
  return <Fragment>Hello, World! ({value})</Fragment>;
}

scenario('hoisting request to props', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, Proxy, reactComponent, types: _types } = createChainOfResponsibility<number, Props>();

      const middleware: readonly (typeof _types.middleware)[] = [
        () => () => request =>
          reactComponent(MyComponent, {
            value: request // Request is hoisted as "value" prop.
          })
      ];

      return function TestComponent() {
        return (
          <Provider middleware={middleware}>
            <Proxy request={1} />
          </Provider>
        );
      };
    })
    .when('the component is rendered', TestComponent => render(<TestComponent />))
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', 'Hello, World! (1)')
    );
});
