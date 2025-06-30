import { type IRenderFunction } from '@fluentui/react';
import React, { useCallback, type Key } from 'react';

import createChainOfResponsibility, {
  type CreateChainOfResponsibilityOptions
} from './createChainOfResponsibility.tsx';

type UseBuildRenderFunctionOptions<Props> = { getKey?: (props: Props | undefined) => Key };

type UseBuildRenderFunction<Props> = (options?: UseBuildRenderFunctionOptions<Props>) => IRenderFunction<Props>;

// We are using the props as both "Request" and "Props".
// This should eases migration from `onRender` to chain of responsibility.
// Downside is, web developers could accidentally pass request as props and not honoring props modified by upstreamers.

/**
 * @deprecated Fluent UI v9 no longer use `IRenderFunction` for custom render. We no longer validate the correctness of this function.
 */
export default function createChainOfResponsibilityForFluentUI<Props extends object, Init = undefined>(
  options?: CreateChainOfResponsibilityOptions
): ReturnType<typeof createChainOfResponsibility<Props | undefined, Props, Init>> & {
  useBuildRenderFunction: UseBuildRenderFunction<Props>;
} {
  const returnValue = createChainOfResponsibility<Props | undefined, Props, Init>(options as any);

  const { Proxy } = returnValue;

  const useBuildRenderFunction: UseBuildRenderFunction<Props> = (options = {}) => {
    const { getKey } = options;

    return useCallback<IRenderFunction<Props>>(
      (props, defaultRender) => (
        <Proxy {...(props as Props)} fallbackComponent={defaultRender as any} key={getKey?.(props)} request={props} />
      ),
      [getKey]
    );
  };

  return { ...returnValue, useBuildRenderFunction } as any;
}
