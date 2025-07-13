/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibilityAsRenderCallback.tsx';

type Props = { readonly children?: never };
type Request = void;

scenario('passing an invalid middleware prop', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider } = createChainOfResponsibility<Request, Props>();

      return {
        TestComponent: function TestComponent() {
          return <Provider middleware={1 as any} />;
        }
      };
    })
    .and(
      'a console.error spy',
      ({ TestComponent }) => ({
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
          message: expect.stringContaining('"middleware" prop must be an array of functions')
        })
      )
    );
});
