import { expect } from 'expect';
import { test } from 'node:test';
import { render } from '@testing-library/react';
import React from 'react';
import { withProps, wrapWith } from 'react-wrap-with';
import createChainOfResponsibility from '../../createChainOfResponsibility.tsx';

type Props = { children?: never };

test('middleware return null should render', () => {
  // GIVEN: A middleware returning null.
  const { Provider, Proxy } = createChainOfResponsibility<void, Props>();

  const App = wrapWith(withProps(Provider, { middleware: [() => () => () => null] }))(Proxy);

  // WHEN: Render.
  const result = render(<App request={undefined} />);

  // THEN: It should render nothing.
  expect(result.container).toHaveProperty('childElementCount', 0);
});
