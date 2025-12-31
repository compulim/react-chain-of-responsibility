import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import { expect } from 'expect';
import NodeTest from 'node:test';
import React, { type ReactNode } from 'react';
import createChainOfResponsibility, { type InferMiddleware } from '../createChainOfResponsibilityAsRenderCallback.tsx';

const { Fragment } = React;

type Props = { readonly children?: never };
type Request = string;

type StrongizeProps = Props & {
  readonly request: string;
};

function Strongize({ request }: StrongizeProps) {
  return <strong>{request}</strong>;
}

type ContainerProps = Props & {
  readonly renderNext1?: ((props: Props) => ReactNode) | undefined;
  readonly renderNext2?: ((props: Props) => ReactNode) | undefined;
};

function Container({ renderNext1, renderNext2 }: ContainerProps) {
  return (
    <Fragment>
      {renderNext1?.({})}
      {renderNext2?.({})}
    </Fragment>
  );
}

scenario(
  'call enhancer() twice',
  bdd => {
    bdd
      .given('a TestComponent using chain of responsiblity', () => {
        const { Provider, Proxy, reactComponent } = createChainOfResponsibility<Request, Props>({
          passModifiedRequest: true
        });

        const middleware: readonly InferMiddleware<typeof Provider>[] = [
          () => next => request => {
            const renderNext1 = next(`${request} (1)`)?.render;
            const renderNext2 = next(`${request} (2)`)?.render;

            return reactComponent(Container, { renderNext1, renderNext2 });
          },
          () => () => request => reactComponent(Strongize, { request })
        ];

        return function TestComponent() {
          return (
            <Provider middleware={middleware}>
              <Proxy request="Hello, World!" />
            </Provider>
          );
        };
      })
      .when('the component is rendered', TestComponent => render(<TestComponent />))
      .then('innerHTML should match', (_, { container }) =>
        expect(container).toHaveProperty(
          'innerHTML',
          '<strong>Hello, World! (1)</strong><strong>Hello, World! (2)</strong>'
        )
      );
  },
  NodeTest
);
