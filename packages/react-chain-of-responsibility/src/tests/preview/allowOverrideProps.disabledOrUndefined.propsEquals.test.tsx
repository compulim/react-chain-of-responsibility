/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, type ReactNode } from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly value: string };

function Downstream({ value }: Props) {
  return <Fragment>({value})</Fragment>;
}

type UpstreamProps = Props & {
  readonly renderNext?: ((overridingProps: Props) => ReactNode) | undefined;
};

function Upstream({ renderNext, value }: UpstreamProps) {
  // Recreate a content-equal props, should not warn.
  return renderNext?.({ value });
}

scenario('allowOverrideProps is disabled or default', bdd => {
  bdd.given
    .oneOf([
      ['disabled', () => false],
      ['undefined', () => undefined]
    ])
    .and('a TestComponent using chain of responsiblity', allowOverrideProps => {
      const {
        Provider,
        Proxy,
        reactComponent,
        types: _types
      } = createChainOfResponsibility<void, Props>({ allowOverrideProps });

      const middleware: readonly (typeof _types.middleware)[] = [
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
