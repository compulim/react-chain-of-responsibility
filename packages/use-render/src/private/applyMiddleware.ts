import compose from './compose';

type Fn<P extends any[], R> = (...args: P) => R;

export type Middleware<P extends any[], R, S extends any[]> = (...setupArgs: S) => (next: Fn<P, R>) => Fn<P, R>;

export default function applyMiddleware<P extends any[], R, S extends any[]>(...arrayOfMiddleware: Middleware<P, R, S>[]) {
  return (...setupArgs: S) => {
    const chain = arrayOfMiddleware.map(middleware => middleware(...setupArgs));

    return compose(...chain);
  };
}
