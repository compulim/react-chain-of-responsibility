import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import { expect } from 'expect';
import NodeTest, { mock } from 'node:test';
import React, { type ReactNode } from 'react';

const { Fragment, memo } = React;

scenario(
  'regardless of memo(), complex children change will be rendered again',
  bdd => {
    bdd
      .given('a test component', () => {
        const markRenderContainer = mock.fn();

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
        expect(markRenderContainer.mock.callCount()).toBe(1)
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
        expect(markRenderContainer.mock.callCount()).toBe(2)
      );
  },
  NodeTest
);
