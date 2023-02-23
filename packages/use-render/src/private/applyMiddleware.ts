import compose from './compose';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fn<P extends any[], R> = (...args: P) => R;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Enhancer<P extends any[], R> = (next: Fn<P, R>) => Fn<P, R>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Middleware<P extends any[], R, S extends any[]> = (...init: S) => Enhancer<P, R>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function applyMiddleware<P extends any[], R, S extends any[]>(
  ...arrayOfMiddleware: Middleware<P, R, S>[]
) {
  return (...init: S) => {
    const chain = arrayOfMiddleware.map(middleware => middleware(...init));

    return compose(...chain);
  };
}
