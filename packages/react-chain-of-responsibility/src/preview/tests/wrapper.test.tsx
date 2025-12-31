import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import { expect } from 'expect';
import NodeTest from 'node:test';
import React, { type ReactNode } from 'react';
import createChainOfResponsibility, { type InferMiddleware } from '../createChainOfResponsibilityAsRenderCallback.tsx';

const { Fragment } = React;

type Props = { readonly children?: never; readonly value: number };
type Request = number;

type MyWrapperProps = { readonly children?: ReactNode | undefined; readonly request: number };

function MyWrapper({ children, request }: MyWrapperProps) {
  return (
    <Fragment>
      {`<MyWrapper request={${request}}>`}
      {children}
      {'</MyWrapper>'}
    </Fragment>
  );
}

type MyComponentProps = Props & { readonly value: number };

function MyComponent({ value }: MyComponentProps) {
  return <Fragment>Hello, World! ({value})</Fragment>;
}

scenario(
  'with wrapper component',
  bdd => {
    bdd
      .given('a TestComponent using chain of responsiblity', () => {
        const { Provider, Proxy, reactComponent } = createChainOfResponsibility<Request, Props>();

        const middleware: readonly InferMiddleware<typeof Provider>[] = [
          () => () => request =>
            reactComponent(MyComponent, {}, { wrapperComponent: MyWrapper, wrapperProps: { request } })
        ];

        return function TestComponent() {
          return (
            <Provider middleware={middleware}>
              <Proxy request={1} value={1} />
            </Provider>
          );
        };
      })
      .when('the component is rendered', TestComponent => render(<TestComponent />))
      .then('textContent should match', (_, { container }) =>
        expect(container).toHaveProperty('textContent', '<MyWrapper request={1}>Hello, World! (1)</MyWrapper>')
      );
  },
  NodeTest
);
