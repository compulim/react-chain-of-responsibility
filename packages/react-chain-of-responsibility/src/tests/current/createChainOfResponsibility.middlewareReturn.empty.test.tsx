import { render } from '@testing-library/react';
import { expect } from 'expect';
import { test } from 'node:test';
import React from 'react';
import { withProps, wrapWith } from 'react-wrap-with';
import createChainOfResponsibility from '../../createChainOfResponsibility.tsx';

type Props = { children?: never };

test('middleware return a class component should render', () => {
  // GIVEN: A middleware returning a class component.
  const { Provider, Proxy } = createChainOfResponsibility<void, Props>();

  const App = wrapWith(withProps(Provider, { middleware: [] }))(Proxy);

  // WHEN: Render.
  const result = render(<App request={undefined} />);

  // THEN: It should render nothing.
  expect(result.container).toHaveProperty('childElementCount', 0);
});
