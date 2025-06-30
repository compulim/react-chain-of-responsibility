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

let renderFn: jest.Mock;

beforeEach(() => {
  renderFn = jest.fn();
});

beforeEach(() => jest.spyOn(console, 'warn').mockImplementation(() => {}));

const RenderText = ({ request }: { readonly request: Request }) => {
  renderFn();

  return <Fragment>{request}</Fragment>;
};

// Do not add memo() over <RenderText>, we want to test number of rerender accurately.
scenario('setup', bdd => {
  bdd
    .given('<RenderText>', () => RenderText)
    .when('render is called', () => render(<RenderText request="Hello, World!" />))
    .then('should render once', () => expect(renderFn).toHaveBeenCalledTimes(1))
    .when('rerender is called', (_, result) => result.rerender(<RenderText request="Hello, World!" />))
    .then('should render twice because <RenderText> is not memoized', () => expect(renderFn).toHaveBeenCalledTimes(2));
});

describe.each([
  [true, 'HELLO, WORLD!', 'ALOHA!'],
  [false, 'Hello, World!', 'Aloha!'],
  [undefined, 'Hello, World!', 'Aloha!']
])('passModifiedRequest is %s', (passModifiedRequest, expectation1, expectation2) => {
  scenario('copyRequestToProps with varied passModifiedRequest', bdd => {
    bdd
      .given(`a chain with passModifiedRequest of ${passModifiedRequest}`, () =>
        createChainOfResponsibility<string, Props>({
          copyRequestToProps: true,
          passModifiedRequest
        })
      )
      .and('it will convert request into uppercase', chainOfResponsibility => {
        const middleware: (typeof chainOfResponsibility.types.middleware)[] = [
          () => next => request => next(request.toUpperCase()),
          () => () => () => RenderText
        ];

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
      .then(`should render "${expectation1}"`, (_, result) =>
        expect(result.container).toHaveProperty('textContent', expectation1)
      )
      .and('should have rendered once', () => expect(renderFn).toHaveBeenCalledTimes(1))

      .when('request re-rendering of "Aloha!"', (App, result) => {
        result.rerender(<App text="Aloha!" />);

        return result;
      })
      .then(`should render "${expectation2}"`, (_, result) =>
        expect(result.container).toHaveProperty('textContent', expectation2)
      )
      .and('should have rendered twice', () => expect(renderFn).toHaveBeenCalledTimes(2))

      .when('request re-rendering of "Aloha!" again', (App, result) => {
        result.rerender(<App text="Aloha!" />);

        return result;
      })
      .then(`should render "${expectation2}"`, (_, result) =>
        expect(result.container).toHaveProperty('textContent', expectation2)
      )
      .and('should have rendered twice only', () => expect(renderFn).toHaveBeenCalledTimes(2));
  });
});
