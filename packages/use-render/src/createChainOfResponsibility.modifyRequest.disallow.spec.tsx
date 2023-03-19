/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import { wrapWith } from 'react-wrap-with';
import React, { Fragment } from 'react';

import createChainOfResponsibility from './createChainOfResponsibility';

type AppProps = { thing: string };
type Props = { children?: never };

test('disallow modifying request explicitly should render "orange"', () => {
  // GIVEN: A chain of responsibility which disallow modifying request.
  const { Provider, Proxy } = createChainOfResponsibility<string, Props>({ allowModifiedRequest: false });

  // WHEN: Render using a middleware that turn "orange" into "citric fruit" when passing to the next middleware.
  const App = wrapWith(Provider, {
    middleware: [
      // Turns "orange" into "citric fruit".
      () => next => thing => thing === 'orange' ? next('citric fruit') : next(thing),
      () => () => thing => () => <Fragment>{thing}</Fragment>
    ]
  })(({ thing }: AppProps) => <Proxy request={thing} />);

  // THEN: It should render "orange".
  expect(render(<App thing="orange" />)).toHaveProperty('container.textContent', 'orange');
});
