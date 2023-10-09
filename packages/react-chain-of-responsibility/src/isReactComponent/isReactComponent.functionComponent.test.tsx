import isReactComponent from '../isReactComponent';

test('function component should return true', () => {
  const FunctionComponent = () => <div>Hello, World!</div>;

  expect(isReactComponent(FunctionComponent)).toBe(true);
});
