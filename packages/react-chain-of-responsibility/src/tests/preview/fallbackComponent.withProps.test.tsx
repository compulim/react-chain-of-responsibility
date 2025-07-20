
import { test } from 'node:test';
import expect from 'expect';
import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment } from 'react';

import createChainOfResponsibility, { type InferMiddleware } from '../../createChainOfResponsibilityAsRenderCallback';

type Props = {
  readonly children?: never;
  readonly value: number;
};

type Request = void;

function Fallback({ value }: Props) {
  return <Fragment>Fallback ({value})</Fragment>;
}

scenario('rendering fallback component with props', bdd => {
  bdd
    .given('a chain of responsiblity', () => createChainOfResponsibility<Request, Props>())
    .and.oneOf([
      [
        'a <TestComponent> rendered using <Proxy>',
        ({ Provider, Proxy }) => {
          const middleware: readonly InferMiddleware<typeof Provider>[] = [() => next => request => next(request)];

          return function TestComponent() {
            return (
              <Provider middleware={middleware}>
                <Proxy fallbackComponent={Fallback} request={undefined} value={1} />
              </Provider>
            );
          };
        }
      ],
      [
        'a <TestComponent> rendered using useBuildRenderCallback()',
        ({ Provider, useBuildRenderCallback }) => {
          function MyComponent() {
            const render = useBuildRenderCallback()(undefined, { fallbackComponent: Fallback });

            expect(render).not.toBeFalsy();

            const result = render?.({ value: 1 });

            return result ? <Fragment>{result}</Fragment> : null;
          }

          return function TestComponent() {
            return (
              <Provider middleware={[]}>
                <MyComponent />
              </Provider>
            );
          };
        }
      ]
    ])
    .when('the component is rendered', TestComponent => render(<TestComponent />))
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', 'Fallback (1)')
    );
});
