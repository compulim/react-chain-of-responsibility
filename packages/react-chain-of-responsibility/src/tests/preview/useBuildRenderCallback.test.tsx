/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, type ReactNode } from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: never; value: number };

type MyComponentProps = Props & { readonly text: string };

function MyComponent({ text, value }: MyComponentProps) {
  return (
    <Fragment>
      {text} ({value})
    </Fragment>
  );
}

type PassthroughProps = Props & { readonly renderNext: () => ReactNode };

function Passthrough({ renderNext }: PassthroughProps) {
  return <Fragment>{renderNext()}</Fragment>;
}

scenario('useBuildRenderCallback', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, types: _types, useBuildRenderCallback } = createChainOfResponsibility<string, Props>();

      const middleware: readonly (typeof _types.middleware)[] = [
        () => next => request => {
          if (request) {
            return [MyComponent as typeof _types.component, () => ({ text: request })];
          }

          const renderNext = next(request);

          return [Passthrough as typeof _types.component, () => ({ renderNext })];
        }
      ];

      function MyProxy() {
        const render = useBuildRenderCallback();

        return render('Hello, World!')({ value: 1 });
      }

      return function TestComponent() {
        return (
          <Provider middleware={middleware}>
            <MyProxy />
          </Provider>
        );
      };
    })
    .when('the component is rendered', TestComponent => render(<TestComponent />))
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', 'Hello, World! (1)')
    );
});
