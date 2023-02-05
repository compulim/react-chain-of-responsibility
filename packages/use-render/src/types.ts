import type { ComponentType } from 'react';
import type { Middleware } from './private/applyMiddleware';

export type ComponentMiddleware<P extends {}, S = undefined, T extends {} = P> = Middleware<
  [P],
  ComponentType<T> | false | null | undefined,
  [S | undefined]
>;
