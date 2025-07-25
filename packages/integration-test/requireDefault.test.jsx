/** @jest-environment jsdom */

const { createChainOfResponsibility } = require('react-chain-of-responsibility');
const { createChainOfResponsibilityForFluentUI } = require('react-chain-of-responsibility/fluentUI');
const { create } = require('react-test-renderer');
const { Fragment } = require('react');
const React = require('react');

const HelloWorld = () => <Fragment>Hello, World!</Fragment>;

test('simple scenario', () => {
  // GIVEN: A middleware return a component that would render "Hello, World!".
  const { Provider, Proxy } = createChainOfResponsibility();

  // WHEN: Render <Proxy>.
  const App = () => (
    <Provider middleware={[() => () => () => HelloWorld]}>
      <Proxy request={undefined} />
    </Provider>
  );

  const renderer = create(<App />);

  // THEN: It should render "Hello, World!".
  expect(renderer.toJSON()).toMatchInlineSnapshot(`"Hello, World!"`);
});

test('Fluent UI scenario', () => {
  // GIVEN: A middleware.
  const { Provider, useBuildRenderFunction } = createChainOfResponsibilityForFluentUI();

  const DisplayString = (
    /** @type {{ text?: string | undefined }} */
    { text }
  ) => <Fragment>{text}</Fragment>;
  const CallRender = (
    /** @type {{ text?: string | undefined }} */
    { text }
  ) => useBuildRenderFunction()({ text }, HelloWorld);

  const App = (
    /** @type {{ text?: string | undefined }} */
    { text }
  ) => (
    <Provider
      middleware={[
        () => next => (/** @type {{ text?: string | undefined } | undefined} */ request) =>
          request?.text ? DisplayString : next(request)
      ]}
    >
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
