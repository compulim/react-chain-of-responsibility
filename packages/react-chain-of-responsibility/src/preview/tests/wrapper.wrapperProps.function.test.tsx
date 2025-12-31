import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import { expect } from 'expect';
import NodeTest from 'node:test';
import React, { Fragment, type ReactNode } from 'react';
import createChainOfResponsibility, { type InferMiddleware } from '../createChainOfResponsibilityAsRenderCallback.tsx';

type Props = { readonly children?: never; readonly value: number };
type Request = number;

type MyWrapperProps = { readonly children?: ReactNode | undefined; readonly value: number };

function MyWrapper({ children, value }: MyWrapperProps) {
  return (
    <Fragment>
      {`<MyWrapper value={${value}}>`}
      {children}
      {'</MyWrapper>'}
    </Fragment>
  );
}

type MyComponentProps = Props & { readonly value: number };

function MyComponent({ value }: MyComponentProps) {
  return <Fragment>Hello, World! ({value})</Fragment>;
}

scenario('with wrapper component', bdd => {
  bdd
    .given('a TestComponent using chain of responsibility', () => {
      const { Provider, Proxy, reactComponent } = createChainOfResponsibility<Request, Props>();

      const middleware: readonly InferMiddleware<typeof Provider>[] = [
        () => () => request =>
          reactComponent(
            MyComponent,
            {},
            { wrapperComponent: MyWrapper, wrapperProps: props => ({ value: request + props.value }) }
          )
      ];

      return function TestComponent() {
        return (
          <Provider middleware={middleware}>
            <Proxy request={1} value={2} />
          </Provider>
        );
      };
    })
    .when('the component is rendered', TestComponent => render(<TestComponent />))
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', '<MyWrapper value={3}>Hello, World! (2)</MyWrapper>')
    );
}, NodeTest);
