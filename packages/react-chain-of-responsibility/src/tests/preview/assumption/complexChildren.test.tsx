
import { test } from 'node:test';
import expect from 'expect';
import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, memo, type ReactNode } from 'react';

scenario('regardless of memo(), complex children change will be rendered again', bdd => {
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
    .when('the test component is rendered', ([TestComponent]) =>
      render(
        <TestComponent>
          <div>Hello, World!</div>
        </TestComponent>
      )
    )
    .then('<Container> should have been rendered once', ([_TestComponent, markRenderContainer]) =>
      expect(markRenderContainer).toHaveBeenCalledTimes(1)
    )
    .when('the test component is rendered again', ([TestComponent], result) => {
      result.rerender(
        <TestComponent>
          <div>Hello, World!</div>
        </TestComponent>
      );

      return result;
    })
    .then('<Container> should have been rendered twice', ([_TestComponent, markRenderContainer]) =>
      // props.children is complex and memo() only do shallow comparison, so it consider the output is invalidated
      expect(markRenderContainer).toHaveBeenCalledTimes(2)
    );
});
