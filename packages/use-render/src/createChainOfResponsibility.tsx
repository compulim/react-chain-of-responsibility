import React, { ComponentType, createContext, isValidElement, useCallback, useContext, useMemo } from 'react';

import applyMiddleware from './private/applyMiddleware';

import type { ComponentMiddleware } from './types';
import type { PropsWithChildren } from 'react';

type UseComponentOptions<Props> = { defaultComponent?: ComponentType<Props> | false | null | undefined };

type UseComponent<Request, Props> = (
  request: Request,
  options?: UseComponentOptions<Props>
) => ComponentType<Props> | false | null | undefined;

type ProviderContext<Request, Props> = {
  useComponent: UseComponent<Request, Props>;
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

export default function createChainOfResponsibility<
  Request = undefined,
  Props = { children?: never },
  Init = undefined
>(
  options: Options = {}
): {
  Provider: ComponentType<ProviderProps<Request, Props, Init>>;
  Proxy: ComponentType<ProxyProps<Request, Props>>;
  useComponent: () => UseComponent<Request, Props>;
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
    // TODO: Test if "middleware" prop is not an array.
    // TODO: Test if we can hide rows through middleware and build a row counter.

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

    const useComponent = useCallback<UseComponent<Request, Props>>(
      (request, options = {}) => enhancer(() => options.defaultComponent)(request),
      [enhancer]
    );

    const contextValue = useMemo<ProviderContext<Request, Props>>(() => ({ useComponent }), [useComponent]);

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
