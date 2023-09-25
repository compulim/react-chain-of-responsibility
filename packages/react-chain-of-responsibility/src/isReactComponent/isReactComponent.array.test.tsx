import isReactComponent from '../isReactComponent';

test('array should return false', () => {
  expect(isReactComponent([])).toBe(false);
});
