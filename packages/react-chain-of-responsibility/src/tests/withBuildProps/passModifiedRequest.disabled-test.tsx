/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, memo } from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibility.tsx';
import withBuildProps from '../../withBuildProps.tsx';

type Props = {
  children?: never;
  value?: Request | undefined;
};

type Request = number;

beforeEach(() => jest.spyOn(console, 'warn').mockImplementation(() => {}));

const RenderValue = ({ value }: Props) => <Fragment>{value}</Fragment>;

scenario('withBuildProps', bdd => {
  bdd
    .given(`a chain with request copied to props`, () =>
      withBuildProps(createChainOfResponsibility<Request, Props>({ passModifiedRequest: true }), (props, request) => ({
        ...props,
        value: request
      }))
    )
    .and('it will render request as text', chainOfResponsibility => {
      const middleware: (typeof chainOfResponsibility.types.middleware)[] = [
        () => next => request => next(request % 2 ? request * 2 : request),
        () => () => () => RenderValue
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
            memo<{ readonly value: Request }>(function TestContainer({ value }: { readonly value: Request }) {
              return <chainOfResponsibility.Proxy request={value} />;
            })
          ] as const
      ],
      [
        'render via useBuildComponentCallback()',
        ([chainOfResponsibility, middleware]) =>
          [
            chainOfResponsibility,
            middleware,
            memo<{ readonly value: Request }>(function TestContainer({ value }: { readonly value: Request }) {
              const Component = chainOfResponsibility.useBuildComponentCallback()(value);

              return Component ? <Component /> : null;
            })
          ] as const
      ]
    ])
    .and(
      'as a React component',
      ([{ Provider }, middleware, TestContainer]) =>
        function App({ value }: { readonly value: Request }) {
          return (
            <Provider middleware={middleware}>
              <TestContainer value={value} />
            </Provider>
          );
        }
    )

    .when('request rendering of 1', App => render(<App value={1} />))
    .then(`should render "2"`, (_, result) => expect(result.container).toHaveProperty('textContent', '2'))

    .when('request rendering of 4', (App, result) => {
      result.rerender(<App value={4} />);

      return result;
    })
    .then(`should render 4`, (_, result) => expect(result.container).toHaveProperty('textContent', '4'));
});
