/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, memo, type ComponentType, type ReactNode } from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibilityAsRenderCallback';

type Props = { children?: ReactNode | undefined; suffix: number };

scenario('single middleware', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, Proxy, types: _types } = createChainOfResponsibility<string, Props, number>();

      const renderChildrenCall = jest.fn();
      const testComponentCall = jest.fn();

      const RenderChildren = memo(({ children }: { children?: ReactNode | undefined }) => {
        renderChildrenCall();

        return <Fragment>{children}</Fragment>;
      });

      const TestComponent: ComponentType<Props> = ({ children, suffix }: Props) => {
        testComponentCall();

        return (
          <Fragment>
            {children} ({suffix})
          </Fragment>
        );
      };

      return [
        ({ init, request, suffix }: { init: number; request: string; suffix: number }) => (
          <Provider
            init={init}
            middleware={[
              init => next => request => [TestComponent, { children: next(request)({ suffix: 0 }), suffix: init }],
              () => () => request => [RenderChildren, { children: request, suffix: 0 }]
            ]}
          >
            <Proxy request={request} suffix={suffix} />
          </Provider>
        ),
        renderChildrenCall,
        testComponentCall
      ] as const;
    })
    .when('the component is rendered', ([TestComponent]) =>
      render(<TestComponent init={1} request="Hello, World!" suffix={0} />)
    )
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', 'Hello, World! (1)')
    )
    .and('<RenderChildren> should only rendered once', ([_TestComponent, renderChildrenCall]) =>
      expect(renderChildrenCall).toHaveBeenCalledTimes(1)
    )
    .and('<TestComponent> should only rendered once', ([_TestComponent, _renderChildrenCall, testComponentCall]) =>
      expect(testComponentCall).toHaveBeenCalledTimes(1)
    )
    .when('the component is re-rendered', ([TestComponent], result) => {
      result.rerender(<TestComponent init={2} request="Hello, World!" suffix={0} />);

      return result;
    })
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', 'Hello, World! (2)')
    )
    .and('<RenderChildren> should only rendered once', ([_, renderChildrenCall]) =>
      expect(renderChildrenCall).toHaveBeenCalledTimes(1)
    )
    .and('<TestComponent> should only rendered twice', ([_TestComponent, _renderChildrenCall, testComponentCall]) =>
      expect(testComponentCall).toHaveBeenCalledTimes(2)
    );
});
