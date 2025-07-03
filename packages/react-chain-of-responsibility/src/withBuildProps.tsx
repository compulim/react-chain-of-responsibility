import React, { memo } from 'react';
import { type ChainOfResponsibility, type ProxyProps } from './createChainOfResponsibility';

export default function withBuildProps<
  Request,
  Props extends object & RequestProps,
  Init,
  RequestProps extends object | void
>(
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
