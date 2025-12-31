import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import { expect } from 'expect';
import NodeTest, { mock } from 'node:test';
import React from 'react';
import createChainOfResponsibility, { type InferMiddleware } from '../createChainOfResponsibilityAsRenderCallback.tsx';

type Props = { readonly children?: never };
type Request = void;

scenario(
  'removing a middleware by returning undefined',
  bdd => {
    bdd
      .given('a TestComponent using chain of responsiblity', () => {
        const { Provider, Proxy, reactComponent } = createChainOfResponsibility<Request, Props>();

        const failCall = mock.fn();

        function Fail() {
          failCall();

          return null;
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
      .and('the last middleware should be skipped', ([_TestComponent, fail]) => expect(fail.mock.callCount()).toBe(0));
  },
  NodeTest
);
