import React, { memo, useMemo } from 'react';

import applyMiddleware from './private/applyMiddleware';
import UseRenderContext from './private/UseRenderContext';

import type { Middleware } from './types';
import type { PropsWithChildren } from 'react';

type Props<P extends {}, S> = PropsWithChildren<{
  middleware?: Middleware<P, S>[];
  setup?: S;
}>;

function UseRenderProvider<P extends {}, S = undefined>({ children, middleware = [], setup }: Props<P, S>) {
  const useRender = useMemo(() => applyMiddleware(...middleware)(setup)(() => null), [middleware, setup]);

  const context = useMemo(() => ({ useRender }), [useRender]);

  return <UseRenderContext.Provider value={context}>{children}</UseRenderContext.Provider>;
}

const MemoizedUseRenderProvider = memo(UseRenderProvider);

MemoizedUseRenderProvider.displayName = 'UseRenderProvider';

export default MemoizedUseRenderProvider;
