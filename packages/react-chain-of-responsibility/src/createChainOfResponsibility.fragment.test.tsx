/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import React, { Fragment, type ReactNode } from 'react';

import createChainOfResponsibility from './createChainOfResponsibility';

type Props = { children?: ReactNode };

test('middleware using <Fragment> should render', () => {
  // GIVEN: A middleware return a component that would render "Hello, World!".
  const { Provider, Proxy } = createChainOfResponsibility<void, Props>();

  // WHEN: Render <Proxy>.
  const App = () => (
    <Provider middleware={[() => () => () => Fragment]}>
      <Proxy>Hello, World!</Proxy>
    </Provider>
  );

  const result = render(<App />);

  // THEN: It should render "Hello, World!".
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');
});
