/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import React from 'react';
import { withProps, wrapWith } from 'react-wrap-with';

import createChainOfResponsibility from './createChainOfResponsibility';

type Props = { children?: never };

test('middleware return undefined should render', () => {
  // GIVEN: A middleware returning undefined.
  const { Provider, Proxy } = createChainOfResponsibility<void, Props>();

  const App = wrapWith(withProps(Provider, { middleware: [() => () => () => undefined] }))(Proxy);

  // WHEN: Render.
  const result = render(<App />);

  // THEN: It should render nothing.
  expect(result.container).toHaveProperty('childElementCount', 0);
});
