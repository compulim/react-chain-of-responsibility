/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, memo } from 'react';

import createChainOfResponsibility, { type InferMiddleware } from '../../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: never };

scenario('stability test with changing request', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, reactComponent, useBuildRenderCallback } = createChainOfResponsibility<number, Props>();

      const renderCall = jest.fn();

      const MyComponent = memo(function MyComponent(_: Props & { readonly dummy: string }) {
        renderCall();

        return <Fragment>Hello, World!</Fragment>;
      });

      const middleware: readonly InferMiddleware<typeof Provider>[] = [
        // With a fixed props, the <MyComponent> should be stable.
        () => () => () => reactComponent(MyComponent, { dummy: 'value' })
      ];

      function MyProxy({ request }: { readonly request: number }) {
        // We are using `useBuildRenderCallback` for less memoization.
        return useBuildRenderCallback()(request)?.({});
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
    .when('the component is rendered', ([TestComponent]) => render(<TestComponent request={1} />))
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', 'Hello, World!')
    )
    .and('should have been rendered once', ([_, renderCall]) => expect(renderCall).toHaveBeenCalledTimes(1))
    .when('the component is re-rendered with a different request', ([TestComponent], result) => {
      result.rerender(<TestComponent request={2} />);

      return result;
    })
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', 'Hello, World!')
    )
    .and('should not be re-rendered', ([_, renderCall]) => expect(renderCall).toHaveBeenCalledTimes(1));
});
