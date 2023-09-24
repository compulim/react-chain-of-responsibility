import { Fragment } from 'react';

import isReactComponent from '../isReactComponent';

test('fragment should return true', () => {
  expect(isReactComponent(Fragment)).toBe(true);
});
