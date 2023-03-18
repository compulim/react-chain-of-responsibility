/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import { wrapWith } from 'react-wrap-with';
import React, { Fragment } from 'react';

import createComponentChainOfResponsibility from './createComponentChainOfResponsibility';

type Props = { children?: never };

test('two providers of chain of responsibility nested should render', () => {
  // GIVEN: Two chain of responsibility each responsible for "Hello" and "World".
  const { Provider: HelloProvider, Proxy: HelloProxy } = createComponentChainOfResponsibility<undefined, Props>();
  const { Provider: WorldProvider, Proxy: WorldProxy } = createComponentChainOfResponsibility<undefined, Props>();

  // WHEN: Render <HelloProxy> and "WorldProxy".
  const App = wrapWith(HelloProvider, {
    middleware: [() => () => () => () => <Fragment>Hello</Fragment>]
  })(
    wrapWith(WorldProvider, {
      middleware: [() => () => () => () => <Fragment>World</Fragment>]
    })(() => (
      <Fragment>
        <HelloProxy /> <WorldProxy />
      </Fragment>
    ))
  );

  const result = render(<App />);

  // THEN: It should render "Hello World".
  expect(result.container).toHaveProperty('textContent', 'Hello World');
});
