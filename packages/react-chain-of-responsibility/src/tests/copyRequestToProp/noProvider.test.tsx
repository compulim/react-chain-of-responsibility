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

scenario('copyRequestToProps with varied passModifiedRequest', bdd => {
  bdd
    .given(`a chain`, () => createChainOfResponsibility<string, Props>({ copyRequestToProps: true }))
    .and.oneOf([
      [
        'render fallback via <Proxy>',
        ({ Proxy }) =>
          memo<{ readonly text: Request }>(({ text }: { readonly text: Request }) => (
            <Proxy fallbackComponent={RenderText} request={text} />
          ))
      ],
      [
        'render fallback via useBuildComponentCallback()',
        ({ useBuildComponentCallback }) =>
          memo<{ readonly text: Request }>(({ text }: { readonly text: Request }) => {
            const Component = useBuildComponentCallback()(text, {
              fallbackComponent: RenderText
            });

            return Component && <Component />;
          })
      ]
    ])
    .and('as a React component without <Provider>', TestContainer => ({ text }: { text: Request }) => (
      <TestContainer text={text} />
    ))

    .when('request rendering of "Hello, World!"', App => render(<App text="Hello, World!" />))
    .then(`should render "Hello, World!"`, (_, result) =>
      expect(result.container).toHaveProperty('textContent', 'Hello, World!')
    )
    .and('should have rendered once', () => expect(renderFn).toHaveBeenCalledTimes(1))

    .when('request re-rendering of "Aloha!"', (App, result) => {
      result.rerender(<App text="Aloha!" />);

      return result;
    })
    .then(`should render "Aloha!"`, (_, result) => expect(result.container).toHaveProperty('textContent', 'Aloha!'))
    .and('should have rendered twice', () => expect(renderFn).toHaveBeenCalledTimes(2))

    .when('request re-rendering of "Aloha!" again', (App, result) => {
      result.rerender(<App text="Aloha!" />);

      return result;
    })
    .then(`should render "Aloha!"`, (_, result) => expect(result.container).toHaveProperty('textContent', 'Aloha!'))
    .and('should have rendered twice only', () => expect(renderFn).toHaveBeenCalledTimes(2));
});
