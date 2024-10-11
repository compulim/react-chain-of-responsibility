import { type ComponentType } from 'react';
import { type Middleware } from './private/applyMiddleware.ts';

export type ComponentMiddleware<Request, Props = { children?: never }, Init = undefined> = Middleware<
  [Request],
  ComponentType<Props> | false | null | undefined,
  [Init]
>;
