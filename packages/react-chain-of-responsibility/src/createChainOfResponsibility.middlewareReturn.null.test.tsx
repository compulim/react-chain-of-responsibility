/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import { wrapWith } from 'react-wrap-with';
import React from 'react';

import createChainOfResponsibility from './createChainOfResponsibility';

type Props = { children?: never };

test('middleware return null should render', () => {
  // GIVEN: A middleware returning null.
  const { Provider, Proxy } = createChainOfResponsibility<undefined, Props>();

  const App = wrapWith(Provider, { middleware: [() => () => () => null] })(Proxy);

  // WHEN: Render.
  const result = render(<App />);

  // THEN: It should render nothing.
  expect(result.container).toHaveProperty('childElementCount', 0);
});
