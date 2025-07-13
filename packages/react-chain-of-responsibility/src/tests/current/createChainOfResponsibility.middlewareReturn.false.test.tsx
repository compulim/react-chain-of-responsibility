/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import React from 'react';
import { withProps, wrapWith } from 'react-wrap-with';

import createChainOfResponsibility from '../../createChainOfResponsibility';

type Props = { children?: never };

test('middleware return false should render', () => {
  // GIVEN: A middleware returning false.
  const { Provider, Proxy } = createChainOfResponsibility<void, Props>();

  const App = wrapWith(withProps(Provider, { middleware: [() => () => () => false] }))(Proxy);

  // WHEN: Render.
  const result = render(<App request={undefined} />);

  // THEN: It should render nothing.
  expect(result.container).toHaveProperty('childElementCount', 0);
});
