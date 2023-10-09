/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { Fragment } from 'react';
import { render } from '@testing-library/react';
import { wrapWith } from 'react-wrap-with';

import createChainOfResponsibility from './createChainOfResponsibility';

type Props = { children?: never };

const HelloWorld = () => <Fragment>Hello, World!</Fragment>;

test('when calling a COR pattern with Request type of undefined and props without children', () => {
  // GIVEN: A middleware which return <Fragment>Hello, World!</Fragment>.
  const { Provider, Proxy } = createChainOfResponsibility<undefined, Props>();
  const App = wrapWith(Provider, {
    middleware: [() => next => request => next(request), () => () => () => HelloWorld]
  })(Proxy);

  // WHEN: Render.
  const result = render(<App />);

  // THEN: It should render "Hello, World!".
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');
});
