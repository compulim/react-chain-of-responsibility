import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import { expect } from 'expect';
import NodeTest from 'node:test';
import React, { Fragment, type ReactNode } from 'react';
import createChainOfResponsibility, { type InferMiddleware } from '../createChainOfResponsibilityAsRenderCallback.tsx';

type Props = {
  readonly value: number;
};

type Request = void;

function Fallback({ value }: Props) {
  return <Fragment>Fallback ({value})</Fragment>;
}

type MyComponentProps = Props & {
  readonly children?: ReactNode | undefined;
};

function MyComponent({ children }: MyComponentProps) {
  return children ? <Fragment>{children}</Fragment> : null;
}

scenario(
  'rendering fallback component with props pass from a middleware component',
  bdd => {
    bdd
      .given('a TestComponent using chain of responsiblity', () => {
        const { Provider, Proxy, reactComponent } = createChainOfResponsibility<Request, Props>();

        const middleware: readonly InferMiddleware<typeof Provider>[] = [
          () => next => request => {
            const renderNext = next(request);

            return reactComponent(MyComponent, props => ({ children: renderNext?.render(props) }));
          }
        ];

        return function TestComponent() {
          return (
            <Provider middleware={middleware}>
              <Proxy fallbackComponent={Fallback} request={undefined} value={1} />
            </Provider>
          );
        };
      })
      .when('the component is rendered', TestComponent => render(<TestComponent />))
      .then('textContent should match and props should be rendered', (_, { container }) =>
        expect(container).toHaveProperty('textContent', 'Fallback (1)')
      );
  },
  NodeTest
);
