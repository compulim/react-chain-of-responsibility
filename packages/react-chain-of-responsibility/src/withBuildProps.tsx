import React, { memo } from 'react';
import { type ChainOfResponsibility, type ProxyProps } from './createChainOfResponsibility';

/**
 * Enhances a chain-of-responsibility with prop transformation capabilities by modifying
 * the `<Proxy>` component and the `useBuildComponentCallback` hook.
 *
 * Each request will generate a new component instance with transformed props.
 *
 * When using `useBuildComponentCallback()`, implement proper memoization to avoid
 * unnecessary component regeneration with identical requests.
 *
 * @param chainOfResponsibility - The chain-of-responsibility to extends with prop transformation
 * @param buildProps - Function to transform props
 * @returns Enhanced chain-of-responsibility with prop transformation applied
 */
export default function withBuildProps<Request, Props extends object, Init>(
  chainOfResponsibility: ChainOfResponsibility<Request, Props, Init>,
  buildProps: (props: Props, request: Request) => Props
): typeof chainOfResponsibility {
  function Proxy({ fallbackComponent, request, ...props }: ProxyProps<Request, Props>) {
    const nextProps: ProxyProps<Request, Props> = {
      // TODO: Every time we add something to ProxyProps, we need to make sure they are removed here properly.
      ...buildProps(props as Props, request),
      fallbackComponent,
      request
    };

    return <chainOfResponsibility.Proxy {...nextProps} />;
  }

  function useBuildComponentCallback(): ReturnType<typeof chainOfResponsibility.useBuildComponentCallback> {
    const buildComponent = chainOfResponsibility.useBuildComponentCallback();

    return (request, options) => {
      const Component = buildComponent(request, {
        fallbackComponent: options?.fallbackComponent
      });

      return (
        Component &&
        function BoundComponent(props: Props) {
          return <Component {...buildProps(props, request)} />;
        }
      );
    };
  }

  return Object.freeze({
    ...chainOfResponsibility,
    Proxy: memo<ProxyProps<Request, Props>>(Proxy),
    useBuildComponentCallback
  });
}
