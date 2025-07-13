/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React from 'react';

import createChainOfResponsibility, { type InferMiddleware } from '../../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: never };
type Request = string;

scenario('calling useRequest() outside of render', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, reactComponent, useRequest } = createChainOfResponsibility<Request, Props>();

      const MyComponent = function MyComponent() {
        return useRequest();
      };

      const middleware: readonly InferMiddleware<typeof Provider>[] = [
        // With a fixed props, the <MyComponent> should be stable.
        () => () => () => reactComponent(MyComponent)
      ];

      return function TestComponent() {
        return (
          <Provider middleware={middleware}>
            <MyComponent />
          </Provider>
        );
      };
    })
    .and(
      'a console.error spy',
      TestComponent => ({
        error: jest.spyOn(console, 'error').mockImplementation(() => {}),
        TestComponent
      }),
      ({ error }) => error.mockRestore()
    )
    .when(
      'the component is being rendered',
      ({ TestComponent }) =>
        () =>
          render(<TestComponent />)
    )
    .then('should throw', (_, fn) =>
      expect(fn).toThrow(
        expect.objectContaining({
          message: expect.stringContaining('this hook cannot be used outside of <Proxy> and useBuildRenderCallback()')
        })
      )
    );
});
