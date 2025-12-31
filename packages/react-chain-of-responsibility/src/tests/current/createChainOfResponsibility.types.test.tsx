import { render } from '@testing-library/react';
import { expect } from 'expect';
import { test } from 'node:test';
import React from 'react';
import { withProps, wrapWith } from 'react-wrap-with';
import { type EmptyObject } from 'type-fest';
import createChainOfResponsibility from '../../createChainOfResponsibility.tsx';

test('constructing middleware using all typings from "types" should render', () => {
  // GIVEN: A chain of responsibility which specify init, props, and request.
  const { Provider, Proxy, types: _types } = createChainOfResponsibility<string, { className: string }, string>();

  const middleware: (typeof _types.middleware)[] = [
    (init: typeof _types.init) => next => (request: typeof _types.request) =>
      request === 'hello'
        ? ({ className }: typeof _types.props) => <span className={className}>{init}</span>
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
  const { Provider, Proxy, types: _types } = createChainOfResponsibility<void, EmptyObject, void>();

  const middleware: (typeof _types.middleware)[] = [
    (_init: typeof _types.init) => _next => (_request: typeof _types.request) => (_props: typeof _types.props) => (
      <span>Hello, World!</span>
    )
  ];

  const App = () => (
    // Allows <Provider> without "init" prop and <Proxy> without "request" prop.
    <Provider middleware={middleware}>
      <Proxy request={undefined} />
    </Provider>
  );

  // WHEN: Render.
  const result = render(<App />);

  // THEN: It should render "hello world".
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');
});
