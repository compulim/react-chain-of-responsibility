
import { test } from 'node:test';
import expect from 'expect';
import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment } from 'react';

import createChainOfResponsibility, { type InferMiddleware } from '../../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: never };
type Request = void;

function Fallback() {
  return <Fragment>Fallback</Fragment>;
}

scenario('rendering fallback component', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, Proxy } = createChainOfResponsibility<Request, Props>();

      const middleware: readonly InferMiddleware<typeof Provider>[] = [() => next => request => next(request)];

      return function TestComponent() {
        return (
          <Provider middleware={middleware}>
            <Proxy fallbackComponent={Fallback} request={undefined} />
          </Provider>
        );
      };
    })
    .when('the component is rendered', TestComponent => render(<TestComponent />))
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', 'Fallback')
    );
});
