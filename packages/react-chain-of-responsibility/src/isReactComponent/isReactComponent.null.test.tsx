import isReactComponent from '../isReactComponent';

test('null should return false', () => {
  expect(isReactComponent(null)).toBe(false);
});
