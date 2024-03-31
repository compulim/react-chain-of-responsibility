/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import React, { Fragment } from 'react';
import { withProps, wrapWith } from 'react-wrap-with';

import createChainOfResponsibility from './createChainOfResponsibility';

type Props = { children?: never };

test('middleware return a component with content of init should render', () => {
  // GIVEN: A middleware return component with content of init object.
  const { Provider, Proxy } = createChainOfResponsibility<undefined, Props, string>();

  // WHEN: Render <Provider> with the init of "Hello, World!".
  const App = wrapWith(
    withProps(Provider, {
      init: 'Hello, World!',
      middleware: [init => () => () => () => <Fragment>{init}</Fragment>]
    })
  )(Proxy);

  const result = render(<App />);

  // THEN: It should render "Hello, World!".
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');
});
