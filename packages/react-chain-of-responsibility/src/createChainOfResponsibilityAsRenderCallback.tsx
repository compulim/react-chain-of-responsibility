import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useMemo,
  type ComponentType,
  type PropsWithChildren,
  type ReactNode
} from 'react';
import { custom, function_, object, parse, safeParse } from 'valibot';

import applyMiddleware from './private/applyMiddleware.ts';
import arePropsEqual from './private/arePropsEqual.ts';
import useMemoValueWithEquality from './private/useMemoValueWithEquality.ts';

type BaseProps = object;

type RenderCallback<Props extends BaseProps> = (props: Props) => ReactNode;

const INTERNAL_SYMBOL_TO_ENFORCE_FORWARD_COMPATIBILITY = Symbol();

const functorReturnValueSchema = custom<FunctorReturnValue<any>>(
  value =>
    safeParse(object({ render: function_() }), value).success &&
    !!value &&
    typeof value === 'object' &&
    INTERNAL_SYMBOL_TO_ENFORCE_FORWARD_COMPATIBILITY in value
);

interface FunctorReturnValue<Props extends BaseProps> {
  readonly [INTERNAL_SYMBOL_TO_ENFORCE_FORWARD_COMPATIBILITY]: undefined;
  readonly render: (overridingProps?: Partial<Props> | undefined) => ReactNode;
}

type ComponentEnhancer<Request, Props extends BaseProps> = (
  next: (request: Request) => FunctorReturnValue<Props> | undefined
) => (request: Request) => FunctorReturnValue<Props> | undefined;

type ComponentMiddleware<Request, Props extends BaseProps, Init = undefined> = (
  init: Init
) => ComponentEnhancer<Request, Props>;

type UseBuildRenderCallbackOptions<Props> = {
  fallbackComponent?: ComponentType<Props> | undefined;
};

interface UseBuildRenderCallback<Request, Props extends BaseProps> {
  (request: Request, options?: undefined | UseBuildRenderCallbackOptions<Props>): RenderCallback<Props> | undefined;
}

type ProviderContext<Request, Props extends BaseProps> = {
  get enhancer(): ComponentEnhancer<Request, Props> | undefined;
  useBuildRenderCallback: UseBuildRenderCallback<Request, Props>;
};

type ProviderProps<Request, Props extends BaseProps, Init> = PropsWithChildren<{
  middleware: readonly ComponentMiddleware<Request, Props, Init>[];
}> &
  (Init extends never | void
    ? { readonly init?: undefined }
    : Init extends undefined | void
      ? { readonly init?: Init }
      : { readonly init: Init });

type ProxyProps<Request, Props extends BaseProps> = Props & {
  readonly fallbackComponent?: ComponentType<Props> | undefined;
  readonly request: Request;
};

type CreateChainOfResponsibilityOptions = {
  /**
   * Allows a middleware to pass another request object when calling its next middleware. Default is false.
   *
   * However, middleware could modify the request object before calling its next middleware. It is recommended
   * to use Object.freeze() to prevent middleware from modifying the request object.
   */
  // If not enabled, web devs can pass void. If it's not void, give warnings.
  readonly passModifiedRequest?: boolean | undefined;

  // TODO: Add support.
  // If not enabled, web devs can pass void. If it's not void, give warnings.
  readonly allowOverrideProps?: boolean | undefined;
};

type ChainOfResponsibility<Request, Props extends object, Init> = {
  readonly Provider: ComponentType<ProviderProps<Request, Props, Init>>;
  readonly Proxy: ComponentType<ProxyProps<Request, Props>>;
  readonly reactComponent: <P extends Props>(
    component: ComponentType<P>,
    bindProps?:
      | (Partial<Props> & Omit<P, keyof Props>)
      | ((props: Props) => Partial<Props> & Omit<P, keyof Props>)
      | undefined
  ) => FunctorReturnValue<Props>;
  readonly types: {
    readonly component: ComponentType<Props>;
    readonly init: Init;
    readonly middleware: ComponentMiddleware<Request, Props, Init>;
    readonly props: Props;
    readonly proxyProps: ProxyProps<Request, Props>;
    readonly request: Request;
  };
  readonly useBuildRenderCallback: () => UseBuildRenderCallback<Request, Props>;
  readonly useRequest: () => readonly [Request];
};

function createChainOfResponsibility<
  Request = void,
  Props extends BaseProps = { readonly children?: never },
  Init = void
>(options: CreateChainOfResponsibilityOptions = {}): ChainOfResponsibility<Request, Props, Init> {
  const defaultUseBuildComponentCallback: ProviderContext<Request, Props> = {
    get enhancer() {
      return undefined;
    },
    useBuildRenderCallback(_request, options): RenderCallback<Props> {
      const FallbackComponent = options?.fallbackComponent;

      if (FallbackComponent) {
        return props => <FallbackComponent {...props} />;
      }

      // TODO: Should we built in a red box?
      return () => undefined;
    }
  };

  const context = createContext<ProviderContext<Request, Props>>(defaultUseBuildComponentCallback);

  type BuildRenderCallbackContextType = {
    readonly optionsState: readonly [CreateChainOfResponsibilityOptions];
    readonly props: Props;
    readonly requestState: readonly [Request];
  };

  const BuildRenderCallbackContext = createContext<BuildRenderCallbackContextType>(
    new Proxy({} as any, {
      get() {
        throw new Error('This hook cannot be used outside of <Proxy> and useBuildRenderCallback');
      }
    })
  );

  const useRequest = () => useContext(BuildRenderCallbackContext).requestState;

  function ChainOfResponsibilityProvider({ children, init, middleware }: ProviderProps<Request, Props, Init>) {
    // TODO: Related to https://github.com/microsoft/TypeScript/issues/17002.
    //       typescript@5.2.2 has a bug, Array.isArray() is a type predicate but only works with mutable array, not readonly array.
    //       After removing "as unknown", `middleware` on the next line become `any[]`.
    if (!Array.isArray(middleware as unknown) || middleware.some(middleware => typeof middleware !== 'function')) {
      throw new Error('middleware prop must be an array of functions');
    }

    // Remap the middleware, so all inputs/outputs are validated.
    const fortifiedMiddleware: readonly ComponentMiddleware<Request, Props, Init>[] = Object.freeze(
      middleware
        ? middleware.map(fn => (init: Init) => {
            const enhancer = fn(init);

            return (next: (request: Request) => FunctorReturnValue<Props> | undefined) =>
              (originalRequest: Request) => {
                // False positive: although we did not re-assign the variable from true, it was initialized as undefined.
                // eslint-disable-next-line prefer-const
                let hasReturned: boolean;

                const returnValue = enhancer((nextRequest: Request) => {
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

                // Make sure the return value is built using our helper function for forward-compatibility reason.
                return returnValue && parse(functorReturnValueSchema, returnValue);
              };
          })
        : []
    );

    const { enhancer: parentEnhancer } = useContext(context);

    const enhancer = useMemo<ComponentEnhancer<Request, Props>>(
      () =>
        // We are reversing because it is easier to read:
        // - With reverse, [a, b, c] will become a(b(c(fn)))
        // - Without reverse, [a, b, c] will become c(b(a(fn)))
        applyMiddleware<[Request], FunctorReturnValue<Props> | undefined, [Init]>(
          ...[...fortifiedMiddleware, ...(parentEnhancer ? [() => parentEnhancer] : [])].reverse()
        )(init as Init),
      [init, middleware, parentEnhancer]
    );

    const useBuildRenderCallback = useCallback<UseBuildRenderCallback<Request, Props>>(
      (request, buildOptions = {}) => {
        const result =
          // Put the "fallbackComponent" as the last one in the chain.
          enhancer(() => {
            const Component = buildOptions.fallbackComponent;

            if (!Component) {
              return;
            }

            // TODO: Can we simplify this?
            const render = (overridingProps?: Partial<Props> | undefined) => (
              <RenderComponent bindProps={undefined} component={Component} overridingProps={overridingProps} />
            );

            return Object.freeze({
              // Mark fallback render callback as functor return value.
              [INTERNAL_SYMBOL_TO_ENFORCE_FORWARD_COMPATIBILITY]: undefined,
              render
            });
          })(request);

        return (
          result &&
          ((props: Props) => {
            const memoizedProps = useMemoValueWithEquality<Props>(() => props, arePropsEqual);

            const context = useMemo<BuildRenderCallbackContextType>(
              () =>
                Object.freeze({
                  optionsState: Object.freeze([options] as const),
                  props: memoizedProps,
                  requestState: Object.freeze([request] as const)
                }),
              [memoizedProps, request]
            );

            return (
              <BuildRenderCallbackContext.Provider value={context}>
                {result.render()}
              </BuildRenderCallbackContext.Provider>
            );
          })
        );
      },
      [enhancer]
    );

    const contextValue = useMemo<ProviderContext<Request, Props>>(
      () => ({ enhancer, useBuildRenderCallback }),
      [enhancer, useBuildRenderCallback]
    );

    return <context.Provider value={contextValue}>{children}</context.Provider>;
  }

  function reactComponent<P extends Props>(
    component: ComponentType<P>,
    bindProps?:
      | (Partial<Props> & Omit<P, keyof Props>)
      | ((props: Props) => Partial<Props> & Omit<P, keyof Props>)
      | undefined
  ): FunctorReturnValue<Props> {
    return Object.freeze({
      render: (overridingProps?: Partial<Props> | undefined) => (
        <RenderComponent
          bindProps={bindProps}
          component={component as ComponentType<Props>}
          overridingProps={overridingProps}
        />
      ),
      [INTERNAL_SYMBOL_TO_ENFORCE_FORWARD_COMPATIBILITY]: undefined
    });
  }

  const RenderComponent = memo(function RenderComponent({
    bindProps,
    component: Component,
    overridingProps
  }: {
    bindProps: Partial<Props> | ((props: Props) => Partial<Props>) | undefined;
    component: ComponentType<Props>;
    overridingProps: Partial<Props> | undefined;
  }) {
    const {
      props: renderCallbackProps,
      optionsState: [{ allowOverrideProps }]
    } = useContext(BuildRenderCallbackContext);

    if (overridingProps && !arePropsEqual(overridingProps, renderCallbackProps) && !allowOverrideProps) {
      console.warn('react-chain-of-responsibility: "allowOverrideProps" must be set to override props');
    }

    const props = allowOverrideProps
      ? Object.freeze({ ...renderCallbackProps, ...overridingProps })
      : Object.freeze({ ...renderCallbackProps });

    return <Component {...props} {...(typeof bindProps === 'function' ? bindProps?.(props) : bindProps)} />;
  });

  const useBuildRenderCallback = () => useContext(context).useBuildRenderCallback;

  function MiddlewareProxy({ fallbackComponent, request, ...props }: ProxyProps<Request, Props>) {
    return useBuildRenderCallback()(request as Request, { fallbackComponent })?.(props as Props);
  }

  return Object.freeze({
    Provider: memo<ProviderProps<Request, Props, Init>>(ChainOfResponsibilityProvider),
    Proxy: memo<ProxyProps<Request, Props>>(MiddlewareProxy),
    reactComponent,
    // TODO: Should it be `types: undefined as any`?
    types: Object.freeze({
      component: undefined as unknown as ComponentType<Props>,
      init: undefined as unknown as Init,
      middleware: undefined as unknown as ComponentMiddleware<Request, Props, Init>,
      props: undefined as unknown as Props,
      proxyProps: undefined as unknown as ProxyProps<Request, Props>,
      request: undefined as unknown as Request
    }),
    useBuildRenderCallback,
    useRequest
  });
}

export default createChainOfResponsibility;
export {
  type ChainOfResponsibility,
  type CreateChainOfResponsibilityOptions,
  type ProxyProps,
  type UseBuildRenderCallback
};

/*

### Why we are changing the signature?

Component is great until we need to "bind props" (pass a fixed set of props to a component.) Output must be destabilize to enable "bind props." This hurts performance.

Render function is great until we need to call hooks inside the render function. Middleware can conditionally call render function and it would break hooks.

If we wrap component into render function, we can enable hooks while keeping the output stable. Thus, render function is a better solution and we are changing the signature to use render function.

### Why enhancer() need to return a component but not render function?

Render function call be executed at random order, thus, hooks are not supported. Web devs could be mistaken that they can call hooks inside the render function.

### Why I must use `reactComponent()` but not returning render function?

`reactComponent()` is designed for smoother forward compatibility. In case we are required to change some infrastructure work in the future, we can tweak `reactComponent()` to make your code today to work with tomorrow's infrastructure.

`reactComponent()` allows web devs to pass props to the component without breaking stability of the returned render function.

Rendering stability is guaranteed as long as both component type and props are not changed. Changing request will not trigger re-rendering as long as the request is not hoisted to props, which would change the props.

### Why next() is returning a render function?

We want to allow middleware devs to pass props to their component with stable output.

Without render function, we will need to create a new component with specific props (a.k.a. bind props). This is similar to `Function.prototype.bind` which always return a new instance. Every props change will be bound to a new instance of the component. And React will always re-render and the output will become unstable.

*/
