import compose from './compose';

type Fn<P extends any[], R> = (...args: P) => R;

export type Enhancer<P extends any[], R> = (next: Fn<P, R>) => Fn<P, R>;
export type Middleware<P extends any[], R, S extends any[]> = (...init: S) => Enhancer<P, R>;

export default function applyMiddleware<P extends any[], R, S extends any[]>(
  ...arrayOfMiddleware: Middleware<P, R, S>[]
) {
  return (...init: S) => {
    const chain = arrayOfMiddleware.map(middleware => middleware(...init));

    return compose(...chain);
  };
}
