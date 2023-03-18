/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import { wrapWith } from 'react-wrap-with';
import React, { Fragment } from 'react';

import createComponentChainOfResponsibility from './createComponentChainOfResponsibility';

type Props = { children?: never };

test('middleware return a component with content of init should render', () => {
  // GIVEN: A middleware return component with content of init object.
  const { Provider, Proxy } = createComponentChainOfResponsibility<undefined, Props, string>();

  // WHEN: Render <Provider> with the init of "Hello, World!".
  const App = wrapWith(Provider, {
    init: 'Hello, World!',
    middleware: [init => () => () => () => <Fragment>{init}</Fragment>]
  })(Proxy);

  const result = render(<App />);

  // THEN: It should render "Hello, World!".
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');
});
