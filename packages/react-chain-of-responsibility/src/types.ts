import { type Middleware } from 'handler-chain';
import { type ComponentType } from 'react';

export type ComponentMiddleware<Request, Props = { children?: never }, Init = undefined> = Middleware<
  ComponentType<Props> | false | null | undefined,
  Request,
  Init
>;
