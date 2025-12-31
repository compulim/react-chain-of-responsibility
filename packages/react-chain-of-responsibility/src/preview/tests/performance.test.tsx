import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import { expect } from 'expect';
import NodeTest, { mock } from 'node:test';
import React, { type ReactNode } from 'react';
import createChainOfResponsibility, { type InferMiddleware } from '../createChainOfResponsibilityAsRenderCallback.tsx';

const { Fragment, memo } = React;

type Props = {
  readonly children?: ReactNode | undefined;
  readonly prefix: string;
};

type Request = number;

type UpstreamProps = Props & {
  readonly suffix: number;
};

scenario(
  'for wasted rendering',
  bdd => {
    bdd
      .given('a TestComponent using chain of responsiblity', () => {
        const { Provider, Proxy, reactComponent } = createChainOfResponsibility<Request, Props>();

        const downstreamCall = mock.fn();
        const upstreamCall = mock.fn();

        const Downstream = memo(function Downstream({ children }: Props) {
          downstreamCall();

          return <Fragment>{children}</Fragment>;
        });

        const Upstream = memo(function Upstream({ children, prefix, suffix }: UpstreamProps) {
          upstreamCall();

          return (
            <Fragment>
              ({prefix}) {children} ({suffix})
            </Fragment>
          );
        });

        const middleware: readonly InferMiddleware<typeof Provider>[] = [
          () => next => request =>
            reactComponent(Upstream, {
              children: next(request)?.render(),
              suffix: request
            }),
          () => () => () => reactComponent(Downstream)
        ];

        return [
          function TestComponent({
            children,
            prefix,
            request
          }: {
            children?: ReactNode | undefined;
            prefix: string;
            request: number;
          }) {
            return (
              <Provider middleware={middleware}>
                <Proxy prefix={prefix} request={request}>
                  {children}
                </Proxy>
              </Provider>
            );
          },
          downstreamCall,
          upstreamCall
        ] as const;
      })
      .when('the component is rendered', ([TestComponent]) =>
        render(
          <TestComponent prefix="A" request={1}>
            Hello, World!
          </TestComponent>
        )
      )
      .then('textContent should match', (_, { container }) =>
        expect(container).toHaveProperty('textContent', '(A) Hello, World! (1)')
      )
      .and('<Downstream> should only have been rendered once', ([_TestComponent, downstreamCall]) =>
        expect(downstreamCall.mock.callCount()).toBe(1)
      )
      .and('<Upstream> should only have been rendered once', ([_TestComponent, _downstreamCall, upstreamCall]) =>
        expect(upstreamCall.mock.callCount()).toBe(1)
      )
      .when('the component is re-rendered with request change', ([TestComponent], result) => {
        result.rerender(
          <TestComponent prefix="A" request={2}>
            Hello, World!
          </TestComponent>
        );

        return result;
      })
      .then('textContent should match', (_, { container }) =>
        expect(container).toHaveProperty('textContent', '(A) Hello, World! (2)')
      )
      .and('<Downstream> should only have been rendered once', ([_, downstreamCall]) =>
        // Downstream does not depends on "request", thus, it should not be re-rendered.
        expect(downstreamCall.mock.callCount()).toBe(1)
      )
      .and('<Upstream> should only have been rendered twice', ([_TestComponent, _downstreamCall, upstreamCall]) =>
        expect(upstreamCall.mock.callCount()).toBe(2)
      )
      .when('the component is re-rendered with props change', ([TestComponent], result) => {
        result.rerender(
          <TestComponent prefix="B" request={2}>
            Hello, World!
          </TestComponent>
        );

        return result;
      })
      .then('textContent should match', (_, { container }) =>
        expect(container).toHaveProperty('textContent', '(B) Hello, World! (2)')
      )
      .and('<Downstream> should only have been rendered twice', ([_, downstreamCall]) =>
        // Despite <Downstream> does not depends on props, memo() would invalidate after props change.
        expect(downstreamCall.mock.callCount()).toBe(2)
      )
      .and('<Upstream> should only have been rendered three times', ([_TestComponent, _downstreamCall, upstreamCall]) =>
        expect(upstreamCall.mock.callCount()).toBe(3)
      );
  },
  NodeTest
);
