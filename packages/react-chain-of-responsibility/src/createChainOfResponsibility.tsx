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

// TODO: Verify all InputProps/OutputProps.
type UseBuildComponentCallbackOptions<OutputProps> = {
  fallbackComponent?: ResultComponent<OutputProps> | undefined;
};

interface UseBuildComponentCallback<Request, InputProps, OutputProps> {
  (
    request: Request,
    options?: undefined | UseBuildComponentCallbackOptions<OutputProps>
  ): ComponentType<InputProps> | undefined;
}

type ProviderContext<Request, InputProps, OutputProps> = {
  get enhancer(): Enhancer<[Request], ResultComponent<OutputProps>> | undefined;
  useBuildComponentCallback: UseBuildComponentCallback<Request, InputProps, OutputProps>;
};

type ProviderProps<Request, OutputProps, Init> = PropsWithChildren<{
  middleware: readonly ComponentMiddleware<Request, OutputProps, Init>[];
}> &
  (Init extends never | void
    ? { readonly init?: undefined }
    : Init extends undefined | void
      ? { readonly init?: Init }
      : { readonly init: Init });

type ProxyProps<Request, InputProps extends object, OutputProps> = InputProps & {
  readonly fallbackComponent?: ComponentType<OutputProps>;
} & (void extends Request ? { readonly request?: Request } : { readonly request: Request });

type CreateChainOfResponsibilityOptions = {
  /**
   * Copy request into `request` prop. Default is false.
   *
   * When enabled, the rendering component will receive a prop named `request` and it contains the request.
   */
  readonly copyRequestToProps?: boolean | undefined;

  /**
   * Allows a middleware to pass another request object when calling its next middleware. Default is false.
   *
   * However, middleware could modify the request object before calling its next middleware. It is recommended
   * to use Object.freeze() to prevent middleware from modifying the request object.
   */
  readonly passModifiedRequest?: boolean | undefined;
};

type AsMiddlewareProps<Request, InputProps, Init> = {
  readonly init: Init;
  readonly Next: ComponentType<Partial<InputProps>>;
  readonly request: Request;
};

type AsMiddlewareComponentProps<Request, InputProps, Init> = InputProps & {
  readonly middleware: AsMiddlewareProps<Request, InputProps, Init>;
};

type ChainOfResponsibility<Request, InputProps extends object, Init, OutputProps extends InputProps> = {
  readonly asMiddleware: (
    middlewareComponent: ComponentType<AsMiddlewareComponentProps<Request, InputProps, Init>>
  ) => ComponentMiddleware<Request, OutputProps, Init>;
  readonly Provider: ComponentType<ProviderProps<Request, OutputProps, Init>>;
  readonly Proxy: ComponentType<ProxyProps<Request, InputProps, OutputProps>>;
  readonly types: {
    readonly init: Init;
    readonly middleware: ComponentMiddleware<Request, OutputProps, Init>;
    readonly middlewareComponentProps: AsMiddlewareComponentProps<Request, InputProps, Init>;
    readonly props: InputProps;
    readonly proxyProps: ProxyProps<Request, InputProps, OutputProps>;
    readonly request: Request;
  };
  readonly useBuildComponentCallback: () => UseBuildComponentCallback<Request, InputProps, OutputProps>;
};

type ConvertToOutputProps<
  Request,
  Props,
  CopyRequestToProps extends boolean | undefined
> = CopyRequestToProps extends true ? Props & { readonly request: Request } : Props;

function createChainOfResponsibility<Request = void, Props extends object = { readonly children?: never }, Init = void>(
  options?: (CreateChainOfResponsibilityOptions & { readonly copyRequestToProps?: false | undefined }) | undefined
): ChainOfResponsibility<Request, Props, Init, ConvertToOutputProps<Request, Props, false>>;

function createChainOfResponsibility<Request = void, Props extends object = { readonly children?: never }, Init = void>(
  options: CreateChainOfResponsibilityOptions & { readonly copyRequestToProps: true }
): ChainOfResponsibility<Request, Props, Init, ConvertToOutputProps<Request, Props, true>>;

function createChainOfResponsibility<Request = void, Props extends object = { readonly children?: never }, Init = void>(
  options: CreateChainOfResponsibilityOptions = {}
): ChainOfResponsibility<
  Request,
  Props,
  Init,
  ConvertToOutputProps<Request, Props, typeof options.copyRequestToProps>
> {
  type OutputProps = ConvertToOutputProps<Request, Props, typeof options.copyRequestToProps>;

  const copyRequestToProps = !!options.copyRequestToProps;

  const defaultUseBuildComponentCallback: ProviderContext<Request, Props, OutputProps> = {
    get enhancer() {
      return undefined;
    },
    useBuildComponentCallback(request, options): ComponentType<Props> {
      if (!options?.fallbackComponent) {
        throw new Error('This component/hook cannot be used outside of its corresponding <Provider>');
      } else if (copyRequestToProps) {
        const FallbackComponent = options.fallbackComponent;

        return memo<Props>((props: Props) => <FallbackComponent {...props} request={request} />);
      }

      return options.fallbackComponent;
    }
  };

  const context = createContext<ProviderContext<Request, Props, OutputProps>>(defaultUseBuildComponentCallback);

  function ChainOfResponsibilityProvider({ children, init, middleware }: ProviderProps<Request, OutputProps, Init>) {
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

                if (ReturnComponent && options.copyRequestToProps) {
                  return memo<Props & { readonly request: Request }>((props: Props) => (
                    <ReturnComponent {...props} request={originalRequest} />
                  )) as any; // Need "as any" because TypeScript think we need to return ComponentType<Props>.
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

    const useBuildComponentCallback = useCallback<UseBuildComponentCallback<Request, Props, OutputProps>>(
      (request, options = {}) => enhancer(() => options.fallbackComponent)(request) || undefined,
      [enhancer]
    );

    const contextValue = useMemo<ProviderContext<Request, Props, OutputProps>>(
      () => ({ enhancer, useBuildComponentCallback }),
      [enhancer, useBuildComponentCallback]
    );

    return <context.Provider value={contextValue}>{children}</context.Provider>;
  }

  const useBuildComponentCallback = () => useContext(context).useBuildComponentCallback;

  function Proxy({ fallbackComponent, request, ...props }: ProxyProps<Request, Props, OutputProps>) {
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
    Provider: memo<ProviderProps<Request, OutputProps, Init>>(ChainOfResponsibilityProvider),
    Proxy: memo<ProxyProps<Request, Props, OutputProps>>(Proxy),
    types: Object.freeze({
      middlewareComponentProps: undefined as unknown as AsMiddlewareComponentProps<Request, Props, Init>,
      init: undefined as unknown as Init,
      middleware: undefined as unknown as ComponentMiddleware<Request, Props, Init>,
      props: undefined as unknown as Props,
      proxyProps: undefined as unknown as ProxyProps<Request, Props, OutputProps>,
      request: undefined as unknown as Request
    }),
    useBuildComponentCallback
  });
}

export default createChainOfResponsibility;
export { type CreateChainOfResponsibilityOptions };
