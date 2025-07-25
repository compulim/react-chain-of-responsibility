/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Component, type ReactNode } from 'react';

import createChainOfResponsibility, { type InferMiddleware } from '../createChainOfResponsibilityAsRenderCallback.tsx';

type Props = { readonly children?: never };
type Request = void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class ErrorBoundary extends Component<{ children?: ReactNode | undefined }, { error: unknown }> {
  constructor(props: { children?: ReactNode | undefined }) {
    super(props);

    this.state = { error: undefined };
  }

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  override render() {
    const {
      props,
      state: { error }
    } = this;

    return error && typeof error === 'object' && 'message' in error ? '' + error.message : props.children;
  }
}

scenario('call next() after the function call ended should throw', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, Proxy } = createChainOfResponsibility<Request, Props>();
      const render = jest.fn();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const middleware: readonly InferMiddleware<typeof Provider>[] = [() => () => () => ({ render }) as any];

      return {
        render,
        TestComponent: function TestComponent() {
          return (
            <ErrorBoundary>
              <Provider middleware={middleware}>
                <Proxy request={undefined} />
              </Provider>
            </ErrorBoundary>
          );
        }
      };
    })
    .and(
      'a console.error spy',
      ({ render, TestComponent }) => ({
        render,
        TestComponent,
        error: jest.spyOn(console, 'error').mockImplementation(() => {})
      }),
      ({ error }) => error.mockRestore()
    )
    .when('the component is rendered', ({ TestComponent }) => render(<TestComponent />))
    .then('should show error message', (_, { container }) =>
      expect(container).toHaveProperty(
        'textContent',
        expect.stringContaining('middleware must return value constructed by reactComponent()')
      )
    )
    .and('the forged render function should not be called', ({ render }) => expect(render).toHaveBeenCalledTimes(0));
});
