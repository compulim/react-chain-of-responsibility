import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import { expect } from 'expect';
import { spyOn } from 'jest-mock';
import NodeTest, { beforeEach, mock } from 'node:test';
import React from 'react';
import createChainOfResponsibility from '../../createChainOfResponsibility.tsx';
import withBuildProps from '../../withBuildProps.tsx';

const { Fragment, memo, useMemo } = React;

type Props = {
  children?: never;
  text?: Request | undefined;
};

type Request = string;

beforeEach(() => spyOn(console, 'warn'));

scenario(
  'withBuildProps',
  bdd => {
    bdd
      .given(`a chain with request copied to props`, () =>
        withBuildProps(createChainOfResponsibility<Request, Props>(), (props, request) => ({
          ...props,
          text: request
        }))
      )
      .and('it will render request as text', chainOfResponsibility => {
        const RenderText = mock.fn(({ text }: Props) => <Fragment>{text}</Fragment>);
        const middleware: (typeof chainOfResponsibility.types.middleware)[] = [() => () => () => RenderText];

        return [chainOfResponsibility, middleware, RenderText] as const;
      })
      .and.oneOf([
        [
          'render via <Proxy>',
          ([chainOfResponsibility, middleware, RenderText]) =>
            [
              chainOfResponsibility,
              middleware,
              RenderText,
              memo<{ readonly text: Request }>(({ text }: { readonly text: Request }) => (
                <chainOfResponsibility.Proxy request={text} />
              ))
            ] as const
        ],
        [
          'render via useBuildComponentCallback()',
          ([chainOfResponsibility, middleware, RenderText]) =>
            [
              chainOfResponsibility,
              middleware,
              RenderText,
              memo<{ readonly text: Request }>(({ text }: { readonly text: Request }) => {
                const buildComponent = chainOfResponsibility.useBuildComponentCallback();
                const Component = useMemo(() => buildComponent(text), [buildComponent, text]);

                return Component ? <Component /> : null;
              })
            ] as const
        ]
      ])
      .and(
        'as a React component',
        ([{ Provider }, middleware, RenderText, TestContainer]) =>
          [
            ({ text }: { readonly text: Request }) => (
              <Provider middleware={middleware}>
                <TestContainer text={text} />
              </Provider>
            ),
            RenderText
          ] as const
      )

      .when('request rendering of "Hello, World!"', ([App]) => render(<App text="Hello, World!" />))
      .then(`should render "Hello, World!"`, (_, result) =>
        expect(result.container).toHaveProperty('textContent', 'Hello, World!')
      )
      .and('should render <RenderText> once', ([_, RenderText]) => expect(RenderText.mock.callCount()).toBe(1))

      .when('request re-rendering of "Hello, World!"', ([App], result) => {
        result.rerender(<App text="Hello, World!" />);

        return result;
      })
      .then(`should render "Hello, World!"`, (_, result) =>
        expect(result.container).toHaveProperty('textContent', 'Hello, World!')
      )
      .and('should not re-render <RenderText>', ([_, RenderText]) => expect(RenderText.mock.callCount()).toBe(1))

      .when('request re-rendering of "Aloha!"', ([App], result) => {
        result.rerender(<App text="Aloha!" />);

        return result;
      })
      .then(`should render "Aloha!"`, (_, result) => expect(result.container).toHaveProperty('textContent', 'Aloha!'))
      .and('should render <RenderText> again', ([_, RenderText]) => expect(RenderText.mock.callCount()).toBe(2));
  },
  NodeTest
);
