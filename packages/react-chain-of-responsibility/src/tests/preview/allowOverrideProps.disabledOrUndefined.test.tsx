
import { test } from 'node:test';
import expect from 'expect';
import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, type ReactNode } from 'react';

import createChainOfResponsibility, { type InferMiddleware } from '../../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly value: string };
type Request = void;

function Downstream({ value }: Props) {
  return <Fragment>({value})</Fragment>;
}

type UpstreamProps = Props & {
  readonly renderNext?: ((overridingProps: Props) => ReactNode) | undefined;
};

function Upstream({ renderNext, value }: UpstreamProps) {
  const result = renderNext?.({ value: value.toUpperCase() });

  return result ? <Fragment>{result}</Fragment> : null;
}

scenario('allowOverrideProps is disabled or undefined', bdd => {
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
    .and('console.warn should have been called once', ({ warn }) => expect(warn).toHaveBeenCalledTimes(1))
    .and('console.warn should have been called with message', ({ warn }) =>
      expect(warn).toHaveBeenLastCalledWith(
        expect.stringContaining('"allowOverrideProps" must be set to true to override props')
      )
    );
});
