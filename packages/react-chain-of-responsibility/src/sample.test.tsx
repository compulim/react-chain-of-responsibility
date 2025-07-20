
import { test } from 'node:test';
import expect from 'expect';
import { render } from '@testing-library/react';
import React, { Fragment, memo } from 'react';

type Props = { children?: never; text: string };

let times = 0;

const fn = jest.fn();

const HelloWorld = memo(
  times++ % 2 === 0
    ? ({ text }: Props) => {
        fn();

        return <Fragment>{text}</Fragment>;
      }
    : ({ text }: Props) => {
        fn();

        return <Fragment>{text}</Fragment>;
      }
);

test('middleware should render', () => {
  const App = () => <HelloWorld text="Hello, World!" />;

  const result = render(<App />);

  expect(fn).toHaveBeenCalledTimes(1);
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');

  result.rerender(<App />);

  expect(fn).toHaveBeenCalledTimes(1);
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');
});
