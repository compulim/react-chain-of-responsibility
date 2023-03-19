/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import { wrapWith } from 'react-wrap-with';
import React, { Fragment } from 'react';

import createChainOfResponsibilityForFluentUI from './createChainOfResponsibilityForFluentUI';

type Props = { text?: string };

const HelloWorld = ({ text }: Props) => <Fragment>{text}</Fragment>;

test('useRenderFunction should create IRenderFunction of Fluent UI', () => {
  // GIVEN: A middleware.
  const { Provider, useRenderFunction } = createChainOfResponsibilityForFluentUI<Props>();

  const Inner = ({ text }: Props) => useRenderFunction()({ text }, () => <Fragment>Hello, World!</Fragment>);

  const App = wrapWith(Provider, {
    middleware: [() => next => request => request?.text ? HelloWorld : next(request)]
  })(Inner);

  // WHEN: Render with "Aloha!" as "text" prop.
  const result = render(<App text="Aloha!" />);

  // THEN: It should render "Aloha!".
  expect(result.container).toHaveProperty('textContent', 'Aloha!');

  // WHEN: Re-render without "text" prop.
  result.rerender(<App />);

  // THEN: It should render "Hello, World!", which is the default render.
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');
});
