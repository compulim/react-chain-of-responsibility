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
  text: string;
};

type Request = void;

beforeEach(() => spyOn(console, 'warn'));

const RenderText = ({ text }: Props) => <Fragment>{text}</Fragment>;

scenario(
  'withBuildProps',
  bdd => {
    bdd
      .given(`a chain with props bypassed`, () =>
        withBuildProps(createChainOfResponsibility<Request, Props>(), props => props)
      )
      .and('it will render request as text', chainOfResponsibility => {
        const middleware: (typeof chainOfResponsibility.types.middleware)[] = [() => () => () => RenderText];

        return [chainOfResponsibility, middleware] as const;
      })
      .and.oneOf([
        [
          'render via <Proxy> with a suffix',
          ([chainOfResponsibility, middleware]) =>
            [
              chainOfResponsibility,
              middleware,
              memo<{ readonly text: string }>(({ text }: { readonly text: string }) => (
                // TODO: For request of type void, can we not require setting `request` props to undefined?
                <chainOfResponsibility.Proxy request={undefined} text={text} />
              ))
            ] as const
        ],
        [
          'render via useBuildComponentCallback() with a suffix',
          ([chainOfResponsibility, middleware]) =>
            [
              chainOfResponsibility,
              middleware,
              memo<{ readonly text: string }>(({ text }: { readonly text: string }) => {
                const Component = chainOfResponsibility.useBuildComponentCallback()();

                return Component ? <Component text={text} /> : null;
              })
            ] as const
        ]
      ])
      .and('as a React component', ([{ Provider }, middleware, TestContainer]) => ({ text }: { text: string }) => (
        <Provider middleware={middleware}>
          <TestContainer text={text} />
        </Provider>
      ))

      .when('request rendering of "Hello, World!"', App => render(<App text="Hello, World!" />))
      .then(`should render "Hello, World!"`, (_, result) =>
        expect(result.container).toHaveProperty('textContent', 'Hello, World!')
      )

      .when('request re-rendering of "Aloha!"', (App, result) => {
        result.rerender(<App text="Aloha!" />);

        return result;
      })
      .then(`should render "Aloha!"`, (_, result) => expect(result.container).toHaveProperty('textContent', 'Aloha!'));
  },
  NodeTest
);
