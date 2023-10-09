/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { Fragment, useMemo } from 'react';
import { render } from '@testing-library/react';

import createChainOfResponsibilityForFluentUI from './createChainOfResponsibilityForFluentUI';

type Props = { value?: number };

test('useBuildRenderFunction should call getKey() for computing "key" attribute', () => {
  // GIVEN: A middleware.
  const { Provider, types, useBuildRenderFunction } = createChainOfResponsibilityForFluentUI<Props>();

  const keys: (null | number | string | undefined)[] = [];
  const getKey = jest.fn(() => 'a');

  const Inner = () => {
    const renderFunction = useBuildRenderFunction({ getKey });

    const element = renderFunction({ value: 1 });

    keys.push(element?.key);

    return element;
  };

  const App = () => {
    const middleware = useMemo<(typeof types.middleware)[]>(
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
  expect(getKey).toHaveBeenCalledTimes(1);
  expect(getKey).toHaveBeenNthCalledWith(1, { value: 1 });
  expect(getKey).toHaveNthReturnedWith(1, 'a');

  // THEN: It should have rendered 1 key.
  expect(keys).toEqual(['a']);
});
