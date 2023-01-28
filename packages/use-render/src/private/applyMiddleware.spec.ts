import applyMiddleware from './applyMiddleware';

type Fn = (x: number, y: number) => number;

test('should chain 1 middleware', () => {
  const sum: Fn = (x: number, y: number): number => x + y;
  const multiplyBy =
    (value: number) =>
    (next: Fn): Fn =>
    (x: number, y: number): number =>
      next(x * value, y * value);

  const enhancer = applyMiddleware(multiplyBy)(10);

  expect(enhancer(sum)(123, 456)).toBe(1230 + 4560);
});

test('should chain 2 middleware', () => {
  const sum: Fn = (x: number, y: number): number => x + y;
  const multiply =
    (value: number) =>
    (next: Fn): Fn =>
    (x: number, y: number): number =>
      next(x * value, y * value);
  const minus =
    (value: number) =>
    (next: Fn): Fn =>
    (x: number, y: number): number =>
      next(x - value, y - value);

  const enhancer = applyMiddleware(multiply, minus)(2);

  expect(enhancer(sum)(123, 456)).toBe(123 * 2 - 2 + (456 * 2 - 2));
});
