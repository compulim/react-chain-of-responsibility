import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import { expect } from 'expect';
import { spyOn } from 'jest-mock';
import NodeTest, { beforeEach } from 'node:test';
import React from 'react';
import createChainOfResponsibility from '../../createChainOfResponsibility.tsx';
import withBuildProps from '../../withBuildProps.tsx';

const { Fragment, memo } = React;

type Props = {
  children?: never;
  suffix: string;
  text?: Request | undefined;
};

type Request = string;

beforeEach(() => spyOn(console, 'warn'));

const RenderText = ({ text }: Props) => <Fragment>{text}</Fragment>;

scenario(
  'withBuildProps',
  bdd => {
    bdd
      .given(`a chain with request copied to props`, () =>
        withBuildProps(createChainOfResponsibility<Request, Props>(), (props, request) => ({
          ...props,
          text: `${request} (${props.suffix})`
        }))
      )
      .and('it will render request as text', chainOfResponsibility => {
        const middleware: (typeof chainOfResponsibility.types.middleware)[] = [() => () => () => RenderText];

        return [chainOfResponsibility, middleware] as const;
      })
      .and.oneOf([
        [
          'render via <Proxy>',
          ([chainOfResponsibility, middleware]) =>
            [
              chainOfResponsibility,
              middleware,
              memo<{ readonly suffix: string; readonly text: Request }>(
                ({ suffix, text }: { readonly suffix: string; readonly text: Request }) => (
                  <chainOfResponsibility.Proxy request={text} suffix={suffix} />
                )
              )
            ] as const
        ],
        [
          'render via useBuildComponentCallback()',
          ([chainOfResponsibility, middleware]) =>
            [
              chainOfResponsibility,
              middleware,
              memo<{ readonly suffix: string; readonly text: Request }>(
                ({ suffix, text }: { readonly suffix: string; readonly text: Request }) => {
                  const Component = chainOfResponsibility.useBuildComponentCallback()(text);

                  return Component ? <Component suffix={suffix} /> : null;
                }
              )
            ] as const
        ]
      ])
      .and(
        'as a React component',
        ([{ Provider }, middleware, TestContainer]) =>
          ({ suffix, text }: { readonly suffix: string; readonly text: Request }) => (
            <Provider middleware={middleware}>
              <TestContainer suffix={suffix} text={text} />
            </Provider>
          )
      )

      .when('request rendering of "Hello, World!" with suffix of "1"', App =>
        render(<App suffix="1" text="Hello, World!" />)
      )
      .then(`should render "Hello, World! (1)"`, (_, result) =>
        expect(result.container).toHaveProperty('textContent', 'Hello, World! (1)')
      )

      .when('request re-rendering of "Aloha!" with suffix of "2"', (App, result) => {
        result.rerender(<App suffix="2" text="Aloha!" />);

        return result;
      })
      .then(`should render "Aloha! (2)"`, (_, result) =>
        expect(result.container).toHaveProperty('textContent', 'Aloha! (2)')
      );
  },
  NodeTest
);
