const { test } = require('node:test');
const { expect } = require('expect');
const { createElement, Fragment } = require('react');
const { createChainOfResponsibility } = require('react-chain-of-responsibility');
const { create } = require('react-test-renderer');

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
