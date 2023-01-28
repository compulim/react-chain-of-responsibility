import type { ClassicElement, FunctionComponentElement } from 'react';
import type { Middleware as RawMiddleware } from './private/applyMiddleware';

type RenderingElement<P> = null | ClassicElement<P> | FunctionComponentElement<P>;

export type Middleware<P extends {} = {}, S = unknown> = RawMiddleware<[P], RenderingElement<P>, [S | undefined]>;
