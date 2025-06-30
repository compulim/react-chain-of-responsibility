/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import React, { Fragment, memo } from 'react';

import { scenario } from '@testduet/given-when-then';
import createChainOfResponsibility from '../../createChainOfResponsibility';

type Props = {
  children?: never;
};

type Request = string;

beforeEach(() => jest.spyOn(console, 'warn').mockImplementation(() => {}));

const RenderText = ({ request }: { readonly request: Request }) => <Fragment>{request}</Fragment>;

scenario('copyRequestToProps with varied passModifiedRequest', bdd => {
  bdd
    .given(`a chain`, () =>
      createChainOfResponsibility<string, Props>({
        copyRequestToProps: true
      })
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
            memo<{ readonly text: Request }>(({ text }: { readonly text: Request }) => (
              <chainOfResponsibility.Proxy request={text} />
            ))
          ] as const
      ],
      [
        'render via useBuildComponentCallback()',
        ([chainOfResponsibility, middleware]) =>
          [
            chainOfResponsibility,
            middleware,
            memo<{ readonly text: Request }>(({ text }: { readonly text: Request }) => {
              const Component = chainOfResponsibility.useBuildComponentCallback()(text);

              return Component && <Component />;
            })
          ] as const
      ]
    ])
    .and('as a React component', ([{ Provider }, middleware, TestContainer]) => ({ text }: { text: Request }) => (
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
});
