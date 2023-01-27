import React, { useMemo } from 'react';

import UseRenderContext from './private/UseRenderContext';

import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{}>;

const UseRenderProvider = ({ children }: Props) => {
  const context = useMemo(() => ({}), []);

  return <UseRenderContext.Provider value={context}>{children}</UseRenderContext.Provider>;
};

export default UseRenderProvider;
