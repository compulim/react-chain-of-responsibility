/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, type ReactNode } from 'react';

import createChainOfResponsibility, { type InferMiddleware } from '../../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: ReactNode | undefined };
type Request = void;

type ComponentProps = Props & { renderNext: (() => ReactNode) | undefined };

function Emphasis({ renderNext }: ComponentProps) {
  return <em>{renderNext?.()}</em>;
}

function Strong({ renderNext }: ComponentProps) {
  return <strong>{renderNext?.()}</strong>;
}

function Parenthesis({ renderNext }: ComponentProps) {
  return <Fragment>({renderNext?.()})</Fragment>;
}

function PlainText({ children }: Props) {
  return children ? <Fragment>{children}</Fragment> : null;
}

scenario('multiple requests', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, Proxy, reactComponent } = createChainOfResponsibility<Request, Props>();

      const emphasisChain: readonly InferMiddleware<typeof Provider>[] = [
        () => next => request => reactComponent(Emphasis, { renderNext: next(request)?.render })
      ];

      const strongChain: readonly InferMiddleware<typeof Provider>[] = [
        () => next => request => reactComponent(Strong, { renderNext: next(request)?.render })
      ];

      const parenthesisChain: readonly InferMiddleware<typeof Provider>[] = [
        () => next => request => reactComponent(Parenthesis, { renderNext: next(request)?.render })
      ];

      return function TestComponent() {
        return (
          <Provider middleware={emphasisChain}>
            <Provider middleware={strongChain}>
              <Provider middleware={parenthesisChain}>
                <Proxy fallbackComponent={PlainText} request={undefined}>
                  Hello, World!
                </Proxy>
              </Provider>
            </Provider>
          </Provider>
        );
      };
    })
    .when('the component is rendered', TestComponent => render(<TestComponent />))
    .then('should render parent middleware last', (_, { container }) =>
      expect(container).toHaveProperty('outerHTML', '<div>(<strong><em>Hello, World!</em></strong>)</div>')
    );
});
