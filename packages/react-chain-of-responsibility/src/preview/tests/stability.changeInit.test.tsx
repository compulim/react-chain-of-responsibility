/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, memo } from 'react';

import createChainOfResponsibility, { type InferMiddleware } from '../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: never };
type Request = void;

scenario('stability test with changing request', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, reactComponent, useBuildRenderCallback } = createChainOfResponsibility<
        Request,
        Props,
        number
      >();

      const renderCall = jest.fn();

      const MyComponent = memo(function MyComponent(_: Props & { readonly dummy: string }) {
        renderCall();

        return <Fragment>Hello, World!</Fragment>;
      });

      const middleware: readonly InferMiddleware<typeof Provider>[] = [
        // With a fixed props, the <MyComponent> should be stable.
        () => () => () => reactComponent(MyComponent, { dummy: 'value' })
      ];

      function MyProxy() {
        // We are using `useBuildRenderCallback` for less memoization.
        const result = useBuildRenderCallback()(undefined)?.({});

        return result ? <Fragment>{result}</Fragment> : null;
      }

      return [
        function TestComponent({ init }: { readonly init: number }) {
          return (
            <Provider init={init} middleware={middleware}>
              <MyProxy />
            </Provider>
          );
        },
        renderCall
      ] as const;
    })
    .when('the component is rendered', ([TestComponent]) => render(<TestComponent init={1} />))
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', 'Hello, World!')
    )
    .and('should have been rendered once', ([_, renderCall]) => expect(renderCall).toHaveBeenCalledTimes(1))
    .when('the component is re-rendered with a different init', ([TestComponent], result) => {
      result.rerender(<TestComponent init={2} />);

      return result;
    })
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', 'Hello, World!')
    )
    .and('should not be re-rendered', ([_, renderCall]) => expect(renderCall).toHaveBeenCalledTimes(1));
});
