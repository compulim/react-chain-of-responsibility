import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import { expect } from 'expect';
import { spyOn } from 'jest-mock';
import NodeTest from 'node:test';
import React from 'react';
import createChainOfResponsibility from '../createChainOfResponsibilityAsRenderCallback.tsx';
const { Fragment } = React;

type Props = {
  readonly children?: never;
  readonly value: number;
};
type Request = void;

scenario(
  'rendering fallback component using useBuildRenderCallback() without <Provider>',
  bdd => {
    bdd
      .given('a chain of responsiblity', () => createChainOfResponsibility<Request, Props>())
      .and.oneOf([
        [
          'a <TestComponent> rendered using <Proxy>',
          ({ Provider, Proxy }) => ({
            TestComponent: function TestComponent() {
              return (
                <Provider middleware={[]}>
                  <Proxy request={undefined} value={1} />
                </Provider>
              );
            }
          })
        ],
        [
          'a <TestComponent> rendered using useBuildRenderCallback()',
          ({ Provider, useBuildRenderCallback }) => {
            function MyComponent() {
              const render = useBuildRenderCallback()(undefined);

              expect(render).toBeFalsy();

              const result = render?.({ value: 1 });

              return result ? <Fragment>{result}</Fragment> : null;
            }

            return {
              TestComponent: function TestComponent() {
                return (
                  <Provider middleware={[]}>
                    <MyComponent />
                  </Provider>
                );
              }
            };
          }
        ]
      ])
      .and(
        'a console.warn spy',
        ({ TestComponent }) => ({
          TestComponent,
          warn: spyOn(console, 'warn')
        }),
        ({ warn }) => warn.mockRestore()
      )
      .when('the component is rendered', ({ TestComponent }) => render(<TestComponent />))
      .then('textContent should match', (_, { container }) => expect(container).toHaveProperty('textContent', ''))
      .and('should print warning once', ({ warn }) => expect(warn).toHaveBeenCalledTimes(1))
      .and('should print warning message', ({ warn }) =>
        expect(warn).toHaveBeenLastCalledWith(
          expect.stringContaining('the request has fall through all middleware, set "fallbackComponent" as a catchall'),
          undefined
        )
      );
  },
  NodeTest
);
