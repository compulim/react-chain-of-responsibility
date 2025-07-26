/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, memo } from 'react';

import createChainOfResponsibility, { type InferMiddleware } from '../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: never };
type Request = number;

scenario('stability test with changing middleware', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, reactComponent, useBuildRenderCallback } = createChainOfResponsibility<Request, Props>();

      const alohaCall = jest.fn();

      // Middleware prop change always re-render.
      // Memoizing <Aloha> to focus on whether the component is rendering as waste.
      const Aloha = memo(function Aloha() {
        alohaCall();

        return <Fragment>Aloha!</Fragment>;
      });

      const helloWorldCall = jest.fn();

      // Middleware prop change always re-render.
      // Memoizing <HelloWorld> to focus on whether the component is rendering as waste.
      const HelloWorld = memo(function HelloWorld() {
        helloWorldCall();

        return <Fragment>Hello, World!</Fragment>;
      });

      const myProxyCall = jest.fn();

      const MyProxy = memo(function MyProxy({ request }: { readonly request: number }) {
        myProxyCall();

        // We are using `useBuildRenderCallback` for less memoization.
        const result = useBuildRenderCallback()(request)?.({});

        return result ? <Fragment>{result}</Fragment> : null;
      });

      return Object.freeze({
        Aloha,
        alohaCall,
        HelloWorld,
        helloWorldCall,
        myProxyCall,
        reactComponent,
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
    .when('the component is rendered', ({ HelloWorld, reactComponent, TestComponent }) =>
      render(<TestComponent middleware={[() => () => () => reactComponent(HelloWorld)]} />)
    )
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', 'Hello, World!')
    )
    .and('<HelloWorld> should have been rendered once', ({ helloWorldCall }) =>
      expect(helloWorldCall).toHaveBeenCalledTimes(1)
    )
    .and('<MyProxy> should have been rendered once', ({ myProxyCall }) => expect(myProxyCall).toHaveBeenCalledTimes(1))
    .when(
      'the component is re-rendered with a different instance but same middleware',
      ({ HelloWorld, reactComponent, TestComponent }, result) => {
        // Still rendering <HelloWorld>, but in a different middleware.
        result.rerender(<TestComponent middleware={[() => () => () => reactComponent(HelloWorld)]} />);

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
    .when(
      'the component is re-rendered with a different instance but same middleware',
      ({ Aloha, reactComponent, TestComponent }, result) => {
        result.rerender(<TestComponent middleware={[() => () => () => reactComponent(Aloha)]} />);

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
