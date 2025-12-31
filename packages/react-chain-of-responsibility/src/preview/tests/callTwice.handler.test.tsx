import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import { expect } from 'expect';
import NodeTest from 'node:test';
import React, { type ReactNode } from 'react';
import createChainOfResponsibility, { type InferMiddleware } from '../createChainOfResponsibilityAsRenderCallback.tsx';

const { Fragment } = React;

type Props = { readonly children?: never; readonly value: string };
type Request = void;

function Strongize({ value }: Props) {
  return <strong>{value}</strong>;
}

type ContainerProps = Props & {
  readonly renderNext?: ((props: Partial<Props> | undefined) => ReactNode) | undefined;
};

function Container({ renderNext, value }: ContainerProps) {
  return (
    <Fragment>
      {renderNext?.({ value: `${value} (1)` })}
      {renderNext?.({ value: `${value} (2)` })}
    </Fragment>
  );
}

scenario('call enhancer() twice', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, Proxy, reactComponent } = createChainOfResponsibility<Request, Props>({
        allowOverrideProps: true
      });

      const middleware: readonly InferMiddleware<typeof Provider>[] = [
        () => next => request => {
          const renderNext = next(request)?.render;

          return reactComponent(Container, ({ value }) => ({ renderNext, value }));
        },
        () => () => () => reactComponent(Strongize)
      ];

      return function TestComponent() {
        return (
          <Provider middleware={middleware}>
            <Proxy request={undefined} value="Hello, World!" />
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
}, NodeTest);
