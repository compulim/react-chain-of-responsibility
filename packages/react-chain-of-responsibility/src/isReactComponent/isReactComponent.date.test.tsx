import isReactComponent from '../isReactComponent';

test('date should return false', () => {
  expect(isReactComponent(new Date())).toBe(false);
});
