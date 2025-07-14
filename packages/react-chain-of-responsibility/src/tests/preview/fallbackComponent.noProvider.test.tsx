/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment } from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibilityAsRenderCallback';

type Props = {
  readonly children?: never;
  readonly value: number;
};

type Request = void;

function Fallback({ value }: Props) {
  return <Fragment>Fallback ({value})</Fragment>;
}

scenario('rendering fallback component without <Provider>', bdd => {
  bdd
    .given('a chain of responsiblity', () => createChainOfResponsibility<Request, Props>())
    .and.oneOf([
      [
        'a <TestComponent> rendered using <Proxy>',
        ({ Proxy }) =>
          function TestComponent() {
            return <Proxy fallbackComponent={Fallback} request={undefined} value={1} />;
          }
      ],
      [
        'a <TestComponent> rendered using useBuildRenderCallback',
        ({ Provider, Proxy }) => {
          function MyComponent() {
            return <Proxy fallbackComponent={Fallback} request={undefined} value={1} />;
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
