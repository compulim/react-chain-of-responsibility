/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { Fragment } from 'react';
import { render } from '@testing-library/react';
import { wrapWith } from 'react-wrap-with';

import createChainOfResponsibility from './createChainOfResponsibility';

type AppProps = { thing: string };
type Props = { children?: never };

let consoleWarnMock: jest.SpyInstance;

beforeEach(() => {
  // Currently, there is no way to hide the caught exception thrown by render().
  // We are mocking `console.log` to hide the exception.
  consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation(() => jest.fn());
});

afterEach(() => {
  consoleWarnMock.mockRestore();
});

test('disallow modifying request by default should render "orange"', () => {
  // GIVEN: A chain of responsibility without allowing or disallowing modifying request.
  const { Provider, Proxy } = createChainOfResponsibility<string, Props>({ passModifiedRequest: false });

  // WHEN: Render using a middleware that turn "orange" into "citric fruit" when passing to the next middleware.
  const App = wrapWith(Provider, {
    middleware: [
      // Turns "orange" into "citric fruit".
      () => next => thing => (thing === 'orange' ? next('citric fruit') : next(thing)),
      () => () => thing => () => <Fragment>{thing}</Fragment>
    ]
  })(({ thing }: AppProps) => <Proxy request={thing} />);

  // THEN: It should render "orange".
  expect(render(<App thing="orange" />)).toHaveProperty('container.textContent', 'orange');

  // THEN: A warning should be logged to remind the developer to enable "options.passModifiedRequest".
  expect(consoleWarnMock).toBeCalledWith(
    'react-chain-of-responsibility: "options.passModifiedRequest" must be set to true to pass a different request object to next().'
  );
});
