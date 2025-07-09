/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, memo } from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: never };

scenario('useRequest', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const {
        Provider,
        Proxy,
        reactComponent,
        types: _types,
        useRequest
      } = createChainOfResponsibility<string, Props>();

      const MyComponent = memo(function MyComponent() {
        const [request] = useRequest();

        return <Fragment>{request}</Fragment>;
      });

      const middleware: readonly (typeof _types.middleware)[] = [
        // With a fixed props, the <MyComponent> should be stable.
        () => () => () => reactComponent(MyComponent)
      ];

      return function TestComponent({ request }: { readonly request: string }) {
        return (
          <Provider middleware={middleware}>
            <Proxy request={request} />
          </Provider>
        );
      };
    })
    .when('the component is rendered', TestComponent => render(<TestComponent request="Hello, World!" />))
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', 'Hello, World!')
    )
    .when('the component is re-rendered with a different request', (TestComponent, result) => {
      result.rerender(<TestComponent request="Aloha!" />);

      return result;
    })
    .then('textContent should match', (_, { container }) => expect(container).toHaveProperty('textContent', 'Aloha!'));
});
