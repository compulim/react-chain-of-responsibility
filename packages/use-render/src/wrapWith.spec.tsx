/** @jest-environment jsdom */

import { render } from '@testing-library/react';
import React from 'react';

import wrapWith from './wrapWith';

import type { PropsWithChildren } from 'react';

type SimpleProps = {
  className?: string;
};

const ListItem = ({ children, className }: PropsWithChildren<SimpleProps>) => (
  <li className={className} role="listitem">
    {children}
  </li>
);
const OrderedList = ({ children, className }: PropsWithChildren<SimpleProps>) => (
  <ol className={className} role="list">
    {children}
  </ol>
);

describe('Wrapping <ListItem> with <OrderedList>', () => {
  const SingleListItem = wrapWith(OrderedList, { className: 'list' })(ListItem, { className: 'list-item' });

  test('should render', () => {
    const result = render(<SingleListItem>Hello, World!</SingleListItem>);

    const list = result.getByRole('list');

    expect(list).toBeTruthy();
    expect(list).toHaveProperty('className', 'list');

    const listItem = result.getByRole('listitem');

    expect(listItem).toBeTruthy();
    expect(listItem).toHaveProperty('className', 'list-item');

    expect(listItem.parentElement).toBe(list);
    expect(listItem.textContent).toBe('Hello, World!');
  });

  test('should render with props override', () => {
    const result = render(<SingleListItem className="aloha-item">Hello, World!</SingleListItem>);

    const list = result.getByRole('list');

    expect(list).toBeTruthy();
    expect(list).toHaveProperty('className', 'list');

    const listItem = result.getByRole('listitem');

    expect(listItem).toBeTruthy();
    expect(listItem).toHaveProperty('className', 'aloha-item');

    expect(listItem.parentElement).toBe(list);
    expect(listItem.textContent).toBe('Hello, World!');
  });
});

test.each([false, null, undefined] as [false, null, undefined])('wrapping <ListItem> with `%s`', wrapper => {
  const Wrapped = wrapWith(wrapper)(ListItem);

  const result = render(<Wrapped>Hello, World!</Wrapped>);

  const listItem = result.getByRole('listitem');

  expect(listItem.textContent).toBe('Hello, World!');
  expect(listItem.parentElement).toBe(result.container);
});

test.each([false, null, undefined] as [false, null, undefined])('wrapping `%s` with <OrderedList>', wrapping => {
  const Wrapped = wrapWith(OrderedList)(wrapping);

  const result = render(<Wrapped>Hello, World!</Wrapped>);

  const listItem = result.getByRole('list');

  expect(listItem.textContent).toBe('Hello, World!');
  expect(listItem.parentElement).toBe(result.container);
});

test.each([false, null, undefined] as [false, null, undefined])(
  'wrapping `%s` with the same type of component',
  wrapperAndWrapping => {
    const Wrapped = wrapWith(wrapperAndWrapping)(wrapperAndWrapping);

    const result = render(<Wrapped>Hello, World!</Wrapped>);

    expect(result.container.hasChildNodes()).toBe(false);
  }
);
