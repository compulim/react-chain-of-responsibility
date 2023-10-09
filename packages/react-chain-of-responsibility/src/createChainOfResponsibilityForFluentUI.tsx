import { useCallback } from 'react';

import createChainOfResponsibility from './createChainOfResponsibility';

import type { IRenderFunction } from '@fluentui/react';
import type { Key } from 'react';

type UseBuildRenderFunctionOptions<Props> = { getKey?: (props: Props | undefined) => Key };

type UseBuildRenderFunction<Props> = (options?: UseBuildRenderFunctionOptions<Props>) => IRenderFunction<Props>;

// We are using the props as both "Request" and "Props".
// This should eases migration from `onRender` to chain of responsibility.
// Downside is, web developers could accidentally pass request as props and not honoring props modified by upstreamers.
export default function createChainOfResponsibilityForFluentUI<Props extends object, Init = undefined>(
  options?: Parameters<typeof createChainOfResponsibility>[0]
): ReturnType<typeof createChainOfResponsibility<Props | undefined, Props, Init>> & {
  useBuildRenderFunction: UseBuildRenderFunction<Props>;
} {
  const returnValue = createChainOfResponsibility<Props | undefined, Props, Init>(options);

  const { Proxy } = returnValue;

  const useBuildRenderFunction: UseBuildRenderFunction<Props> = (options = {}) => {
    const { getKey } = options;

    return useCallback<IRenderFunction<Props>>(
      (props, defaultRender) => (
        <Proxy {...(props as Props)} fallbackComponent={defaultRender} key={getKey?.(props)} request={props} />
      ),
      [getKey]
    );
  };

  return { ...returnValue, useBuildRenderFunction };
}
