import React, { ComponentType, createContext, isValidElement, useCallback, useContext, useMemo } from 'react';

import applyMiddleware from './private/applyMiddleware';

import type { ComponentMiddleware } from './types';
import type { PropsWithChildren } from 'react';

type ProviderContext<Request, Props> = {
  useComponent: (request: Request) => ComponentType<Props> | false | null | undefined;
};

type ProviderProps<Request, Props, Init> = PropsWithChildren<{
  middleware: ComponentMiddleware<Request, Props, Init>[];
}> &
  (Init extends never | undefined ? { init?: Init } : { init: Init });

type ProxyProps<Request, Props> = Request extends never | undefined
  ? Props & { request?: Request }
  : Props & { request: Request };

type Options = {
  /**
   * Allows a middleware to pass another request object when calling its next middleware. Default is disabled.
   *
   * However, middleware could modify the request object before calling its next middleware. It is recommended
   * to use Object.freeze() to prevent middleware from modifying the request object.
   */
  allowModifiedRequest?: boolean;
};

export default function createComponentChainOfResponsibility<
  Request = undefined,
  Props = { children?: never },
  Init = undefined
>(
  options: Options = {}
): {
  Provider: ComponentType<ProviderProps<Request, Props, Init>>;
  Proxy: ComponentType<ProxyProps<Request, Props>>;
  useComponent: () => (request: Request) => ComponentType<Props> | false | null | undefined;
  types: {
    init: Init;
    middleware: ComponentMiddleware<Request, Props, Init>;
    props: Props;
    request: Request;
  };
} {
  const context = createContext<ProviderContext<Request, Props>>({
    get useComponent(): ProviderContext<Request, Props>['useComponent'] {
      throw new Error('useComponent() hook cannot be used outside of its corresponding <Provider>');
    }
  });

  const Provider: ComponentType<ProviderProps<Request, Props, Init>> = ({ children, init, middleware }) => {
    // Probably we need to build the "enforce same request" in the compose.
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
        )(init as Init)(() => null),
      [init, middleware]
    );

    // TODO: Add way to verify that every middleware is returning things correctly.
    const useComponent = useCallback<(request: Request) => ComponentType<Props> | false | null | undefined>(
      (request: Request) => enhancer(request),
      [enhancer]
    );

    const contextValue = useMemo(() => ({ useComponent }), [useComponent]);

    return <context.Provider value={contextValue}>{children}</context.Provider>;
  };

  const useComponent = () => useContext(context).useComponent;

  const Proxy: ComponentType<ProxyProps<Request, Props>> = ({ children, request, ...props }) => {
    let enhancer: ReturnType<typeof useComponent>;

    try {
      enhancer = useComponent();
    } catch {
      throw new Error('<Proxy> cannot be used outside of its corresponding <Provider>');
    }

    const Component = enhancer(request as Request);

    return Component ? <Component {...(props as Props)}>{children}</Component> : null;
  };

  return {
    Provider,
    Proxy,
    useComponent,
    types: {
      init: undefined as unknown as Init,
      middleware: undefined as unknown as ComponentMiddleware<Request, Props, Init>,
      props: undefined as unknown as Props,
      request: undefined as unknown as Request
    }
  };
}
