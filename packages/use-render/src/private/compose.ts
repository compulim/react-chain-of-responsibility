// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fn<P extends any[], R> = (...args: P) => R;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Enhancer<P extends any[], R> = (next: Fn<P, R>) => Fn<P, R>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function compose<P extends any[], R>(...fns: Enhancer<P, R>[]): Enhancer<P, R> {
  return (fn: Fn<P, R>): Fn<P, R> => fns.reduce((chain, fn) => fn(chain), fn);
}
