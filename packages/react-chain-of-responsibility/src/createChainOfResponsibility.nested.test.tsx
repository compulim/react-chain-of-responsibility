/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { Fragment } from 'react';
import { render } from '@testing-library/react';
import { withProps, wrapWith } from 'react-wrap-with';

import createChainOfResponsibility from './createChainOfResponsibility';

type Props = { children?: never };

test('two providers of chain of responsibility nested should render', () => {
  // GIVEN: Two chain of responsibility each responsible for "Hello" and "World".
  const { Provider: HelloProvider, Proxy: HelloProxy } = createChainOfResponsibility<undefined, Props>();
  const { Provider: WorldProvider, Proxy: WorldProxy } = createChainOfResponsibility<undefined, Props>();

  // WHEN: Render <HelloProxy> and "WorldProxy".
  const App = wrapWith(
    withProps(HelloProvider, {
      middleware: [() => () => () => () => <Fragment>Hello</Fragment>]
    })
  )(
    wrapWith(
      withProps(WorldProvider, {
        middleware: [() => () => () => () => <Fragment>World</Fragment>]
      })
    )(() => (
      <Fragment>
        <HelloProxy /> <WorldProxy />
      </Fragment>
    ))
  );

  const result = render(<App />);

  // THEN: It should render "Hello World".
  expect(result.container).toHaveProperty('textContent', 'Hello World');
});
