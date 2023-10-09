import PropTypes from 'prop-types';
import {
  type ComponentType,
  createContext,
  isValidElement,
  memo,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo
} from 'react';

import { type ComponentMiddleware } from './types';
import applyMiddleware from './private/applyMiddleware';
import isReactComponent from './isReactComponent';

type UseBuildComponentCallbackOptions<Props> = { fallbackComponent?: ComponentType<Props> | false | null | undefined };

type UseBuildComponentCallback<Request, Props> = (
  request: Request,
  options?: UseBuildComponentCallbackOptions<Props>
) => ComponentType<Props> | false | null | undefined;

type ProviderContext<Request, Props> = {
  useBuildComponentCallback: UseBuildComponentCallback<Request, Props>;
};

type ProviderProps<Request, Props, Init> = PropsWithChildren<{
  middleware: readonly ComponentMiddleware<Request, Props, Init>[];
}> &
  (Init extends never | undefined ? { init?: Init } : { init: Init });

type ProxyProps<Request, Props> = PropsWithChildren<
  Request extends never | undefined
    ? Props & { fallbackComponent?: ComponentType<Props>; request?: Request }
    : Props & { fallbackComponent?: ComponentType<Props>; request: Request }
>;

type Options = {
  /**
   * Allows a middleware to pass another request object when calling its next middleware. Default is false.
   *
   * However, middleware could modify the request object before calling its next middleware. It is recommended
   * to use Object.freeze() to prevent middleware from modifying the request object.
   */
  passModifiedRequest?: boolean;
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
    // TODO: Related to https://github.com/microsoft/TypeScript/issues/17002.
    //       typescript@5.2.2 has a bug, Array.isArray() is a type predicate but only works with mutable array, not readonly array.
    //       After removing "as unknown", `middleware` on the next line become `any[]`.
    if (!Array.isArray(middleware as unknown) || middleware.some(middleware => typeof middleware !== 'function')) {
      throw new Error('middleware prop must be an array of functions');
    }

    const patchedMiddleware: readonly ComponentMiddleware<Request, Props, Init>[] = Object.freeze(
      middleware
        ? middleware.map(fn => (init: Init) => {
            const enhancer = fn(init);

            return (next: UseBuildComponentCallback<Request, Props>) => (originalRequest: Request) => {
              // False positive: although we did not re-assign the variable from true, it was initialized as undefined.
              // eslint-disable-next-line prefer-const
              let hasReturned: boolean;

              const returnValue = enhancer(nextRequest => {
                if (hasReturned) {
                  throw new Error('next() cannot be called after the function had returned synchronously');
                }

                !options.passModifiedRequest &&
                  nextRequest !== originalRequest &&
                  console.warn(
                    'react-chain-of-responsibility: "options.passModifiedRequest" must be set to true to pass a different request object to next().'
                  );

                return next(options.passModifiedRequest ? nextRequest : originalRequest);
              })(originalRequest);

              hasReturned = true;

              if (isValidElement(returnValue)) {
                throw new Error('middleware must not return React element directly');
              } else if (
                returnValue !== false &&
                returnValue !== null &&
                typeof returnValue !== 'undefined' &&
                !isReactComponent(returnValue)
              ) {
                throw new Error(
                  'middleware must return false, null, undefined, function component, or class component'
                );
              }

              return returnValue;
            };
          })
        : []
    );

    const enhancer = useMemo(
      () =>
        // We are reversing because it is easier to read:
        // - With reverse, [a, b, c] will become a(b(c(fn)))
        // - Without reverse, [a, b, c] will become c(b(a(fn)))
        applyMiddleware<[Request], ComponentType<Props> | false | null | undefined, [Init]>(
          ...[...patchedMiddleware].reverse()
        )(init as Init),
      [init, middleware]
    );

    const useBuildComponentCallback = useCallback<UseBuildComponentCallback<Request, Props>>(
      (request, options = {}) => enhancer(() => options.fallbackComponent)(request),
      [enhancer]
    );

    const contextValue = useMemo<ProviderContext<Request, Props>>(
      () => ({ useBuildComponentCallback }),
      [useBuildComponentCallback]
    );

    return <context.Provider value={contextValue}>{children}</context.Provider>;
  };

  Provider.defaultProps = {};
  Provider.displayName = 'ChainOfResponsibilityProvider';
  Provider.propTypes = {
    children: PropTypes.any,
    init: PropTypes.any,
    middleware: PropTypes.any
  };

  const useBuildComponentCallback = () => useContext(context).useBuildComponentCallback;

  const Proxy: ComponentType<ProxyProps<Request, Props>> = memo(
    // False positive: "children" is not a prop.
    // eslint-disable-next-line react/prop-types
    ({ children, fallbackComponent, request, ...props }) => {
      let enhancer: ReturnType<typeof useBuildComponentCallback>;

      try {
        enhancer = useBuildComponentCallback();
      } catch {
        throw new Error('<Proxy> cannot be used outside of its corresponding <Provider>');
      }

      const Component = enhancer(request as Request, { fallbackComponent });

      return Component ? <Component {...(props as Props)}>{children}</Component> : null;
    }
  );

  Proxy.defaultProps = {};
  Proxy.displayName = 'Proxy';
  Proxy.propTypes = {
    fallbackComponent: PropTypes.any,
    request: PropTypes.any
  };

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
