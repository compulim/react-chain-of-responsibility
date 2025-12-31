import { render } from '@testing-library/react';
import { expect } from 'expect';
import { mock, test } from 'node:test';
import React, { Fragment, useMemo } from 'react';
import createChainOfResponsibilityForFluentUI from '../../createChainOfResponsibilityForFluentUI.tsx';

type Props = { value?: number };

test('useBuildRenderFunction should call getKey() for computing "key" attribute', () => {
  // GIVEN: A middleware.
  const { Provider, types: _types, useBuildRenderFunction } = createChainOfResponsibilityForFluentUI<Props>();

  const keys: (null | number | string | undefined)[] = [];
  const getKey = mock.fn(() => 'a');

  const Inner = () => {
    const renderFunction = useBuildRenderFunction({ getKey });

    const element = renderFunction({ value: 1 });

    keys.push(element?.key);

    return element;
  };

  const App = () => {
    const middleware = useMemo<(typeof _types.middleware)[]>(
      () => [
        () =>
          () =>
          () =>
          ({ value }) => <Fragment>{value}</Fragment>
      ],
      []
    );

    return (
      <Provider middleware={middleware}>
        <Inner />
      </Provider>
    );
  };

  // WHEN: Render.
  const result = render(<App />);

  // THEN: It should render 1.
  expect(result.container).toHaveProperty('textContent', '1');

  // THEN: It should have called getKey() once with { value: 1 } and returned "a".
  expect(getKey.mock.callCount()).toBe(1);
  expect(getKey.mock.calls[0]?.arguments).toEqual([{ value: 1 }]);
  expect(getKey.mock.calls[0]?.result).toBe('a');

  // THEN: It should have rendered 1 key.
  expect(keys).toEqual(['a']);
});
