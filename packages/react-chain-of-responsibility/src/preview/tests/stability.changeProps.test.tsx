import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import { expect } from 'expect';
import NodeTest, { mock } from 'node:test';
import React from 'react';
import createChainOfResponsibility, { type InferMiddleware } from '../createChainOfResponsibilityAsRenderCallback.tsx';

const { Fragment, memo } = React;

type Props = { readonly children?: never };
type Request = number;

scenario(
  'stability test with changing props',
  bdd => {
    bdd
      .given('a TestComponent using chain of responsiblity', () => {
        const { Provider, reactComponent, useBuildRenderCallback } = createChainOfResponsibility<Request, Props>();

        let count = 0;
        const renderCall = mock.fn();

        const MyComponent = memo(function MyComponent({ value }: Props & { readonly value: number }) {
          renderCall();

          return <Fragment>Hello, World! ({value})</Fragment>;
        });

        const middleware: readonly InferMiddleware<typeof Provider>[] = [
          // Bind props change every time it is called.
          // With a changing props, the <MyComponent> should always be re-rendered.
          () => () => () => reactComponent(MyComponent, () => ({ value: ++count }))
        ];

        function MyProxy({ request }: { readonly request: number }) {
          // We are using `useBuildRenderCallback` for less memoization.
          const result = useBuildRenderCallback()(request)?.({});

          return result ? <Fragment>{result}</Fragment> : null;
        }

        return [
          function TestComponent({ request }: { readonly request: number }) {
            return (
              <Provider middleware={middleware}>
                <MyProxy request={request} />
              </Provider>
            );
          },
          renderCall
        ] as const;
      })

      // ---

      .when('the component is rendered', ([TestComponent]) => render(<TestComponent request={1} />))
      .then('textContent should match', (_, { container }) =>
        expect(container).toHaveProperty('textContent', 'Hello, World! (1)')
      )
      .and('should have been rendered once', ([_, renderCall]) => expect(renderCall.mock.callCount()).toBe(1))

      // ---

      .when('the component is re-rendered with same request', ([TestComponent], result) => {
        // With same request, it should still call enhancer because props could be changed.
        result.rerender(<TestComponent request={1} />);

        return result;
      })
      .then('textContent should match', (_, { container }) =>
        expect(container).toHaveProperty('textContent', 'Hello, World! (2)')
      )
      // Because bindProps is a side-effect (change every time it is called), thus, the component must be rendered again.
      .and('should have been rendered twice', ([_, renderCall]) => expect(renderCall.mock.callCount()).toBe(2));
  },
  NodeTest
);
