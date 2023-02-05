import React, { ComponentType, createContext, useCallback, useContext, useMemo } from 'react';

import applyMiddleware from './private/applyMiddleware';

import type { ComponentMiddleware } from './types';
import type { PropsWithChildren } from 'react';

type ProviderContext<P extends {}, T extends {} = P> = {
  useComponent: (props: P) => ComponentType<T> | false | null | undefined;
};

type ProviderProps<P extends {}, S = undefined, T extends {} = P> = PropsWithChildren<{
  init?: S;
  middleware?: ComponentMiddleware<P, S, T>[];
}>;

export default function createComponentStrategy<P extends {}, S = undefined, T extends {} = P>(options: {
  transformProps: (props: P) => T;
}): {
  Provider: ComponentType<ProviderProps<P, S, T>>;
  Proxy: ComponentType<P>;
  useComponent: () => (props: P) => ComponentType<T> | false | null | undefined;
};

export default function createComponentStrategy<P extends {}, S = undefined>(
  options?: Omit<{}, 'transformProps'>
): {
  Provider: ComponentType<ProviderProps<P, S, P>>;
  Proxy: ComponentType<P>;
  useComponent: () => (props: P) => ComponentType<P> | false | null | undefined;
};

export default function createComponentStrategy<P extends {}, S = undefined, T extends {} = P>({
  transformProps
}: {
  transformProps?: (props: P) => T;
} = {}): {
  Provider: ComponentType<ProviderProps<P, S, T>>;
  Proxy: ComponentType<P>;
  useComponent: () => (props: P) => ComponentType<T> | false | null | undefined;
} {
  const context = createContext<ProviderContext<P, T> | undefined>(undefined);

  const Provider: ComponentType<ProviderProps<P, S, T>> = ({ children, init, middleware }: ProviderProps<P, S, T>) => {
    const enhancer = useMemo(
      () =>
        // We are reversing because it is easier to read:
        // - With reverse, [a, b, c] will become a(b(c(fn)))
        // - Without reverse, [a, b, c] will become c(b(a(fn)))
        applyMiddleware<[P], ComponentType<T> | false | null | undefined, [S | undefined]>(
          ...[...(middleware || [])].reverse()
        )(init)(() => null),
      [init, middleware]
    );

    // TODO: Add way to verify that every middleware is returning things correctly.
    const useComponent = useCallback<(props: P) => ComponentType<T> | false | null | undefined>(
      (props: P) => enhancer(props),
      [enhancer]
    );

    const contextValue = useMemo(() => ({ useComponent }), [useComponent]);

    return <context.Provider value={contextValue}>{children}</context.Provider>;
  };

  const useComponent = () => {
    const contextValue = useContext(context);

    if (!contextValue) {
      throw new Error('This hook can only be used under its corresponding <ComponentProvider>.');
    }

    return contextValue.useComponent;
  };

  const Proxy: ComponentType<P> = (props: P) => {
    const Component = useComponent()(props);

    // TypeScript limitation.
    // If `transformProps` is not defined, `T` must be same as `P`, we defined this as one of the overload.
    // As `T = P`, we can cast `props: P` to `T`.
    const transformedProps = transformProps ? transformProps(props) : (props as unknown as T);

    return Component ? <Component {...transformedProps} /> : null;
  };

  return {
    Provider,
    Proxy,
    useComponent
  };
}
