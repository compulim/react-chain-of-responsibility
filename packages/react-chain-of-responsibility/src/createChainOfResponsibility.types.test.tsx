/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import React from 'react';
import { withProps, wrapWith } from 'react-wrap-with';

import createChainOfResponsibility from './createChainOfResponsibility';

test('constructing middleware using all typings from "types" should render', () => {
  // GIVEN: A chain of responsibility which specify init, props, and request.
  const { Provider, Proxy, types } = createChainOfResponsibility<string, { className: string }, string>();

  const middleware: (typeof types.middleware)[] = [
    (init: typeof types.init) => next => (request: typeof types.request) =>
      request === 'hello'
        ? ({ className }: typeof types.props) => <span className={className}>{init}</span>
        : next(request)
  ];

  const App = wrapWith(withProps(Provider, { init: 'Hello, World!', middleware }))(Proxy);

  // WHEN: Render.
  const result = render(<App className="app" request="hello" />);

  // THEN: It should have class name of "app".
  expect(result.container.firstChild).toHaveProperty('className', 'app');

  // THEN: It should render "hello world".
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');
});

test('constructing middleware with minimal typings should render', () => {
  // GIVEN: A chain of responsibility which specify init, props, and request.
  const { Provider, Proxy, types } = createChainOfResponsibility<void, Record<string, never>, void>();

  const middleware: (typeof types.middleware)[] = [
    (_init: typeof types.init) => _next => (_request: typeof types.request) => (_props: typeof types.props) => (
      <span>Hello, World</span>
    )
  ];

  const App = () => (
    // Allows <Provider> without "init" prop and <Proxy> without "request" prop.
    <Provider middleware={middleware}>
      <Proxy />
    </Provider>
  );

  // WHEN: Render.
  const result = render(<App />);

  // THEN: It should render "hello world".
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');
});
