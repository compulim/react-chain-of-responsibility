import isReactComponent from '../isReactComponent';

test('boolean should return false', () => {
  expect(isReactComponent(true)).toBe(false);
});
