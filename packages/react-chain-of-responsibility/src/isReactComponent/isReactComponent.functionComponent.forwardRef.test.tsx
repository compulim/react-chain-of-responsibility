import { forwardRef } from 'react';

import isReactComponent from '../isReactComponent';

test('function component with forwardRef should return true', () => {
  const FunctionComponent = forwardRef(() => <div>Hello, World!</div>);

  expect(isReactComponent(FunctionComponent)).toBe(true);
});
