import { createContext } from 'react';

import type { ClassicElement, FunctionComponentElement } from 'react';

export type UseRenderContextType<P> = {
  useRender: (props: P) => null | ClassicElement<P> | FunctionComponentElement<P>;
};

export default createContext<UseRenderContextType<any> | undefined>(undefined);
