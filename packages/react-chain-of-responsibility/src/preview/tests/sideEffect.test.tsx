/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment } from 'react';

import createChainOfResponsibility, { type InferMiddleware } from '../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: never };
type Request = void;

scenario('side effect in bindProps', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, Proxy, reactComponent, useBuildRenderCallback } = createChainOfResponsibility<Request, Props>();

      let count = 0;
      const renderCall = jest.fn();

      const MyComponent = function MyComponent({ value }: Props & { readonly value: number }) {
        renderCall();

        return <Fragment>Hello, World! ({value})</Fragment>;
      };

      const middleware: readonly InferMiddleware<typeof Provider>[] = [
        // `bindProps` has side effect.
        () => () => () => reactComponent(MyComponent, { value: ++count })
      ];

      return {
        middleware,
        MyComponent,
        Provider,
        Proxy,
        renderCall,
        useBuildRenderCallback
      };
    })
    .and.oneOf([
      [
        'rendered using useBuildRenderCallback()',
        ({ middleware, Provider, renderCall, useBuildRenderCallback }) => {
          function MyProxy() {
            const result = useBuildRenderCallback()()?.({});

            return result ? <Fragment>{result}</Fragment> : null;
          }

          return {
            renderCall,
            TestComponent: function TestComponent() {
              return (
                <Provider middleware={middleware}>
                  <MyProxy />
                </Provider>
              );
            }
          };
        }
      ],
      [
        'rendered using <Proxy>',
        ({ middleware, Provider, Proxy, renderCall }) => {
          return {
            renderCall,
            TestComponent: function TestComponent() {
              return (
                <Provider middleware={middleware}>
                  <Proxy request={undefined} />
                </Provider>
              );
            }
          };
        }
      ]
    ])

    // ---

    .when('the component is rendered', ({ TestComponent }) => render(<TestComponent />))
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', 'Hello, World! (1)')
    )
    .and('should have rendered once', ({ renderCall }) => expect(renderCall).toHaveBeenCalledTimes(1))

    // ---

    .when('the component is rendered again', ({ TestComponent }, result) => {
      result.rerender(<TestComponent />);

      return result;
    })
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', 'Hello, World! (2)')
    )
    .and('should have rendered twice', ({ renderCall }) => expect(renderCall).toHaveBeenCalledTimes(2));
});
