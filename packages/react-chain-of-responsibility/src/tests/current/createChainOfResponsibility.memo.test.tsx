import { render } from '@testing-library/react';
import { expect } from 'expect';
import { test } from 'node:test';
import React from 'react';
import createChainOfResponsibility from '../../createChainOfResponsibility.tsx';

const { Fragment, memo } = React;

type Props = { children?: never; text: string };

const HelloWorldComponent = memo(({ text }: Props) => <Fragment>{text}</Fragment>);

test('middleware should render', () => {
  // GIVEN: A middleware return a component that would render "Hello, World!".
  const { Provider, Proxy } = createChainOfResponsibility<void, Props>();

  // WHEN: Render <Proxy>.
  const App = ({ text }: Props) => (
    <Provider middleware={[() => () => () => HelloWorldComponent]}>
      <Proxy request={undefined} text={text} />
    </Provider>
  );

  const result = render(<App text="Hello, World!" />);

  // THEN: It should render "Hello, World!".
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');

  result.rerender(<App text="Aloha!" />);

  // THEN: It should render "Aloha!".
  expect(result.container).toHaveProperty('textContent', 'Aloha!');
});
