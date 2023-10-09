/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { Fragment } from 'react';
import { render } from '@testing-library/react';

import createChainOfResponsibility from './createChainOfResponsibility';

type Props = { children?: never; text: string };

const HelloWorldComponent = ({ text }: Props) => <Fragment>{text}</Fragment>;

test('middleware should render', () => {
  // GIVEN: A middleware return a component that would render "Hello, World!".
  const { Provider, Proxy } = createChainOfResponsibility<undefined, Props>();

  // WHEN: Render <Proxy>.
  const App = ({ text }: Props) => (
    <Provider middleware={[() => () => () => HelloWorldComponent]}>
      <Proxy text={text} />
    </Provider>
  );

  const result = render(<App text="Hello, World!" />);

  // THEN: It should render "Hello, World!".
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');

  result.rerender(<App text="Aloha!" />);

  // THEN: It should render "Aloha!".
  expect(result.container).toHaveProperty('textContent', 'Aloha!');
});
