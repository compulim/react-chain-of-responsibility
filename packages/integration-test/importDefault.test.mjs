/** @jest-environment jsdom */

import React, { Fragment } from 'react';
import { createChainOfResponsibility, createChainOfResponsibilityForFluentUI } from 'react-chain-of-responsibility';
import { create } from 'react-test-renderer';

const HelloWorld = () => <Fragment>Hello, World!</Fragment>;

test('simple scenario', () => {
  // GIVEN: A middleware return a component that would render "Hello, World!".
  const { Provider, Proxy } = createChainOfResponsibility();

  // WHEN: Render <Proxy>.
  const App = () => (
    <Provider middleware={[() => () => () => HelloWorld]}>
      <Proxy />
    </Provider>
  );

  const renderer = create(<App />);

  // THEN: It should render "Hello, World!".
  expect(renderer.toJSON()).toMatchInlineSnapshot(`"Hello, World!"`);
});

test('Fluent UI scenario', () => {
  // GIVEN: A middleware.
  const { Provider, useBuildRenderFunction } = createChainOfResponsibilityForFluentUI();

  const DisplayString = ({ text }) => <Fragment>{text}</Fragment>;
  const CallRender = ({ text }) => useBuildRenderFunction()({ text }, HelloWorld);

  const App = ({ text }) => (
    <Provider middleware={[() => next => request => (request?.text ? DisplayString : next(request))]}>
      <CallRender text={text} />
    </Provider>
  );

  // WHEN: Render with "Aloha!" as "text" prop.
  const renderer = create(<App text="Aloha!" />);

  // THEN: It should render "Aloha!".
  expect(renderer.toJSON()).toMatchInlineSnapshot(`"Aloha!"`);

  // WHEN: Re-render without "text" prop.
  renderer.update(<App />);

  // THEN: It should render "Hello, World!", which is the default render.
  expect(renderer.toJSON()).toMatchInlineSnapshot(`"Hello, World!"`);
});
