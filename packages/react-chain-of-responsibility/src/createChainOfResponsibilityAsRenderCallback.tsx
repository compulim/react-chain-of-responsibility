import React, {
  createContext,
  Fragment,
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

// TODO: Related to https://github.com/microsoft/TypeScript/issues/17002.
//       typescript@5.2.2 has a bug, Array.isArray() is a type predicate but only works with mutable array, not readonly array.
declare global {
  interface ArrayConstructor {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isArray(arg: any): arg is readonly any[];
  }
}

type BaseProps = object;

type RenderCallback<Props extends BaseProps> = (props: Props) => ReactNode;

type CreateChainOfResponsibilityOptions = {
  /**
   * Allows one component to pass different set of props to its downstream component. Default is false.
   *
   * It is recommended to keep this settings as default to prevent newly added component from unexpectedly changing behavior of downstream components.
   */
  readonly allowOverrideProps?: boolean | undefined;

  /**
   * Allows a middleware to pass another request object when calling its next middleware. Default is false.
   *
   * It is recommended to keep this settings as default ot prevent newly added middleware from unexpectedly changing behavior of downstream middleware.
   *
   * To prevent upstream middleware from modifying the request, the request object should be set to be immutable through `Object.freeze`.
   */
  readonly passModifiedRequest?: boolean | undefined;
};

type ChainOfResponsibility<Request, Props extends BaseProps, Init> = {
  readonly Provider: ComponentType<ProviderProps<Request, Props, Init>> & InferenceHelper<Request, Props, Init>;
  readonly Proxy: ComponentType<ProxyProps<Request, Props>>;
  readonly reactComponent: <P extends Props>(
    component: ComponentType<P>,
    bindProps?:
      | (Partial<Props> & Omit<P, keyof Props>)
      | ((props: Props) => Partial<Props> & Omit<P, keyof Props>)
      | undefined
  ) => ComponentFunctorReturnValue<Props>;
  readonly useBuildRenderCallback: () => UseBuildRenderCallback<Request, Props>;
};

const DO_NOT_CREATE_THIS_OBJECT_YOURSELF = Symbol();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const componentFunctorReturnValueSchema = custom<ComponentFunctorReturnValue<any>>(
  value =>
    safeParse(object({ render: function_() }), value).success &&
    !!value &&
    typeof value === 'object' &&
    DO_NOT_CREATE_THIS_OBJECT_YOURSELF in value,
  'react-chain-of-responsibility: middleware must return value constructed by reactComponent()'
);

interface ComponentFunctorReturnValue<Props extends BaseProps> {
  readonly [DO_NOT_CREATE_THIS_OBJECT_YOURSELF]: undefined;
  readonly render: (overridingProps?: Partial<Props> | undefined) => ReactNode;
}

type ComponentFunctor<Request, Props extends BaseProps> = (
  request: Request
) => ComponentFunctorReturnValue<Props> | undefined;

type ComponentEnhancer<Request, Props extends BaseProps> = (
  next: ComponentFunctor<Request, Props>
) => ComponentFunctor<Request, Props>;

type ComponentMiddleware<Request, Props extends BaseProps, Init = undefined> = (
  init: Init
) => ComponentEnhancer<Request, Props>;

type UseBuildRenderCallbackOptions<Props> = {
  readonly fallbackComponent?: ComponentType<Props> | undefined;
};

interface UseBuildRenderCallback<Request, Props extends BaseProps> {
  (request: Request, options?: undefined | UseBuildRenderCallbackOptions<Props>): RenderCallback<Props> | undefined;
}

type BuildContextType<Request, Props extends BaseProps> = {
  readonly enhancer: ComponentEnhancer<Request, Props>;
};

type RenderContextType<Props> = {
  readonly options: CreateChainOfResponsibilityOptions;
  readonly renderCallbackProps: Props;
};

type ProviderProps<Request, Props extends BaseProps, Init> = PropsWithChildren<{
  readonly middleware: readonly ComponentMiddleware<Request, Props, Init>[];
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

type InferenceHelper<Request, Props extends BaseProps, Init> = {
  readonly '~types': {
    readonly component: ComponentType<Props>;
    readonly init: Init;
    readonly middleware: ComponentMiddleware<Request, Props, Init>;
    readonly props: Props;
    readonly proxyProps: ProxyProps<Request, Props>;
    readonly request: Request;
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InferComponent<T extends InferenceHelper<any, any, any>> = T['~types']['component'];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InferInit<T extends InferenceHelper<any, any, any>> = T['~types']['init'];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InferMiddleware<T extends InferenceHelper<any, any, any>> = T['~types']['middleware'];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InferProps<T extends InferenceHelper<any, any, any>> = T['~types']['props'];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InferProxyProps<T extends InferenceHelper<any, any, any>> = T['~types']['proxyProps'];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InferRequest<T extends InferenceHelper<any, any, any>> = T['~types']['request'];

function createChainOfResponsibility<
  Request = void,
  Props extends BaseProps = { readonly children?: never },
  Init = void
>(options: CreateChainOfResponsibilityOptions = {}): ChainOfResponsibility<Request, Props, Init> {
  const BuildContext = createContext<BuildContextType<Request, Props>>(
    Object.freeze({ enhancer: next => request => next(request) })
  );

  const RenderContext = createContext<RenderContextType<Props>>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new Proxy({} as any, {
      get() {
        // The following is assertion, there is no way to hit this line.
        /* istanbul ignore next */
        throw new Error(
          'react-chain-of-responsibility: this hook cannot be used outside of <Proxy> and useBuildRenderCallback()'
        );
      }
    })
  );

  function reactComponent<P extends Props>(
    component: ComponentType<P>,
    bindProps?:
      | (Partial<Props> & Omit<P, keyof Props>)
      | ((props: Props) => Partial<Props> & Omit<P, keyof Props>)
      | undefined
  ): ComponentFunctorReturnValue<Props> {
    return Object.freeze({
      [DO_NOT_CREATE_THIS_OBJECT_YOURSELF]: undefined,
      render: (overridingProps?: Partial<Props> | undefined) => (
        <ComponentWithProps
          bindProps={bindProps}
          component={component as ComponentType<Props>}
          overridingProps={overridingProps}
        />
      )
    });
  }

  const ComponentWithProps = memo(function ComponentWithProps({
    bindProps,
    component: Component,
    overridingProps
  }: {
    readonly bindProps?: Partial<Props> | ((props: Props) => Partial<Props>) | undefined;
    readonly component: ComponentType<Props>;
    readonly overridingProps?: Partial<Props> | undefined;
  }) {
    const {
      options: { allowOverrideProps },
      renderCallbackProps
    } = useContext(RenderContext);

    if (overridingProps && !arePropsEqual(overridingProps, renderCallbackProps) && !allowOverrideProps) {
      console.warn('react-chain-of-responsibility: "allowOverrideProps" must be set to true to override props');
    }

    const props = Object.freeze(
      allowOverrideProps ? { ...renderCallbackProps, ...overridingProps } : { ...renderCallbackProps }
    );

    return <Component {...props} {...(typeof bindProps === 'function' ? bindProps?.(props) : bindProps)} />;
  });

  const useBuildRenderCallback: () => UseBuildRenderCallback<Request, Props> = () => {
    const { enhancer } = useContext(BuildContext);

    return useCallback(
      (request, buildOptions = {}) => {
        const result =
          // Put the "fallbackComponent" as the last one in the chain.
          enhancer(() => {
            const FallbackComponent = buildOptions.fallbackComponent;

            if (!FallbackComponent) {
              console.warn(
                'react-chain-of-responsibility: the request has fall through all middleware, set "fallbackComponent" as a catchall',
                request
              );

              // For clarity, we are returning `undefined` instead of `() => undefined`.
              return;
            }

            return Object.freeze({
              // Mark fallback render callback as functor return value.
              [DO_NOT_CREATE_THIS_OBJECT_YOURSELF]: undefined,
              render: () => (
                // Currently, there are no ways to set `bindProps` to `fallbackComponent`.
                // `fallbackComponent` do not need `overridingProps` because it is the last one in the chain, it would not have the next() function.
                <ComponentWithProps component={FallbackComponent} />
              )
            });
          })(request);

        return (
          result &&
          ((props: Props) => {
            const renderCallbackProps = useMemoValueWithEquality<Props>(() => props, arePropsEqual);

            const context = useMemo<RenderContextType<Props>>(
              () =>
                Object.freeze({
                  options: Object.freeze({ ...options }),
                  renderCallbackProps
                }),
              [renderCallbackProps]
            );

            return <RenderContext.Provider value={context}>{result.render()}</RenderContext.Provider>;
          })
        );
      },
      [enhancer]
    );
  };

  function ChainOfResponsibilityProvider({ children, init, middleware }: ProviderProps<Request, Props, Init>) {
    if (!Array.isArray(middleware) || middleware.some(middleware => typeof middleware !== 'function')) {
      throw new Error('react-chain-of-responsibility: "middleware" prop must be an array of functions');
    }

    // Remap the middleware, so all inputs/outputs are validated.
    const fortifiedMiddleware = Object.freeze(
      middleware.map<ComponentMiddleware<Request, Props, Init>>(fn => (init: Init) => {
        const enhancer = fn(init);

        return next => originalRequest => {
          // False positive: although we did not re-assign the variable from true, it was initialized as undefined.
          // eslint-disable-next-line prefer-const
          let hasReturned: boolean;

          const returnValue = enhancer(nextRequest => {
            if (hasReturned) {
              throw new Error(
                'react-chain-of-responsibility: next() cannot be called after the function had returned synchronously'
              );
            }

            // We do not allow passing void/undefined to next() because it would be confusing whether to keep the original request or pass an undefined.
            !options.passModifiedRequest &&
              !Object.is(nextRequest, originalRequest) &&
              console.warn(
                'react-chain-of-responsibility: next() must be called with the original request, otherwise, set "options.passModifiedRequest" to true to pass a different request object downstream'
              );

            return next(options.passModifiedRequest ? nextRequest : originalRequest);
          })(originalRequest);

          hasReturned = true;

          // Make sure the return value is built using our helper function for forward-compatibility reason.
          return returnValue && parse(componentFunctorReturnValueSchema, returnValue);
        };
      })
    );

    const { enhancer: parentEnhancer } = useContext(BuildContext);

    const enhancer = useMemo<ComponentEnhancer<Request, Props>>(
      () =>
        // We are reversing because it is easier to read:
        // - With reverse, [a, b, c] will become a(b(c(fn)))
        // - Without reverse, [a, b, c] will become c(b(a(fn)))
        applyMiddleware<[Request], ComponentFunctorReturnValue<Props> | undefined, [Init]>(
          ...[...fortifiedMiddleware, ...[() => parentEnhancer]].reverse()
        )(init as Init),
      [init, middleware, parentEnhancer]
    );

    const contextValue = useMemo<BuildContextType<Request, Props>>(() => Object.freeze({ enhancer }), [enhancer]);

    return <BuildContext.Provider value={contextValue}>{children}</BuildContext.Provider>;
  }

  function ChainOfResponsibilityProxy({ fallbackComponent, request, ...props }: ProxyProps<Request, Props>) {
    const result = useBuildRenderCallback()(request, { fallbackComponent })?.(props as Props);

    return result ? <Fragment>{result}</Fragment> : null;
  }

  const MemoizedChainOfResponsibilityProvider =
    memo<ProviderProps<Request, Props, Init>>(ChainOfResponsibilityProvider);

  return Object.freeze({
    Provider: MemoizedChainOfResponsibilityProvider as typeof MemoizedChainOfResponsibilityProvider &
      InferenceHelper<Request, Props, Init>,
    Proxy: memo<ProxyProps<Request, Props>>(ChainOfResponsibilityProxy),
    reactComponent,
    useBuildRenderCallback

    // TODO: Consider adding back `asMiddleware`.
  });
}

export default createChainOfResponsibility;
export {
  type ChainOfResponsibility,
  type CreateChainOfResponsibilityOptions,
  type InferComponent,
  type InferInit,
  type InferMiddleware,
  type InferProps,
  type InferProxyProps,
  type InferRequest,
  type UseBuildRenderCallback
};
