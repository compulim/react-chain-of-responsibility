import isReactComponent from '../isReactComponent';

test('object should return false', () => {
  expect(isReactComponent({})).toBe(false);
});
