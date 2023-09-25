import isReactComponent from '../isReactComponent';

test('number should return false', () => {
  expect(isReactComponent(0)).toBe(false);
});
