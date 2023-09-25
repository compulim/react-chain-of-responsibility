import React, { memo } from 'react';

import isReactComponent from '../isReactComponent';

test('function component should return true', () => {
  const FunctionComponent = memo(() => <div>Hello, World!</div>);

  FunctionComponent.displayName = 'FunctionComponent';

  expect(isReactComponent(FunctionComponent)).toBe(true);
});
