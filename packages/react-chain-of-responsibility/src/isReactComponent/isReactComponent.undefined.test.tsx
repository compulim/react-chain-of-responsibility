import isReactComponent from '../isReactComponent';

test('undefined should return false', () => {
  expect(isReactComponent(undefined)).toBe(false);
});
