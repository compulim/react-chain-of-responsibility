/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import { wrapWith } from 'react-wrap-with';
import React from 'react';

import createComponentChainOfResponsibility from './createComponentChainOfResponsibility';

import type { ComponentMiddleware } from './types';

type Props = { children?: never };

test('middleware return false should render', () => {
  // GIVEN: A middleware returning false.
  const { Provider, Proxy } = createComponentChainOfResponsibility<undefined, Props>();

  const App = wrapWith(Provider, { middleware: [() => () => () => false] })(Proxy);

  // WHEN: Render.
  const result = render(<App />);

  // THEN: It should render nothing.
  expect(result.container).toHaveProperty('childElementCount', 0);
});
