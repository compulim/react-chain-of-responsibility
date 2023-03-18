/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import { wrapWith } from 'react-wrap-with';
import React, { Component, Fragment } from 'react';

import createChainOfResponsibility from './createChainOfResponsibility';

type Props = { children?: never };

class HelloWorld extends Component<Props> {
  render() {
    return <Fragment>Hello, World!</Fragment>;
  }
}

test('middleware return a class component should render', () => {
  // GIVEN: A middleware returning a class component.
  const { Provider, Proxy } = createChainOfResponsibility<undefined, Props>();

  const App = wrapWith(Provider, { middleware: [() => () => () => HelloWorld] })(Proxy);

  // WHEN: Render.
  const result = render(<App />);

  // THEN: It should render "Hello, World!".
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');
});
