/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import { wrapWith } from 'react-wrap-with';
import React from 'react';

import createChainOfResponsibility from './createChainOfResponsibility';

test('constructing middleware using "types" should render', () => {
  // GIVEN: A chain of responsibility which specify init, props, and request.
  const { Provider, Proxy, types } = createChainOfResponsibility<string, { className: string }, string>();

  const middleware: (typeof types.middleware)[] = [
    (init: typeof types.init) => next => (request: typeof types.request) =>
      request === 'hello'
        ? ({ className }: typeof types.props) => <span className={className}>{init}</span>
        : next(request)
  ];

  const App = wrapWith(Provider, { init: 'Hello, World!', middleware })(Proxy);

  // WHEN: Render.
  const result = render(<App className="app" request="hello" />);

  // THEN: It should have class name of "app".
  expect(result.container.firstChild).toHaveProperty('className', 'app');

  // THEN: It should render "hello world".
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');
});
