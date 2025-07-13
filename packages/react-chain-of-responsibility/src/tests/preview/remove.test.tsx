/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React from 'react';

import createChainOfResponsibility, { type InferMiddleware } from '../../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: never };

scenario('removing a middleware by returning undefined', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, Proxy, reactComponent } = createChainOfResponsibility<void, Props>();

      const failCall = jest.fn();

      function Fail() {
        failCall();

        return undefined;
      }

      const middleware: readonly InferMiddleware<typeof Provider>[] = [
        () => () => () => undefined,
        () => () => () => reactComponent(Fail)
      ];

      return [
        function TestComponent() {
          return (
            <Provider middleware={middleware}>
              <Proxy request={undefined} />
            </Provider>
          );
        },
        failCall
      ] as const;
    })
    .when('the component is rendered', ([TestComponent]) => render(<TestComponent />))
    .then('textContent should match', (_, { container }) => expect(container).toHaveProperty('textContent', ''))
    .and('the last middleware should be skipped', ([_TestComponent, fail]) => expect(fail).toHaveBeenCalledTimes(0));
});
