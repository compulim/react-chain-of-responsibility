type Fn<P extends any[], R> = (...args: P) => R;
type Enhancer<P extends any[], R> = (next: Fn<P, R>) => Fn<P, R>;

export default function compose<P extends any[], R>(...fns: Enhancer<P, R>[]): Enhancer<P, R> {
  return (fn: Fn<P, R>): Fn<P, R> => fns.reduce((chain, fn) => fn(chain), fn);
}
