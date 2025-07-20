
import { test } from 'node:test';
import expect from 'expect';
import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, memo, useMemo } from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibility';
import withBuildProps from '../../withBuildProps';

type Props = {
  children?: never;
  text?: Request | undefined;
};

type Request = string;

beforeEach(() => jest.spyOn(console, 'warn').mockImplementation(() => {}));

scenario('withBuildProps', bdd => {
  bdd
    .given(`a chain with request copied to props`, () =>
      withBuildProps(createChainOfResponsibility<Request, Props>(), (props, request) => ({
        ...props,
        text: request
      }))
    )
    .and('it will render request as text', chainOfResponsibility => {
      const RenderText = jest.fn(({ text }: Props) => <Fragment>{text}</Fragment>);
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
    .and('should render <RenderText> once', ([_, RenderText]) => expect(RenderText).toHaveBeenCalledTimes(1))

    .when('request re-rendering of "Hello, World!"', ([App], result) => {
      result.rerender(<App text="Hello, World!" />);

      return result;
    })
    .then(`should render "Hello, World!"`, (_, result) =>
      expect(result.container).toHaveProperty('textContent', 'Hello, World!')
    )
    .and('should not re-render <RenderText>', ([_, RenderText]) => expect(RenderText).toHaveBeenCalledTimes(1))

    .when('request re-rendering of "Aloha!"', ([App], result) => {
      result.rerender(<App text="Aloha!" />);

      return result;
    })
    .then(`should render "Aloha!"`, (_, result) => expect(result.container).toHaveProperty('textContent', 'Aloha!'))
    .and('should render <RenderText> again', ([_, RenderText]) => expect(RenderText).toHaveBeenCalledTimes(2));
});
