import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import { expect } from 'expect';
import NodeTest from 'node:test';
import React from 'react';
import createChainOfResponsibility, { type InferMiddleware } from '../createChainOfResponsibilityAsRenderCallback.tsx';

const { Fragment } = React;

type Props = { readonly children?: never; value: number };
type Request = void;

scenario(
  'useBuildRenderCallback with a middleware returning "undefined"',
  bdd => {
    bdd
      .given('a TestComponent using chain of responsiblity', () => {
        const { Provider, useBuildRenderCallback } = createChainOfResponsibility<Request, Props>();

        const middleware: readonly InferMiddleware<typeof Provider>[] = [() => () => () => undefined];

        function MyProxy() {
          const render = useBuildRenderCallback();

          expect(render()).toBe(undefined);

          return <Fragment>Empty</Fragment>;
        }

        return {
          TestComponent: function TestComponent() {
            return (
              <Provider middleware={middleware}>
                <MyProxy />
              </Provider>
            );
          }
        };
      })
      .when('the component is rendered', ({ TestComponent }) => render(<TestComponent />))
      .then('textContent should match', (_, { container }) => expect(container).toHaveProperty('textContent', 'Empty'));
  },
  NodeTest
);
