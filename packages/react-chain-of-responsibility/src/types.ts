import { type ComponentType } from 'react';
import { type Middleware } from './private/applyMiddleware.ts';

export type ComponentMiddleware<Request, Props = { children?: never }, Init = undefined> = Middleware<
  [Request],
  ComponentType<Props> | false | null | undefined,
  [Init]
>;

export type Optionalable<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: T[K];
} & {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
};
