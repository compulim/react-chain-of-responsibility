import React, { useCallback } from 'react';
import createChainOfResponsibility from './createChainOfResponsibility';

import type { Key } from 'react';
import type { IRenderFunction } from '@fluentui/react';

type UseRenderFunctionOptions<Props> = { getKey?: (props: Props | undefined) => Key };

type UseRenderFunction<Props> = (options?: UseRenderFunctionOptions<Props>) => IRenderFunction<Props>;

export default function createChainOfResponsibilityForFluentUI<Props extends {}, Init = undefined>(
  options?: Parameters<typeof createChainOfResponsibility>[0]
): ReturnType<typeof createChainOfResponsibility<Props | undefined, Props, Init>> & {
  useRenderFunction: UseRenderFunction<Props>;
} {
  const returnValue = createChainOfResponsibility<Props | undefined, Props, Init>(options);

  const { useComponent } = returnValue;

  // TODO: Test if middleware changed, the returned callback should change.
  const useRenderFunction: UseRenderFunction<Props> = (options = {}) => {
    const { getKey } = options;
    const getComponent = useComponent();

    return useCallback<IRenderFunction<Props>>(
      (props, defaultRender) => {
        // TODO: Test if calling <NextComponent item={something-else} /> can override the item passed to downstreamers.
        const Component = getComponent(props, { defaultComponent: defaultRender });

        return Component ? <Component {...(props as Props)} key={getKey?.(props)} /> : null;
      },
      [getComponent, getKey]
    );
  };

  return { ...returnValue, useRenderFunction };
}
