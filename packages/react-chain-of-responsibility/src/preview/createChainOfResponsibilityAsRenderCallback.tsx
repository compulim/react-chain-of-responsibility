import { applyMiddleware } from 'handler-chain';
import React, { type ComponentType, type PropsWithChildren, type ReactElement, type ReactNode } from 'react';
import { type SetOptional } from 'type-fest';
import { custom, function_, object, parse, safeParse } from 'valibot';

import arePropsEqual from './private/arePropsEqual.ts';

const { createContext, Fragment, memo, useCallback, useContext, useMemo } = React;

// TODO: Related to https://github.com/microsoft/TypeScript/issues/17002.
//       typescript@5.2.2 has a bug, Array.isArray() is a type predicate but only works with mutable array, not readonly array.
declare global {
  interface ArrayConstructor {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isArray(arg: any): arg is readonly any[];
  }
}

type BaseProps = object;

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
  readonly reactComponent: ReactComponentHandlerResult<Props>;
  readonly useBuildRenderCallback: () => UseBuildRenderCallback<Request, Props>;
};

// TODO: Maybe this one should be local.
//       Verify that reactComponent() from an instance of CoR should throw error when used in another instance of CoR.
const DO_NOT_CREATE_THIS_OBJECT_YOURSELF = Symbol();

type ComponentRenderer<Props> = (props: Props) => ReactElement | null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const componentHandlerResultSchema = custom<ComponentHandlerResult<any>>(
  value =>
    safeParse(object({ render: function_() }), value).success &&
    !!value &&
    typeof value === 'object' &&
    DO_NOT_CREATE_THIS_OBJECT_YOURSELF in value,
  'react-chain-of-responsibility: middleware must return value constructed by reactComponent()'
);

interface ComponentHandlerResult<Props extends BaseProps> {
  readonly [DO_NOT_CREATE_THIS_OBJECT_YOURSELF]: undefined;
  readonly render: (overridingProps?: Partial<Props> | undefined) => ReactElement | null;
}

type ComponentHandler<Request, Props extends BaseProps> = (
  request: Request
) => ComponentHandlerResult<Props> | undefined;

type ComponentEnhancer<Request, Props extends BaseProps> = (
  next: ComponentHandler<Request, Props>
) => ComponentHandler<Request, Props>;

type ComponentMiddleware<Request, Props extends BaseProps, Init = undefined> = (
  init: Init
) => ComponentEnhancer<Request, Props>;

type ReactComponentInit<
  Props extends BaseProps,
  W extends (BaseProps & { children?: ReactNode | undefined }) | void = void
> = W extends void
  ? {
      wrapperComponent?: undefined;
      wrapperProps?: undefined;
    }
  : {
      wrapperComponent: ComponentType<W>;
      wrapperProps: W | ((props: Props) => W);
    };

type ReactComponentHandlerResult<Props extends BaseProps> = <
  P extends Props,
  W extends (BaseProps & { children?: ReactNode | undefined }) | void = void
>(
  component: ComponentType<P>,
  bindProps?: SetOptional<P, keyof Props> | ((props: Props) => SetOptional<P, keyof Props>) | undefined,
  init?: ReactComponentInit<Props, W>
) => ComponentHandlerResult<Props>;

type UseBuildRenderCallbackOptions<Props> = {
  readonly fallbackComponent?: ComponentType<Props> | undefined;
};

interface UseBuildRenderCallback<Request, Props extends BaseProps> {
  (request: Request, options?: undefined | UseBuildRenderCallbackOptions<Props>): ComponentRenderer<Props> | undefined;
}

type BuildContextType<Request, Props extends BaseProps> = {
  readonly enhancer: ComponentEnhancer<Request, Props>;
};

type RenderContextType<Props> = {
  readonly originalProps: Props;
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
    readonly init: Init;
    readonly middleware: ComponentMiddleware<Request, Props, Init>;
    readonly props: Props;
    readonly proxyProps: ProxyProps<Request, Props>;
    readonly providerProps: ProviderProps<Request, Props, Init>;
    readonly request: Request;
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InferInit<T extends InferenceHelper<any, any, any>> = T['~types']['init'];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InferMiddleware<T extends InferenceHelper<any, any, any>> = T['~types']['middleware'];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InferProps<T extends InferenceHelper<any, any, any>> = T['~types']['props'];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InferProxyProps<T extends InferenceHelper<any, any, any>> = T['~types']['proxyProps'];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InferProviderProps<T extends InferenceHelper<any, any, any>> = T['~types']['providerProps'];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InferRequest<T extends InferenceHelper<any, any, any>> = T['~types']['request'];

function createComponentHandlerResult<Props extends BaseProps>(
  render: (overridingProps?: Partial<Props> | undefined) => ReactElement | null
): ComponentHandlerResult<Props> {
  return Object.freeze({ [DO_NOT_CREATE_THIS_OBJECT_YOURSELF]: undefined, render });
}

function createChainOfResponsibility<
  Request = void,
  Props extends BaseProps = { readonly children?: never },
  Init = void
>(options: CreateChainOfResponsibilityOptions = {}): ChainOfResponsibility<Request, Props, Init> {
  // Freeze options to prevent accidental change.
  options = Object.freeze({ ...options });

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

  function reactComponent<P extends Props, W extends (BaseProps & { children?: ReactNode | undefined }) | void = void>(
    component: ComponentType<P>,
    // For `bindProps` of type function, do not do side-effect in it, it may not be always called in all scenarios.
    bindProps?: SetOptional<P, keyof Props> | ((props: Props) => SetOptional<P, keyof Props>) | undefined,
    init?: ReactComponentInit<Props, W> | undefined
  ): ComponentHandlerResult<Props> {
    // memo() and generic type do not play well together.
    const TypedWrapperComponent = WrapperComponent as ComponentType<WrapperComponentProps<P, W>>;

    if (init?.wrapperComponent && init.wrapperProps) {
      return createComponentHandlerResult((overridingProps?: Partial<Props> | undefined) => (
        <TypedWrapperComponent
          bindProps={bindProps}
          component={component}
          overridingProps={overridingProps}
          wrapperComponent={init.wrapperComponent as ComponentType<W>}
          wrapperProps={init.wrapperProps as W}
        />
      ));
    } else {
      return createComponentHandlerResult((overridingProps?: Partial<Props> | undefined) => (
        <TypedWrapperComponent bindProps={bindProps} component={component} overridingProps={overridingProps} />
      ));
    }
  }

  type WrapperComponentProps<
    P extends Props,
    W extends (BaseProps & { children?: ReactNode | undefined }) | void = void
  > = {
    readonly bindProps: SetOptional<P, keyof Props> | ((props: Props) => SetOptional<P, keyof Props>) | undefined;
    readonly component: ComponentType<P>;
    readonly overridingProps: Partial<Props> | undefined;
    readonly wrapperComponent?: ComponentType<W> | undefined;
    readonly wrapperProps?: W | ((props: Props) => W) | undefined;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const WrapperComponent = memo<WrapperComponentProps<any, any>>(function WrapperComponent<
    P extends Props,
    W extends BaseProps & { children?: ReactNode | undefined }
  >({
    bindProps,
    component: Component,
    overridingProps,
    wrapperComponent: WrapperComponent,
    wrapperProps
  }: WrapperComponentProps<P, W>) {
    const { allowOverrideProps } = options;
    const { originalProps: renderCallbackProps } = useContext(RenderContext);

    if (overridingProps && !arePropsEqual(overridingProps, renderCallbackProps) && !allowOverrideProps) {
      console.warn('react-chain-of-responsibility: "allowOverrideProps" must be set to true to override props');
    }

    const props = Object.freeze(
      allowOverrideProps ? { ...renderCallbackProps, ...overridingProps } : { ...renderCallbackProps }
    );

    const child = (
      <Component
        {...({
          ...props,
          ...(typeof bindProps === 'function' ? bindProps(props) : bindProps)
        } as P)}
      />
    );

    return WrapperComponent && wrapperProps ? (
      <WrapperComponent {...(typeof wrapperProps === 'function' ? wrapperProps(props) : wrapperProps)}>
        {child}
      </WrapperComponent>
    ) : (
      child
    );
  });

  const useBuildRenderCallback: () => UseBuildRenderCallback<Request, Props> = () => {
    const { enhancer } = useContext(BuildContext);

    return useCallback(
      (request, buildOptions = {}) => {
        const result =
          // Put the "fallbackComponent" as the last one in the chain.
          enhancer(() => {
            const { fallbackComponent } = buildOptions;

            if (!fallbackComponent) {
              console.warn(
                'react-chain-of-responsibility: the request has fall through all middleware, set "fallbackComponent" as a catchall',
                request
              );

              // For clarity, we are returning `undefined` instead of `() => undefined`.
              return;
            }

            // `fallbackComponent` do not need `overridingProps` because it is the last one in the chain, it would not have the next() function.
            return reactComponent(fallbackComponent);
          })(request);

        return (
          result &&
          ((originalProps: Props) => (
            // This is render function, we cannot call any hooks here.
            <BuildRenderCallback originalProps={originalProps} render={result.render} />
          ))
        );
      },
      [enhancer]
    );
  };

  type BuildRenderCallbackProps = {
    readonly originalProps: Props;
    readonly render: () => ReactNode;
  };

  // Do not memoize <BuildRenderCallback>.
  // `bindProps` may have side effect and we want to be re-rendered to capture the side-effect.
  // To prevent wasted render, web devs should memoize it themselves.
  function BuildRenderCallback({ originalProps, render }: BuildRenderCallbackProps) {
    const context = useMemo<RenderContextType<Props>>(() => Object.freeze({ originalProps }), [originalProps]);

    return <RenderContext.Provider value={context}>{render()}</RenderContext.Provider>;
  }

  function ChainOfResponsibilityProvider({ children, init, middleware }: ProviderProps<Request, Props, Init>) {
    if (!Array.isArray(middleware) || middleware.some(middleware => typeof middleware !== 'function')) {
      throw new Error('react-chain-of-responsibility: "middleware" prop must be an array of functions');
    }

    // Remap the middleware, so all inputs/outputs are validated.
    const fortifiedMiddleware = useMemo(
      () =>
        Object.freeze(
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
              return returnValue && parse(componentHandlerResultSchema, returnValue);
            };
          })
        ),
      [middleware]
    );

    const { enhancer: parentEnhancer } = useContext(BuildContext);

    const enhancer = useMemo<ComponentEnhancer<Request, Props>>(
      () =>
        // We are reversing because it is easier to read:
        // - With reverse, [a, b, c] will become a(b(c(fn)))
        // - Without reverse, [a, b, c] will become c(b(a(fn)))
        applyMiddleware<ComponentHandlerResult<Props> | undefined, Request, Init>(
          ...[...fortifiedMiddleware, ...[() => parentEnhancer]]
        )(init as Init),
      [init, fortifiedMiddleware, parentEnhancer]
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
    Proxy: ChainOfResponsibilityProxy,
    reactComponent,
    useBuildRenderCallback

    // TODO: Consider adding back `asMiddleware`.
  });
}

export default createChainOfResponsibility;
export {
  type ChainOfResponsibility,
  type ComponentEnhancer,
  type ComponentHandler,
  type ComponentHandlerResult,
  type ComponentMiddleware,
  type ComponentRenderer,
  type CreateChainOfResponsibilityOptions,
  type InferenceHelper,
  type InferInit,
  type InferMiddleware,
  type InferProps,
  type InferProviderProps,
  type InferProxyProps,
  type InferRequest,
  type ProviderProps,
  type ProxyProps,
  type ReactComponentHandlerResult,
  type UseBuildRenderCallback,
  type UseBuildRenderCallbackOptions
};
