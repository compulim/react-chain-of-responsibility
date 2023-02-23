import type { ComponentType } from 'react';
import type { Middleware } from './private/applyMiddleware';

export type ComponentMiddleware<P extends object, S = undefined, T extends object = P> = Middleware<
  [P],
  ComponentType<T> | false | null | undefined,
  [S | undefined]
>;
