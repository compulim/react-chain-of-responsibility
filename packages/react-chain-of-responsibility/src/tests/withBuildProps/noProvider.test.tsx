/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, memo } from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibility';
import withBuildProps from '../../withBuildProps';

type Props = {
  children?: never;
  suffix: string;
  text?: Request | undefined;
};

type Request = string;

beforeEach(() => jest.spyOn(console, 'warn').mockImplementation(() => {}));

const RenderText = ({ text }: Props) => <Fragment>{text}</Fragment>;

scenario('withBuildProps', bdd => {
  bdd
    .given(`a chain with request copied to props`, () =>
      withBuildProps(createChainOfResponsibility<Request, Props>(), (props, request) => ({
        ...props,
        text: `${request} (${props.suffix})`
      }))
    )
    .and.oneOf([
      [
        'render fallback component via <Proxy> with a suffix',
        chainOfResponsibility =>
          memo<{ readonly text: Request }>(({ text }: { readonly text: Request }) => (
            <chainOfResponsibility.Proxy fallbackComponent={RenderText} request={text} suffix="1" />
          ))
      ],
      [
        'render fallback component via useBuildComponentCallback() with a suffix',
        chainOfResponsibility =>
          memo<{ readonly text: Request }>(({ text }: { readonly text: Request }) => {
            const Component = chainOfResponsibility.useBuildComponentCallback()(text, {
              fallbackComponent: RenderText
            });

            return Component && <Component suffix="1" />;
          })
      ]
    ])
    .and('as a React component without provider', TestContainer => ({ text }: { text: Request }) => <TestContainer text={text} />)

    .when('request rendering of "Hello, World!"', App => render(<App text="Hello, World!" />))
    .then(`should render "Hello, World! (1)"`, (_, result) =>
      expect(result.container).toHaveProperty('textContent', 'Hello, World! (1)')
    )

    .when('request re-rendering of "Aloha!"', (App, result) => {
      result.rerender(<App text="Aloha!" />);

      return result;
    })
    .then(`should render "Aloha! (1)"`, (_, result) =>
      expect(result.container).toHaveProperty('textContent', 'Aloha! (1)')
    );
});
