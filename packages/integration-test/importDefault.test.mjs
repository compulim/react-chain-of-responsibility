import { test } from 'node:test';
import { expect } from 'expect';
import { createElement, Fragment } from 'react';
import { createChainOfResponsibility } from 'react-chain-of-responsibility';
import { create } from 'react-test-renderer';

const HelloWorld = () => createElement(Fragment, {}, 'Hello, World!');

test('simple scenario', () => {
  // GIVEN: A middleware return a component that would render "Hello, World!".
  const { Provider, Proxy } = createChainOfResponsibility();

  // WHEN: Render <Proxy>.
  const App = () =>
    createElement(
      Provider,
      { middleware: [() => () => () => HelloWorld] },
      createElement(Proxy, { request: undefined })
    );

  const renderer = create(createElement(App));

  // THEN: It should render "Hello, World!".
  expect(renderer.toJSON()).toBe('Hello, World!');
});
