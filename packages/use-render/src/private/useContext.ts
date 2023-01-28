import { useContext as useReactContext } from 'react';

import UseRenderContext from './UseRenderContext';

import type { UseRenderContextType } from './UseRenderContext';

export default function useContext<P>(): UseRenderContextType<P> {
  const context = useReactContext(UseRenderContext);

  if (!context) {
    throw new Error('<UseRenderProvider> must be installed in the app.');
  }

  return context;
}
