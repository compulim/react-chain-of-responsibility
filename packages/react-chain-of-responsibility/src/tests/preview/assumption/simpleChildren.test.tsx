
import { test } from 'node:test';
import expect from 'expect';
import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, memo, type ReactNode } from 'react';

scenario('regardless of memo(), simple children change will not rendered again', bdd => {
  bdd
    .given('a test component', () => {
      const markRenderContainer = jest.fn();

      const MemoizedContainer = memo(function Container({ children }: { readonly children?: ReactNode | undefined }) {
        markRenderContainer();

        return <Fragment>{children}</Fragment>;
      });

      return [
        memo(function TestComponent({ children }: { readonly children?: ReactNode | undefined }) {
          return <MemoizedContainer>{children}</MemoizedContainer>;
        }),
        markRenderContainer
      ] as const;
    })
    .when('the test component is rendered', ([TestComponent]) => render(<TestComponent>Hello, World!</TestComponent>))
    .then('<Container> should have been rendered once', ([_TestComponent, markRenderContainer]) =>
      expect(markRenderContainer).toHaveBeenCalledTimes(1)
    )
    .when('the test component is rendered again', ([TestComponent], result) => {
      result.rerender(<TestComponent>Hello, World!</TestComponent>);

      return result;
    })
    .then('<Container> should have been rendered twice', ([_TestComponent, markRenderContainer]) =>
      expect(markRenderContainer).toHaveBeenCalledTimes(1)
    );
});
