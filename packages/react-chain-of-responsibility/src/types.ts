import { type Enhancer, type Handler, type Middleware } from 'handler-chain';
import { type ComponentType } from 'react';

type ComponentResult<Props = { children?: never }> = ComponentType<Props> | false | null | undefined;

type ComponentHandler<Request, Props = { children?: never }> = Handler<ComponentResult<Props>, Request>;

type ComponentEnhancer<Request, Props = { children?: never }> = Enhancer<ComponentResult<Props>, Request>;

type ComponentMiddleware<Request, Props = { children?: never }, Init = undefined> = Middleware<
  ComponentResult<Props>,
  Request,
  Init
>;

export {
  type ComponentEnhancer, type ComponentHandler, type ComponentMiddleware, type ComponentResult
};
