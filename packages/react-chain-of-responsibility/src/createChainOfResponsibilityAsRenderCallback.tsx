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
import { custom, parse } from 'valibot';

import applyMiddleware from './private/applyMiddleware.ts';
import arePropsEqual from './private/arePropsEqual.ts';
import useMemoValueWithEquality from './private/useMemoValueWithEquality.ts';

type BaseProps = object;

type RenderCallback<Props extends BaseProps> = (props: Props) => ReactNode;
type RenderCallbackWithOptionalProps<Props extends BaseProps> = (
  overridingProps?: Partial<Props> | undefined
) => ReactNode;

const INTERNAL_SYMBOL = Symbol();

const functorReturnValueSchema = custom<FunctorReturnValue<any>>(
  value => typeof value === 'function' && INTERNAL_SYMBOL in value
);

interface FunctorReturnValue<Props extends BaseProps> {
  [INTERNAL_SYMBOL]: undefined;
  (overridingProps?: Partial<Props> | undefined): ReactNode;
}

type ComponentEnhancer<Request, Props extends BaseProps> = (
  next: (request: Request) => RenderCallbackWithOptionalProps<Props> | undefined
) => (request: Request) => FunctorReturnValue<Props> | undefined;

type ComponentMiddleware<Request, Props extends BaseProps, Init = undefined> = (
  init: Init
) => ComponentEnhancer<Request, Props>;

type SymmetricComponentEnhancer<Request, Props extends BaseProps> = (
  next: (request: Request) => RenderCallbackWithOptionalProps<Props> | undefined
) => (request: Request) => RenderCallbackWithOptionalProps<Props> | undefined;

type SymmetricComponentMiddleware<Request, Props extends BaseProps, Init = undefined> = (
  init: Init
) => SymmetricComponentEnhancer<Request, Props>;

type UseBuildRenderCallbackOptions<Props> = {
  fallbackComponent?: ComponentType<Props> | undefined;
};

interface UseBuildRenderCallback<Request, Props extends BaseProps> {
  (request: Request, options?: undefined | UseBuildRenderCallbackOptions<Props>): RenderCallback<Props> | undefined;
}

type ProviderContext<Request, Props extends BaseProps> = {
  get enhancer(): SymmetricComponentEnhancer<Request, Props> | undefined;
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
  readonly passModifiedRequest?: boolean | undefined;

  // TODO: Support this.
  // readonly passModifiedProps?: boolean | undefined;
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
    // bindProps?: (P) | undefined
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
};

function createChainOfResponsibility<
  Request = void,
  Props extends BaseProps = { readonly children?: never },
  Init = void
>(options: CreateChainOfResponsibilityOptions = {}): ChainOfResponsibility<Request, Props, Init> {
  const defaultUseBuildComponentCallback: ProviderContext<Request, Props> = {
    get enhancer() {
      return undefined;
      // return () => () => () => undefined;
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

  const BuildRenderCallbackContext = createContext<{ props: Props }>({} as any);

  const useRenderCallbackProps = () => useContext(BuildRenderCallbackContext).props;

  function ChainOfResponsibilityProvider({ children, init, middleware }: ProviderProps<Request, Props, Init>) {
    // TODO: Related to https://github.com/microsoft/TypeScript/issues/17002.
    //       typescript@5.2.2 has a bug, Array.isArray() is a type predicate but only works with mutable array, not readonly array.
    //       After removing "as unknown", `middleware` on the next line become `any[]`.
    if (!Array.isArray(middleware as unknown) || middleware.some(middleware => typeof middleware !== 'function')) {
      throw new Error('middleware prop must be an array of functions');
    }

    // Remap the middleware, so all inputs/outputs are validated.
    const fortifiedMiddleware: readonly SymmetricComponentMiddleware<Request, Props, Init>[] = Object.freeze(
      middleware
        ? middleware.map(fn => (init: Init) => {
            const enhancer = fn(init);

            return (next: (request: Request) => RenderCallbackWithOptionalProps<Props> | undefined) =>
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

                // const result = parse(
                //   custom<ComponentEnhancerReturnValue<Props>>(
                //     value => safeParse(componentEnhancerReturnValueSchema(), value).success
                //   ),
                //   returnValue
                // );

                return returnValue && parse(functorReturnValueSchema, returnValue);

                // // TODO: Add "passModifiedProps".
                // return (overridingProps?: Partial<Props> | undefined) => {
                //   const [Component, bindProps] = result;

                //   return (
                //     <RenderComponent bindProps={bindProps} component={Component} overridingProps={overridingProps} />
                //   );
                // };
              };
          })
        : []
    );

    const { enhancer: parentEnhancer } = useContext(context);

    const enhancer = useMemo<SymmetricComponentEnhancer<Request, Props>>(() => {
      // We are reversing because it is easier to read:
      // - With reverse, [a, b, c] will become a(b(c(fn)))
      // - Without reverse, [a, b, c] will become c(b(a(fn)))
      return applyMiddleware<[Request], RenderCallbackWithOptionalProps<Props> | undefined, [Init]>(
        ...[...fortifiedMiddleware, ...(parentEnhancer ? [() => parentEnhancer] : [])].reverse()
      )(init as Init);
    }, [init, middleware, parentEnhancer]);

    const useBuildRenderCallback = useCallback<UseBuildRenderCallback<Request, Props>>(
      (request, options = {}) => {
        const result =
          // Put the "fallbackComponent" as the last one in the chain.
          enhancer(() => {
            const Component = options.fallbackComponent;

            if (!Component) {
              return;
            }

            return (overridingProps?: Partial<Props> | undefined) => (
              <RenderComponent bindProps={undefined} component={Component} overridingProps={overridingProps} />
            );
          })(request);

        return (
          result &&
          ((props: Props) => {
            const memoizedProps = useMemoValueWithEquality<Props>(() => props, arePropsEqual);

            const context = useMemo<{ props: Props }>(() => ({ props: memoizedProps }), [memoizedProps]);

            return (
              <BuildRenderCallbackContext.Provider value={context}>{result()}</BuildRenderCallbackContext.Provider>
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
    bindProps?: (Partial<Props> & P) | ((props: Props) => Partial<Props> & P) | undefined
  ): FunctorReturnValue<Props> {
    const result = (overridingProps?: Partial<Props> | undefined) => {
      return (
        <RenderComponent
          bindProps={bindProps}
          component={component as ComponentType<Props>}
          overridingProps={overridingProps}
        />
      );
    };

    result[INTERNAL_SYMBOL] = undefined;

    return result;
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
    const props = { ...useRenderCallbackProps(), ...overridingProps };

    return <Component {...props} {...(typeof bindProps === 'function' ? bindProps?.(props) : bindProps)} />;
  });

  const useBuildRenderCallback = () => useContext(context).useBuildRenderCallback;

  function Proxy({ fallbackComponent, request, ...props }: ProxyProps<Request, Props>) {
    return useBuildRenderCallback()(request as Request, { fallbackComponent })?.(props as Props);
  }

  return Object.freeze({
    Provider: memo<ProviderProps<Request, Props, Init>>(ChainOfResponsibilityProvider),
    Proxy: memo<ProxyProps<Request, Props>>(Proxy),
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
    useBuildRenderCallback
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

### Why enhancer() need to return a component but not render function?

If web developers return a render function, they could mistaken they can call hooks inside the render function.

Hooks are not supported in render function, they can be executed in random order.

### Why next() is returning a render function?

We want "bind props" for stable output.

*/
