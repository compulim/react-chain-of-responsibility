/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment } from 'react';

import createChainOfResponsibility, { type InferMiddleware } from '../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: never; value: number };
type Request = void;

scenario('useBuildRenderCallback with an empty chain', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, useBuildRenderCallback } = createChainOfResponsibility<Request, Props>();

      const middleware: readonly InferMiddleware<typeof Provider>[] = [];

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
    .and(
      'a console.warn spy',
      ({ TestComponent }) => ({
        TestComponent,
        warn: jest.spyOn(console, 'warn').mockImplementation(() => {})
      }),
      ({ warn }) => warn.mockRestore()
    )
    .when('the component is rendered', ({ TestComponent }) => render(<TestComponent />))
    .then('textContent should match', (_, { container }) => expect(container).toHaveProperty('textContent', 'Empty'));
});
