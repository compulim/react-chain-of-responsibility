/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment } from 'react';

import createChainOfResponsibility, { type InferMiddleware } from '../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: never };
type Request = number;

scenario('stability test with changing middleware', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, reactComponent, useBuildRenderCallback } = createChainOfResponsibility<Request, Props>();

      const alohaCall = jest.fn();

      const Aloha = function Aloha() {
        alohaCall();

        return <Fragment>Aloha!</Fragment>;
      };

      // Changing middleware always call `reactComponent(...)` again and would result in wasted rendering.
      // Until we do equality check on the return value of `reactComponent(...)` to see if they are different instances but same result.
      // Otherwise, we need to cache the `reactComponent(Aloha)` for testing purpose.
      // This way of testing it is preferred over `memo(Aloha)`.
      // In production, web devs should do `memo(Aloha)` instead.
      const renderAloha = reactComponent(Aloha);

      const helloWorldCall = jest.fn();

      const HelloWorld = function HelloWorld() {
        helloWorldCall();

        return <Fragment>Hello, World!</Fragment>;
      };

      const renderHelloWorld = reactComponent(HelloWorld);

      const myProxyCall = jest.fn();

      const MyProxy = function MyProxy({ request }: { readonly request: number }) {
        myProxyCall();

        // We are using `useBuildRenderCallback` for less memoization.
        const result = useBuildRenderCallback()(request)?.({});

        return result ? <Fragment>{result}</Fragment> : null;
      };

      return Object.freeze({
        Aloha,
        alohaCall,
        HelloWorld,
        helloWorldCall,
        myProxyCall,
        renderAloha,
        renderHelloWorld,
        TestComponent: function TestComponent({
          middleware
        }: {
          readonly middleware: readonly InferMiddleware<typeof Provider>[];
        }) {
          return (
            <Provider middleware={middleware}>
              <MyProxy request={1} />
            </Provider>
          );
        }
      });
    })

    // ---

    .when('the component is rendered', ({ renderHelloWorld, TestComponent }) =>
      render(<TestComponent middleware={[() => () => () => renderHelloWorld]} />)
    )
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', 'Hello, World!')
    )
    .and('<HelloWorld> should have been rendered once', ({ helloWorldCall }) =>
      expect(helloWorldCall).toHaveBeenCalledTimes(1)
    )
    .and('<MyProxy> should have been rendered once', ({ myProxyCall }) => expect(myProxyCall).toHaveBeenCalledTimes(1))

    // ---

    .when(
      'the component is re-rendered with a different instance but same middleware',
      ({ renderHelloWorld, TestComponent }, result) => {
        // Still rendering <HelloWorld>, but in a different middleware.
        result.rerender(<TestComponent middleware={[() => () => () => renderHelloWorld]} />);

        return result;
      }
    )
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', 'Hello, World!')
    )
    .and('<HelloWorld> should not have been re-rendered', ({ helloWorldCall }) =>
      expect(helloWorldCall).toHaveBeenCalledTimes(1)
    )
    // Every time middleware change, it should invalidate `useBuildRenderCallback`.
    // In future, we may do more granular check to see if enhancer actually changed or not and reduce wasted rendering.
    .and('<MyProxy> should have been rendered once', ({ myProxyCall }) => expect(myProxyCall).toHaveBeenCalledTimes(2))

    // ---

    .when(
      'the component is re-rendered with a different instance but same middleware',
      ({ renderAloha, TestComponent }, result) => {
        result.rerender(<TestComponent middleware={[() => () => () => renderAloha]} />);

        return result;
      }
    )
    .then('textContent should match', (_, { container }) => expect(container).toHaveProperty('textContent', 'Aloha!'))
    .and('<Aloha> should have been rendered once', ({ alohaCall }) => expect(alohaCall).toHaveBeenCalledTimes(1))
    .and('<HelloWorld> should have been rendered once', ({ helloWorldCall }) =>
      expect(helloWorldCall).toHaveBeenCalledTimes(1)
    )
    .and('<MyProxy> should have been rendered 3 times', ({ myProxyCall }) =>
      expect(myProxyCall).toHaveBeenCalledTimes(3)
    );
});
