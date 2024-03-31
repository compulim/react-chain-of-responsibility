/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import React, { Fragment } from 'react';
import { withProps, wrapWith } from 'react-wrap-with';

import createChainOfResponsibility from './createChainOfResponsibility';

const HelloComponent = () => <Fragment>Hello</Fragment>;
const WorldComponent = () => <Fragment>World</Fragment>;

test('when calling multiple next in a middleware', () => {
  // GIVEN: A middleware which call downstreamer twice, with "hello", followed by "world".
  const { Provider, Proxy } = createChainOfResponsibility<string>({ passModifiedRequest: true });

  const App = wrapWith(
    withProps(Provider, {
      middleware: [
        () => next => () => {
          const HelloComponent = next('hello');
          const WorldComponent = next('world');

          if (HelloComponent && WorldComponent) {
            return () => (
              <Fragment>
                <HelloComponent /> <WorldComponent />
              </Fragment>
            );
          }
        },
        () => next => (request: string) => (request === 'hello' ? HelloComponent : next(request)),
        () => next => (request: string) => (request === 'world' ? WorldComponent : next(request))
      ]
    })
  )(Proxy);

  // WHEN: Render.
  const result = render(<App request={'aloha'} />);

  // THEN: It should render "hello world".
  expect(result.container).toHaveProperty('textContent', 'Hello World');
});
