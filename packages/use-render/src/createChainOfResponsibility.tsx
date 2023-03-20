import React, { ComponentType, createContext, isValidElement, memo, useCallback, useContext, useMemo } from 'react';

import applyMiddleware from './private/applyMiddleware';

import type { ComponentMiddleware } from './types';
import type { PropsWithChildren } from 'react';

type UseBuildComponentCallbackOptions<Props> = { defaultComponent?: ComponentType<Props> | false | null | undefined };

type UseBuildComponentCallback<Request, Props> = (
  request: Request,
  options?: UseBuildComponentCallbackOptions<Props>
) => ComponentType<Props> | false | null | undefined;

type ProviderContext<Request, Props> = {
  useBuildComponentCallback: UseBuildComponentCallback<Request, Props>;
};

type ProviderProps<Request, Props, Init> = PropsWithChildren<{
  middleware: ComponentMiddleware<Request, Props, Init>[];
}> &
  (Init extends never | undefined ? { init?: Init } : { init: Init });

type ProxyProps<Request, Props> = Request extends never | undefined
  ? Props & { defaultComponent?: ComponentType<Props>; request?: Request }
  : Props & { defaultComponent?: ComponentType<Props>; request: Request };

type Options = {
  /**
   * Allows a middleware to pass another request object when calling its next middleware. Default is disabled.
   *
   * However, middleware could modify the request object before calling its next middleware. It is recommended
   * to use Object.freeze() to prevent middleware from modifying the request object.
   */
  allowModifiedRequest?: boolean;
};

export default function createChainOfResponsibility<
  Request = undefined,
  Props = { children?: never },
  Init = undefined
>(
  options: Options = {}
): {
  Provider: ComponentType<ProviderProps<Request, Props, Init>>;
  Proxy: ComponentType<ProxyProps<Request, Props>>;
  types: {
    init: Init;
    middleware: ComponentMiddleware<Request, Props, Init>;
    props: Props;
    request: Request;
  };
  useBuildComponentCallback: () => UseBuildComponentCallback<Request, Props>;
} {
  const context = createContext<ProviderContext<Request, Props>>({
    get useBuildComponentCallback(): ProviderContext<Request, Props>['useBuildComponentCallback'] {
      throw new Error('useBuildComponentCallback() hook cannot be used outside of its corresponding <Provider>');
    }
  });

  const Provider: ComponentType<ProviderProps<Request, Props, Init>> = ({ children, init, middleware }) => {
    if (!Array.isArray(middleware) || middleware.some(middleware => typeof middleware !== 'function')) {
      throw new Error('middleware prop must be an array of functions');
    }

    const patchedMiddleware: ComponentMiddleware<Request, Props, Init>[] = (middleware || []).map(fn => {
      return init => {
        const enhancer = fn(init);

        return next => originalRequest => {
          let hasReturned: boolean;

          const returnValue = enhancer(nextRequest => {
            if (hasReturned) {
              throw new Error('next() cannot be called after the function had returned synchronously');
            }

            return next(options.allowModifiedRequest ? nextRequest : originalRequest);
          })(originalRequest);

          hasReturned = true;

          if (isValidElement(returnValue)) {
            throw new Error('middleware must not return React element directly');
          } else if (
            returnValue !== false &&
            returnValue !== null &&
            typeof returnValue !== 'function' &&
            typeof returnValue !== 'undefined'
          ) {
            throw new Error('middleware must return false, null, undefined, function component, or class component');
          }

          return returnValue;
        };
      };
    });

    const enhancer = useMemo(
      () =>
        // We are reversing because it is easier to read:
        // - With reverse, [a, b, c] will become a(b(c(fn)))
        // - Without reverse, [a, b, c] will become c(b(a(fn)))
        applyMiddleware<[Request], ComponentType<Props> | false | null | undefined, [Init]>(
          ...[...(patchedMiddleware || [])].reverse()
        )(init as Init),
      [init, middleware]
    );

    const useBuildComponentCallback = useCallback<UseBuildComponentCallback<Request, Props>>(
      (request, options = {}) => enhancer(() => options.defaultComponent)(request),
      [enhancer]
    );

    const contextValue = useMemo<ProviderContext<Request, Props>>(() => ({ useBuildComponentCallback }), [useBuildComponentCallback]);

    return <context.Provider value={contextValue}>{children}</context.Provider>;
  };

  const useBuildComponentCallback = () => useContext(context).useBuildComponentCallback;

  const Proxy: ComponentType<ProxyProps<Request, Props>> = memo(({ children, defaultComponent, request, ...props }) => {
    let enhancer: ReturnType<typeof useBuildComponentCallback>;

    try {
      enhancer = useBuildComponentCallback();
    } catch {
      throw new Error('<Proxy> cannot be used outside of its corresponding <Provider>');
    }

    const Component = enhancer(request as Request, { defaultComponent });

    return Component ? <Component {...(props as Props)}>{children}</Component> : null;
  });

  return {
    Provider,
    Proxy,
    types: {
      init: undefined as unknown as Init,
      middleware: undefined as unknown as ComponentMiddleware<Request, Props, Init>,
      props: undefined as unknown as Props,
      request: undefined as unknown as Request
    },
    useBuildComponentCallback
  };
}
