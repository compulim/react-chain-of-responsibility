/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Component, type ReactNode } from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibilityAsRenderCallback.tsx';

type Props = { readonly children?: never };
type Request = string;

type MyComponentProps = Props & {
  readonly next: (request: Request) => { render: () => ReactNode } | undefined;
  readonly request: Request;
};

function MyComponent({ next, request }: MyComponentProps) {
  // Calling next() during render phase should throw.
  return next(request)?.render();
}

class ErrorBoundary extends Component<{ children?: ReactNode | undefined }, { error: any }> {
  constructor(props: { children?: ReactNode | undefined }) {
    super(props);

    this.state = { error: undefined };
  }

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  override render() {
    const {
      props,
      state: { error }
    } = this;

    if (error) {
      return error.message;
    }

    return props.children;
  }
}

scenario('call next() after the function call ended should have caught in <ErrorBoundary>', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, Proxy, reactComponent, types: _types } = createChainOfResponsibility<Request, Props>();

      const middleware: readonly (typeof _types.middleware)[] = [
        () => next => request => reactComponent(MyComponent, { next, request })
      ];

      return {
        TestComponent: function TestComponent() {
          return (
            <ErrorBoundary>
              <Provider middleware={middleware}>
                <Proxy request="Hello, World!" />
              </Provider>
            </ErrorBoundary>
          );
        }
      };
    })
    .and(
      'a console.error spy',
      ({ TestComponent }) => ({ TestComponent, error: jest.spyOn(console, 'error').mockImplementation(() => {}) }),
      ({ error }) => error.mockRestore()
    )
    .when('the component is rendered', ({ TestComponent }) => render(<TestComponent />))
    .then('should show error message', (_, { container }) =>
      expect(container).toHaveProperty(
        'textContent',
        expect.stringContaining('next() cannot be called after the function had returned synchronously')
      )
    );
});
