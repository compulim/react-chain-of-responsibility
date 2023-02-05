import React, { createElement, Fragment } from 'react';

import type { ComponentType } from 'react';

type PropsOf<T> = T extends ComponentType<infer P> ? P : never;

const EmptyComponent = () => <Fragment />;

// TODO: We could probably open-source this function separately.
export default function wrapWith<WrapperComponent extends ComponentType<any> = ComponentType<any>>(
  WrapperComponent: WrapperComponent | false | null | undefined,
  injectedWrapperProps?: PropsOf<WrapperComponent>
) {
  return function wrap<WrappedComponent extends ComponentType<any> = ComponentType<any>>(
    WrappedComponent: WrappedComponent | false | null | undefined,
    injectedWrappedProps?: PropsOf<WrappedComponent>
  ): ComponentType<PropsOf<WrappedComponent>> {
    if (WrapperComponent) {
      const WithWrapper = (props: PropsOf<WrappedComponent>) =>
        createElement(
          WrapperComponent,
          { ...props, ...injectedWrapperProps },
          // If there are no "WrappedComponent", don't override children. It will use the `props.children`.
          ...(WrappedComponent ? [<WrappedComponent {...props} {...injectedWrappedProps} />] : [])
        );

      WithWrapper.displayName = `WrappedWith${WrapperComponent.displayName}`;

      return WithWrapper;
    }

    if (WrappedComponent) {
      return (props: PropsOf<WrappedComponent>) => <WrappedComponent {...props} {...injectedWrappedProps} />;
    }

    return EmptyComponent;
  };
}
