import { render } from '@testing-library/react';
import { test } from 'node:test';
import assert from 'node:assert';
import expect from 'expect';
import React, { Fragment } from 'react';
import { withProps, wrapWith } from 'react-wrap-with';
import { JSDOM } from 'jsdom';

// Setup JSDOM environment for React testing
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

import createChainOfResponsibility from '../../createChainOfResponsibility';

type Props = { children?: never };

test('middleware return a component with content of init should render', () => {
  // GIVEN: A middleware return component with content of init object.
  const { Provider, Proxy } = createChainOfResponsibility<void, Props, string>();

  // WHEN: Render <Provider> with the init of "Hello, World!".
  const App = wrapWith(
    withProps(Provider, {
      init: 'Hello, World!',
      middleware: [init => () => () => () => <Fragment>{init}</Fragment>]
    })
  )(Proxy);

  const result = render(<App request={undefined} />);

  // THEN: It should render "Hello, World!".
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');
});
