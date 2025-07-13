/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment } from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibilityAsRenderCallback';

type Props = {
  readonly children?: never;
  readonly value: number;
};

function Fallback({ value }: Props) {
  return <Fragment>Fallback ({value})</Fragment>;
}

scenario('rendering fallback component without <Provider>', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Proxy, types: _types } = createChainOfResponsibility<void, Props>();

      return function TestComponent() {
        return <Proxy fallbackComponent={Fallback} request={undefined} value={1} />;
      };
    })
    .when('the component is rendered', TestComponent => render(<TestComponent />))
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', 'Fallback (1)')
    );
});
