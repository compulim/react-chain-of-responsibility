const { test } = require('node:test');
const { expect } = require('expect');
const { createElement, Fragment } = require('react');
const { createChainOfResponsibility } = require('react-chain-of-responsibility');
const { createChainOfResponsibilityForFluentUI } = require('react-chain-of-responsibility/fluentUI');
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

test('Fluent UI scenario', () => {
  // GIVEN: A middleware.
  const { Provider, useBuildRenderFunction } = createChainOfResponsibilityForFluentUI();

  const DisplayString = (
    /** @type {{ text?: string | undefined }} */
    { text }
  ) => createElement(Fragment, {}, text);
  const CallRender = (
    /** @type {{ text?: string | undefined }} */
    { text }
  ) => useBuildRenderFunction()({ text }, HelloWorld);

  const App = (
    /** @type {{ text?: string | undefined }} */
    { text }
  ) =>
    createElement(
      Provider,
      {
        middleware: [
          () => next => (/** @type {{ text?: string | undefined } | undefined} */ request) =>
            request?.text ? DisplayString : next(request)
        ]
      },
      createElement(CallRender, { text })
    );

  // WHEN: Render with "Aloha!" as "text" prop.
  const renderer = create(createElement(App, { text: 'Aloha!' }));

  // THEN: It should render "Aloha!".
  expect(renderer.toJSON()).toBe('Aloha!');

  // WHEN: Re-render without "text" prop.
  renderer.update(createElement(App));

  // THEN: It should render "Hello, World!", which is the default render.
  expect(renderer.toJSON()).toBe('Hello, World!');
});
