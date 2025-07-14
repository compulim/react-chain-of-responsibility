/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment } from 'react';

import createChainOfResponsibility, { type InferMiddleware } from '../../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: never };
type Request = void;

function Hello() {
  return <Fragment>Hello</Fragment>;
}

function World() {
  return <Fragment>World</Fragment>;
}

scenario('call enhancer() twice', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, Proxy, reactComponent } = createChainOfResponsibility<Request, Props>({
        passModifiedRequest: true
      });

      return {
        reactComponent,
        TestComponent: function TestComponent({
          middleware
        }: {
          middleware: readonly InferMiddleware<typeof Provider>[];
        }) {
          return (
            <Provider middleware={middleware}>
              <Proxy request={undefined} />
            </Provider>
          );
        }
      };
    })
    .when('the component is rendered', ({ reactComponent, TestComponent }) =>
      render(<TestComponent middleware={[() => () => () => reactComponent(Hello)]} />)
    )
    .then('textContent should match', (_, { container }) => expect(container).toHaveProperty('textContent', 'Hello'))
    .when('the component is re-rendered with a different middleware', ({ reactComponent, TestComponent }) =>
      render(<TestComponent middleware={[() => () => () => reactComponent(World)]} />)
    )
    .then('textContent should match', (_, { container }) => expect(container).toHaveProperty('textContent', 'World'));
});
