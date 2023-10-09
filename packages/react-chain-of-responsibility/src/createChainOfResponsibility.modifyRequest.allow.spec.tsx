/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { Fragment } from 'react';
import { render } from '@testing-library/react';
import { wrapWith } from 'react-wrap-with';

import createChainOfResponsibility from './createChainOfResponsibility';

type AppProps = { thing: string };
type Props = { children?: never };

test('allow modifying request should render "citric fruit"', () => {
  // GIVEN: A chain of responsibility which allow modifying request.
  const { Provider, Proxy } = createChainOfResponsibility<string, Props>({ passModifiedRequest: true });

  // WHEN: Render using a middleware that turn "orange" into "citric fruit" when passing to the next middleware.
  const App = wrapWith(Provider, {
    middleware: [
      // Turns "orange" into "citric fruit".
      () => next => thing => (thing === 'orange' ? next('citric fruit') : next(thing)),
      () => () => thing => () => <Fragment>{thing}</Fragment>
    ]
  })(({ thing }: AppProps) => <Proxy request={thing} />);

  // THEN: It should render "citric fruit".
  expect(render(<App thing="orange" />)).toHaveProperty('container.textContent', 'citric fruit');
});
