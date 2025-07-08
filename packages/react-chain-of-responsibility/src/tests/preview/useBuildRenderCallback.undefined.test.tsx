/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment } from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: never; value: number };

scenario('useBuildRenderCallback without middleware', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, types: _types, useBuildRenderCallback } = createChainOfResponsibility<void, Props>();

      const middleware: readonly (typeof _types.middleware)[] = [];

      function MyProxy() {
        const render = useBuildRenderCallback();

        expect(render()).toBe(undefined);

        return <Fragment>Empty</Fragment>;
      }

      return function TestComponent() {
        return (
          <Provider middleware={middleware}>
            <MyProxy />
          </Provider>
        );
      };
    })
    .when('the component is rendered', TestComponent => render(<TestComponent />))
    .then('textContent should match', (_, { container }) => expect(container).toHaveProperty('textContent', 'Empty'));
});
