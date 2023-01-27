import { Context, useContext as useReactContext } from 'react';

import UseRenderContext from './UseRenderContext';

type ContextOf<T> = T extends Context<infer P> ? P : never;

export default function useContext(): ContextOf<typeof UseRenderContext> {
  const context = useReactContext(UseRenderContext);

  if (!context) {
    throw new Error('<UseRenderProvider> must be installed in the app.');
  }

  return context;
}
