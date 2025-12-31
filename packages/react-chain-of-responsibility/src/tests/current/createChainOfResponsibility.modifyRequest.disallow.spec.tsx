import { render } from '@testing-library/react';
import { expect } from 'expect';
import { spyOn, type SpiedFunction } from 'jest-mock';
import { afterEach, beforeEach, test } from 'node:test';
import React from 'react';
import { withProps, wrapWith } from 'react-wrap-with';
import createChainOfResponsibility from '../../createChainOfResponsibility.tsx';

const { Fragment } = React;

type AppProps = { thing: string };
type Props = { children?: never };

let consoleWarnMock: SpiedFunction;

beforeEach(() => {
  // Currently, there is no way to hide the caught exception thrown by render().
  // We are mocking `console.log` to hide the exception.
  consoleWarnMock = spyOn(console, 'warn');
});

afterEach(() => {
  consoleWarnMock.mockRestore();
});

test('disallow modifying request explicitly should render "orange"', () => {
  // GIVEN: A chain of responsibility which disallow modifying request.
  const { Provider, Proxy } = createChainOfResponsibility<string, Props>({ passModifiedRequest: false });

  // WHEN: Render using a middleware that turn "orange" into "citric fruit" when passing to the next middleware.
  const App = wrapWith(
    withProps(Provider, {
      middleware: [
        // Turns "orange" into "citric fruit".
        () => next => thing => (thing === 'orange' ? next('citric fruit') : next(thing)),
        () => () => thing => () => <Fragment>{thing}</Fragment>
      ]
    })
  )(({ thing }: AppProps) => <Proxy request={thing} />);

  // THEN: It should render "orange".
  expect(render(<App thing="orange" />)).toHaveProperty('container.textContent', 'orange');

  // THEN: A warning should be logged to remind the developer to enable "options.passModifiedRequest".
  expect(consoleWarnMock).toHaveBeenCalledWith(
    'react-chain-of-responsibility: "options.passModifiedRequest" must be set to true to pass a different request object to next().'
  );
});
