/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment } from 'react';

import createChainOfResponsibility from './createChainOfResponsibility';

type Props = { children?: never; text: string };

scenario('use asMiddleware', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { asMiddleware, Provider, Proxy, types: _types } = createChainOfResponsibility<string, Props, number>();

      const TestComponent = ({ middleware, text }: typeof _types.middlewareComponentProps) => (
        <Fragment>
          init = {middleware.init}, request = {middleware.request}, text = {text}, next = <middleware.Next />
        </Fragment>
      );

      return ({ init, request, text }: { init: number; request: string; text: string }) => (
        <Provider
          init={init}
          middleware={[
            asMiddleware(TestComponent),
            () =>
              () =>
              () =>
              ({ text }) => <Fragment>{text.toUpperCase()}</Fragment>
          ]}
        >
          <Proxy request={request} text={text} />
        </Provider>
      );
    })
    .when('the component is rendered', TestComponent =>
      render(<TestComponent init={1} request="Aloha!" text="Hello, World!" />)
    )
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty(
        'textContent',
        'init = 1, request = Aloha!, text = Hello, World!, next = HELLO, WORLD!'
      )
    )
    .when('the component is re-rendered', TestComponent =>
      render(<TestComponent init={2} request="Goodnight." text="Good morning!" />)
    )
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty(
        'textContent',
        'init = 2, request = Goodnight., text = Good morning!, next = GOOD MORNING!'
      )
    );
});
