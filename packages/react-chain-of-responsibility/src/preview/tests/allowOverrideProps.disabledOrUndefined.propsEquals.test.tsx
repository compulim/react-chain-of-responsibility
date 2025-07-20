/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, type ReactNode } from 'react';

import createChainOfResponsibility, { type InferMiddleware } from '../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly value: string };
type Request = void;

function Downstream({ value }: Props) {
  return <Fragment>({value})</Fragment>;
}

type UpstreamProps = Props & {
  readonly renderNext?: ((overridingProps: Props) => ReactNode) | undefined;
};

function Upstream({ renderNext, value }: UpstreamProps) {
  // Recreate a content-equal props, should not warn.
  const result = renderNext?.({ value });

  return result ? <Fragment>{result}</Fragment> : null;
}

scenario('allowOverrideProps is disabled or undefined with content-equals props being recreated', bdd => {
  bdd.given
    .oneOf([
      ['disabled', () => false],
      ['undefined', () => undefined]
    ])
    .and('a TestComponent using chain of responsiblity', allowOverrideProps => {
      const { Provider, Proxy, reactComponent } = createChainOfResponsibility<Request, Props>({ allowOverrideProps });

      const middleware: readonly InferMiddleware<typeof Provider>[] = [
        () => next => request => reactComponent(Upstream, { renderNext: next(request)?.render }),
        () => () => () => reactComponent(Downstream)
      ];

      return {
        TestComponent: function TestComponent({ value }: { value: string }) {
          return (
            <Provider middleware={middleware}>
              <Proxy request={undefined} value={value} />
            </Provider>
          );
        }
      };
    })
    .and(
      'a console.warn spy',
      ({ TestComponent }) => ({ TestComponent, warn: jest.spyOn(console, 'warn').mockImplementation(() => {}) }),
      ({ warn }) => warn.mockRestore()
    )
    .when('the component is rendered', ({ TestComponent }) => render(<TestComponent value="Hello, World!" />))
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', '(Hello, World!)')
    )
    .and('console.warn should not have been called', ({ warn }) => expect(warn).toHaveBeenCalledTimes(0));
});
