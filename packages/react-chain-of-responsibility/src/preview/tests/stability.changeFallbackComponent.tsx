import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import { expect } from 'expect';
import NodeTest, { mock } from 'node:test';
import React, { type ComponentType } from 'react';
import createChainOfResponsibility, { type InferMiddleware } from '../createChainOfResponsibilityAsRenderCallback.tsx';

const { Fragment } = React;

type Props = { readonly children?: never };
type Request = number;

scenario(
  'stability test with changing fallbackComponent',
  bdd => {
    bdd
      .given('a TestComponent using chain of responsiblity', () => {
        const { Provider, useBuildRenderCallback } = createChainOfResponsibility<Request, Props>();

        const alohaCall = mock.fn();

        const Aloha = function MyComponent() {
          alohaCall();

          return <Fragment>Aloha!</Fragment>;
        };

        const helloWorldCall = mock.fn();

        const HelloWorld = function MyComponent() {
          helloWorldCall();

          return <Fragment>Hello, World!</Fragment>;
        };

        const middleware: readonly InferMiddleware<typeof Provider>[] = [];

        function MyProxy({ fallbackComponent }: { readonly fallbackComponent: ComponentType<Props> }) {
          // We are using `useBuildRenderCallback` for less memoization.
          const result = useBuildRenderCallback()(1, { fallbackComponent })?.({});

          return result ? <Fragment>{result}</Fragment> : null;
        }

        return {
          Aloha,
          alohaCall,
          HelloWorld,
          helloWorldCall,
          TestComponent: function TestComponent({
            fallbackComponent
          }: {
            readonly fallbackComponent: ComponentType<Props>;
          }) {
            return (
              <Provider middleware={middleware}>
                <MyProxy fallbackComponent={fallbackComponent} />
              </Provider>
            );
          }
        };
      })

      // ---

      .when('the component is rendered with fallback component of <HelloWorld>', ({ HelloWorld, TestComponent }) =>
        render(<TestComponent fallbackComponent={HelloWorld} />)
      )
      .then('textContent should match', (_, { container }) =>
        expect(container).toHaveProperty('textContent', 'Hello, World!')
      )
      .and('<HelloWorld> should have been rendered once', ({ helloWorldCall }) =>
        expect(helloWorldCall).toHaveBeenCalledTimes(1)
      )

      // ---

      .when('the component is rendered again with same fallback component', ({ HelloWorld, TestComponent }) =>
        render(<TestComponent fallbackComponent={HelloWorld} />)
      )
      .then('textContent should match', (_, { container }) =>
        expect(container).toHaveProperty('textContent', 'Hello, World!')
      )
      .and('<HelloWorld> should not have been rendered again', ({ helloWorldCall }) =>
        expect(helloWorldCall).toHaveBeenCalledTimes(1)
      )

      // ---

      .when('the component is rendered with fallback component of <Aloha>', ({ Aloha, TestComponent }) =>
        render(<TestComponent fallbackComponent={Aloha} />)
      )
      .then('textContent should match', (_, { container }) => expect(container).toHaveProperty('textContent', 'Aloha!'))
      .and('<Aloha> should have been rendered once', ({ alohaCall }) => expect(alohaCall).toHaveBeenCalledTimes(1));
  },
  NodeTest
);
