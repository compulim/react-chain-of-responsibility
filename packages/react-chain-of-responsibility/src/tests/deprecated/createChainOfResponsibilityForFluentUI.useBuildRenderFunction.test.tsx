import { render } from '@testing-library/react';
import { expect } from 'expect';
import { test } from 'node:test';
import React from 'react';
import { withProps, wrapWith } from 'react-wrap-with';
import createChainOfResponsibilityForFluentUI from '../../createChainOfResponsibilityForFluentUI.tsx';

const { Fragment } = React;

type Props = { text?: string | undefined };

const HelloWorld = ({ text }: Props) => <Fragment>{text}</Fragment>;

test('useBuildRenderFunction should return IRenderFunction of Fluent UI', () => {
  // GIVEN: A middleware.
  const { Provider, useBuildRenderFunction } = createChainOfResponsibilityForFluentUI<Props>();

  const Inner = ({ text }: Props) => useBuildRenderFunction()({ text }, () => <Fragment>Hello, World!</Fragment>);

  const App = wrapWith(
    withProps(Provider, {
      middleware: [() => next => request => (request?.text ? HelloWorld : next(request))]
    })
  )(Inner);

  // WHEN: Render with "Aloha!" as "text" prop.
  const result = render(<App text="Aloha!" />);

  // THEN: It should render "Aloha!".
  expect(result.container).toHaveProperty('textContent', 'Aloha!');

  // WHEN: Re-render without "text" prop.
  result.rerender(<App />);

  // THEN: It should render "Hello, World!", which is the default render.
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');
});
