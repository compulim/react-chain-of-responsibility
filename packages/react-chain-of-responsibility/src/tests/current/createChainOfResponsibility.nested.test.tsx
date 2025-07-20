import { render } from '@testing-library/react';
import { test } from 'node:test';
import expect from 'expect';
import React, { Fragment } from 'react';
import { withProps, wrapWith } from 'react-wrap-with';

import createChainOfResponsibility from '../../createChainOfResponsibility';

type Props = { children?: never };

test('two providers of chain of responsibility nested should render', () => {
  // GIVEN: Two chain of responsibility each responsible for "Hello" and "World".
  const { Provider: HelloProvider, Proxy: HelloProxy } = createChainOfResponsibility<void, Props>();
  const { Provider: WorldProvider, Proxy: WorldProxy } = createChainOfResponsibility<void, Props>();

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
        <HelloProxy request={undefined} /> <WorldProxy request={undefined} />
      </Fragment>
    ))
  );

  const result = render(<App />);

  // THEN: It should render "Hello World".
  expect(result.container).toHaveProperty('textContent', 'Hello World');
});
