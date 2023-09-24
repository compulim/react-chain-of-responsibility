import isReactComponent from '../isReactComponent';

test('false should return false', () => {
  expect(isReactComponent(false)).toBe(false);
});
