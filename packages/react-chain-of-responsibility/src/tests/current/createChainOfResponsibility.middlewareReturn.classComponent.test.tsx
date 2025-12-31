import { render } from '@testing-library/react';
import { expect } from 'expect';
import { test } from 'node:test';
import React from 'react';
import { withProps, wrapWith } from 'react-wrap-with';
import createChainOfResponsibility from '../../createChainOfResponsibility.tsx';

const { Component, Fragment } = React;

type Props = { children?: never };

class HelloWorld extends Component<Props> {
  override render() {
    return <Fragment>Hello, World!</Fragment>;
  }
}

test('middleware return a class component should render', () => {
  // GIVEN: A middleware returning a class component.
  const { Provider, Proxy } = createChainOfResponsibility<void, Props>();

  const App = wrapWith(withProps(Provider, { middleware: [() => () => () => HelloWorld] }))(Proxy);

  // WHEN: Render.
  const result = render(<App request={undefined} />);

  // THEN: It should render "Hello, World!".
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');
});
