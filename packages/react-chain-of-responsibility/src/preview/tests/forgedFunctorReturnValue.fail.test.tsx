import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import { expect } from 'expect';
import { spyOn } from 'jest-mock';
import NodeTest, { mock } from 'node:test';
import React from 'react';
import createChainOfResponsibility, { type InferMiddleware } from '../createChainOfResponsibilityAsRenderCallback.tsx';

type Props = { readonly children?: never };
type Request = void;

scenario(
  'call next() after the function call ended should throw',
  bdd => {
    bdd
      .given('a TestComponent using chain of responsiblity', () => {
        const { Provider, Proxy } = createChainOfResponsibility<Request, Props>();
        const render = mock.fn();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const middleware: readonly InferMiddleware<typeof Provider>[] = [() => () => () => ({ render }) as any];

        return {
          render,
          TestComponent: function TestComponent() {
            return (
              <Provider middleware={middleware}>
                <Proxy request={undefined} />
              </Provider>
            );
          }
        };
      })
      .and(
        'a console.error spy',
        ({ render, TestComponent }) => ({
          error: spyOn(console, 'error'),
          render,
          TestComponent
        }),
        ({ error }) => error.mockRestore()
      )
      .when(
        'the component is being rendered',
        ({ TestComponent }) =>
          () =>
            render(<TestComponent />)
      )
      .then('should throw', (_, fn) =>
        expect(fn).toThrow(
          expect.objectContaining({
            message: expect.stringContaining('middleware must return value constructed by reactComponent()')
          })
        )
      )
      .and('the forged render function should not be called', ({ render }) => expect(render.mock.callCount()).toBe(0));
  },
  NodeTest
);
