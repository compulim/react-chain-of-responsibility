import React, {
  createContext,
  isValidElement,
  memo,
  useCallback,
  useContext,
  useMemo,
  type ComponentType,
  type PropsWithChildren
} from 'react';

import isReactComponent from './isReactComponent.ts';
import applyMiddleware, { type Enhancer } from './private/applyMiddleware.ts';
import { type ComponentMiddleware } from './types.ts';

// TODO: Simplify to ComponentType<Props> | undefined.
type ResultComponent<Props> = ComponentType<Props> | false | null | undefined;

type UseBuildComponentCallbackOptions<Props> = {
  fallbackComponent?: ResultComponent<Props> | undefined;
};

interface UseBuildComponentCallback<Request, Props> {
  (request: Request, options?: undefined | UseBuildComponentCallbackOptions<Props>): ComponentType<Props> | undefined;
}

type ProviderContext<Request, Props> = {
  get enhancer(): Enhancer<[Request], ResultComponent<Props>> | undefined;
  useBuildComponentCallback: UseBuildComponentCallback<Request, Props>;
};

type ProviderProps<Request, Props, Init> = PropsWithChildren<{
  middleware: readonly ComponentMiddleware<Request, Props, Init>[];
}> &
  (Init extends never | void
    ? { readonly init?: undefined }
    : Init extends undefined | void
      ? { readonly init?: Init }
      : { readonly init: Init });

type ProxyProps<Request, Props extends object> = Props & {
  readonly fallbackComponent?: ComponentType<Props> | undefined;
} & { readonly request: Request };

type CreateChainOfResponsibilityOptions = {
  /**
   * Allows a middleware to pass another request object when calling its next middleware. Default is false.
   *
   * However, middleware could modify the request object before calling its next middleware. It is recommended
   * to use Object.freeze() to prevent middleware from modifying the request object.
   */
  readonly passModifiedRequest?: boolean | undefined;
};

type AsMiddlewareProps<Request, Props, Init> = {
  readonly init: Init;
  readonly Next: ComponentType<Partial<Props>>;
  readonly request: Request;
};

type AsMiddlewareComponentProps<Request, Props, Init> = Props & {
  readonly middleware: AsMiddlewareProps<Request, Props, Init>;
};

type ChainOfResponsibility<Request, Props extends object, Init> = {
  readonly asMiddleware: (
    middlewareComponent: ComponentType<AsMiddlewareComponentProps<Request, Props, Init>>
  ) => ComponentMiddleware<Request, Props, Init>;
  readonly Provider: ComponentType<ProviderProps<Request, Props, Init>>;
  readonly Proxy: ComponentType<ProxyProps<Request, Props>>;
  readonly types: {
    readonly init: Init;
    readonly middleware: ComponentMiddleware<Request, Props, Init>;
    readonly middlewareComponentProps: AsMiddlewareComponentProps<Request, Props, Init>;
    readonly props: Props;
    readonly proxyProps: ProxyProps<Request, Props>;
    readonly request: Request;
  };
  readonly useBuildComponentCallback: () => UseBuildComponentCallback<Request, Props>;
};

function createChainOfResponsibility<Request = void, Props extends object = { readonly children?: never }, Init = void>(
  options: CreateChainOfResponsibilityOptions = {}
): ChainOfResponsibility<Request, Props, Init> {
  const defaultUseBuildComponentCallback: ProviderContext<Request, Props> = {
    get enhancer() {
      return undefined;
    },
    useBuildComponentCallback(_request, options): ComponentType<Props> {
      if (!options?.fallbackComponent) {
        throw new Error('This component/hook cannot be used outside of its corresponding <Provider>');
      }

      return options.fallbackComponent;
    }
  };

  const context = createContext<ProviderContext<Request, Props>>(defaultUseBuildComponentCallback);

  function ChainOfResponsibilityProvider({ children, init, middleware }: ProviderProps<Request, Props, Init>) {
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

            return (next: (request: Request) => ComponentType<Props> | false | null | undefined) =>
              (originalRequest: Request) => {
                // False positive: although we did not re-assign the variable from true, it was initialized as undefined.
                // eslint-disable-next-line prefer-const
                let hasReturned: boolean;

                const ReturnComponent = enhancer(nextRequest => {
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

                if (isValidElement(ReturnComponent)) {
                  throw new Error('middleware must not return React element directly');
                } else if (
                  ReturnComponent !== false &&
                  ReturnComponent !== null &&
                  typeof ReturnComponent !== 'undefined' &&
                  !isReactComponent(ReturnComponent)
                ) {
                  throw new Error(
                    'middleware must return false, null, undefined, function component, or class component'
                  );
                }

                return ReturnComponent;
              };
          })
        : []
    );

    const { enhancer: parentEnhancer } = useContext(context);

    const enhancer = useMemo(
      () =>
        // We are reversing because it is easier to read:
        // - With reverse, [a, b, c] will become a(b(c(fn)))
        // - Without reverse, [a, b, c] will become c(b(a(fn)))
        applyMiddleware<[Request], ResultComponent<Props>, [Init]>(
          ...[...patchedMiddleware, ...(parentEnhancer ? [() => parentEnhancer] : [])].reverse()
        )(init as Init),
      [init, middleware, parentEnhancer]
    );

    const useBuildComponentCallback = useCallback<UseBuildComponentCallback<Request, Props>>(
      (request, options = {}) => enhancer(() => options.fallbackComponent)(request) || undefined,
      [enhancer]
    );

    const contextValue = useMemo<ProviderContext<Request, Props>>(
      () => ({ enhancer, useBuildComponentCallback }),
      [enhancer, useBuildComponentCallback]
    );

    return <context.Provider value={contextValue}>{children}</context.Provider>;
  }

  const useBuildComponentCallback = () => useContext(context).useBuildComponentCallback;

  function Proxy({ fallbackComponent, request, ...props }: ProxyProps<Request, Props>) {
    const enhancer = useBuildComponentCallback();

    const Component = enhancer(request as Request, { fallbackComponent });

    return Component ? <Component {...(props as Props)} /> : null;
  }

  const asMiddleware: (
    middlewareComponent: ComponentType<AsMiddlewareComponentProps<Request, Props, Init>>
  ) => ComponentMiddleware<Request, Props, Init> =
    (
      MiddlewareComponent: ComponentType<AsMiddlewareComponentProps<Request, Props, Init>>
    ): ComponentMiddleware<Request, Props, Init> =>
    init =>
    next =>
    request => {
      const RawNextComponent = next(request);

      // TODO: Can we pre-build this component during init?
      const MiddlewareOf = (props: Props) => {
        const middleware = useMemo(
          () =>
            Object.freeze({
              init,
              Next: memo<Partial<Props>>(
                RawNextComponent
                  ? (overridingProps: Partial<Props>) => <RawNextComponent {...props} {...overridingProps} />
                  : () => null
              ),
              request
            }),
          []
        );

        return <MiddlewareComponent {...props} middleware={middleware} />;
      };

      MiddlewareOf.displayName = `MiddlewareOf<${MiddlewareComponent.displayName || ''}>`;

      return memo<Props>(MiddlewareOf);
    };

  return Object.freeze({
    asMiddleware,
    Provider: memo<ProviderProps<Request, Props, Init>>(ChainOfResponsibilityProvider),
    Proxy: memo<ProxyProps<Request, Props>>(Proxy),
    types: Object.freeze({
      middlewareComponentProps: undefined as unknown as AsMiddlewareComponentProps<Request, Props, Init>,
      init: undefined as unknown as Init,
      middleware: undefined as unknown as ComponentMiddleware<Request, Props, Init>,
      props: undefined as unknown as Props,
      proxyProps: undefined as unknown as ProxyProps<Request, Props>,
      request: undefined as unknown as Request
    }),
    useBuildComponentCallback
  });
}

export default createChainOfResponsibility;
export {
  type ChainOfResponsibility,
  type CreateChainOfResponsibilityOptions,
  type ProxyProps,
  type UseBuildComponentCallback
};
