/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import React, { Fragment } from 'react';

import createChainOfResponsibility from './createChainOfResponsibility';

type Props = { children?: never };

test('middleware should render readonly middleware array', () => {
  // GIVEN: A middleware return a component that would render "Hello, World!".
  const { Provider, Proxy } = createChainOfResponsibility<void, Props>();

  // WHEN: Render <Proxy>.
  const App = () => (
    <Provider middleware={Object.freeze([() => () => () => () => <Fragment>Hello, World!</Fragment>])}>
      <Proxy request={undefined} />
    </Provider>
  );

  const result = render(<App />);

  // THEN: It should render "Hello, World!".
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');
});
