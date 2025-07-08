/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, type ComponentType, type ReactNode } from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: never };

function Fallback() {
  return <Fragment>Fallback</Fragment>;
}

type PassthroughProps = Props & {
  readonly renderNext: () => ReactNode;
};

function Passthrough({ renderNext }: PassthroughProps) {
  return renderNext();
}

scenario('rendering fallback component', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, Proxy, types: _types } = createChainOfResponsibility<void, Props>();

      const middleware: readonly (typeof _types.middleware)[] = [
        () => next => request => {
          const renderNext = next(request);

          return [Passthrough as ComponentType<Props>, () => ({ renderNext })];
        }
      ];

      return function TestComponent() {
        return (
          <Provider middleware={middleware}>
            <Proxy fallbackComponent={Fallback} request={undefined} />
          </Provider>
        );
      };
    })
    .when('the component is rendered', TestComponent => render(<TestComponent />))
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', 'Fallback')
    );
});
