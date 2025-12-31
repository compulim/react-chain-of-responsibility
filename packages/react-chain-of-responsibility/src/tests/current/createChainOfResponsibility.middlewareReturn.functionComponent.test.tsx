import { render } from '@testing-library/react';
import { expect } from 'expect';
import { test } from 'node:test';
import React, { Fragment } from 'react';
import { withProps, wrapWith } from 'react-wrap-with';
import createChainOfResponsibility from '../../createChainOfResponsibility.tsx';

type Props = { children?: never };

const HelloWorld = () => <Fragment>Hello, World!</Fragment>;

test('middleware return a function component should render', () => {
  // GIVEN: A middleware returning a function component.
  const { Provider, Proxy } = createChainOfResponsibility<void, Props>();

  const App = wrapWith(withProps(Provider, { middleware: [() => () => () => HelloWorld] }))(Proxy);

  // WHEN: Render.
  const result = render(<App request={undefined} />);

  // THEN: It should render "Hello, World!".
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');
});
