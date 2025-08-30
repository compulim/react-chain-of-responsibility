/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, type ReactElement, type ReactNode } from 'react';

import createChainOfResponsibility, {
  type ComponentHandlerResult,
  type InferMiddleware
} from '../createChainOfResponsibilityAsRenderCallback';

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

type UpstreamProps = Props & { readonly result: ComponentHandlerResult<Props> | undefined };

function Upstream({ result, value }: UpstreamProps): ReactElement | null {
  return <Fragment>{result?.render?.({ value: value + 1 })}</Fragment>;
}

scenario('with wrapper component and overriding props and request', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, Proxy, reactComponent } = createChainOfResponsibility<Request, Props>({
        allowOverrideProps: true,
        passModifiedRequest: true
      });

      const middleware: readonly InferMiddleware<typeof Provider>[] = [
        () => next => request => {
          return reactComponent(
            Upstream,
            { result: next(request * 10) },
            { wrapperComponent: Fragment, wrapperProps: {} }
          );
        },
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
      expect(container).toHaveProperty('textContent', '<MyWrapper request={10}>Hello, World! (2)</MyWrapper>')
    );
});
