/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: never };

scenario('hoisting request to props', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, Proxy, types: _types } = createChainOfResponsibility<void, Props>();

      const fail = jest.fn(() => {
        throw new Error('must not be called');
      });

      const middleware: readonly (typeof _types.middleware)[] = [() => () => () => undefined, () => () => fail];

      return [
        function TestComponent() {
          return (
            <Provider middleware={middleware}>
              <Proxy request={undefined} />
            </Provider>
          );
        },
        fail
      ] as const;
    })
    .when('the component is rendered', ([TestComponent]) => render(<TestComponent />))
    .then('textContent should match', (_, { container }) => expect(container).toHaveProperty('textContent', ''))
    .and('the last middleware should be skipped', ([_TestComponent, fail]) => expect(fail).toHaveBeenCalledTimes(0));
});
