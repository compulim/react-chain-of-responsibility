import compose from './compose';

type Fn = (x: number, y: number) => number;

test('should chain 1 function', () => {
  const sum: Fn = (x: number, y: number): number => x + y;
  const multiplyBy10 =
    (next: Fn): Fn =>
    (x: number, y: number): number =>
      next(x * 10, y * 10);

  const enhancer = compose(multiplyBy10);

  expect(enhancer(sum)(123, 456)).toBe(1230 + 4560);
});

test('should chain 2 functions', () => {
  const sum: Fn = (x: number, y: number): number => x + y;
  const multiplyBy10 =
    (next: Fn): Fn =>
    (x: number, y: number): number =>
      next(x * 10, y * 10);
  const minus2 =
    (next: Fn): Fn =>
    (x: number, y: number): number =>
      next(x - 2, y - 2);

  const enhancer = compose(minus2, multiplyBy10);

  expect(enhancer(sum)(123, 456)).toBe(1228 + 4558);
});

test('should do nothing when no functions is passed', () => {
  const sum: Fn = (x: number, y: number): number => x + y;
  const enhancer = compose();

  expect(enhancer(sum)(123, 456)).toBe(123 + 456);
});
