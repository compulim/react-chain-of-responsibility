import { expect } from 'expect';
import NodeTest from 'node:test';
import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React from 'react';
import createChainOfResponsibility, { type InferMiddleware } from '../createChainOfResponsibilityAsRenderCallback.tsx';

const { Fragment, useState } = React;

type Props = { readonly children?: never; value: number };
type Request = string;

type MyComponentProps = Props;

function OddComponent({ value }: MyComponentProps) {
  const [state] = useState(value);

  return <Fragment>Odd ({state})</Fragment>;
}

function EvenComponent({ value }: MyComponentProps) {
  const [state] = useState(value);

  return <Fragment>Even ({state})</Fragment>;
}

scenario(
  'useBuildRenderCallback',
  bdd => {
    bdd
      .given('a TestComponent using chain of responsiblity', () => {
        const { Provider, reactComponent, useBuildRenderCallback } = createChainOfResponsibility<Request, Props>();

        const middleware: readonly InferMiddleware<typeof Provider>[] = [
          () => next => request => {
            if (request) {
              return reactComponent(request === 'Odd' ? OddComponent : EvenComponent, {});
            }

            return next(request);
          }
        ];

        function App({ values }: { readonly values: readonly number[] }) {
          const render = useBuildRenderCallback();
          const renderOdd = render('Odd');
          const renderEven = render('Even');

          return (
            <Fragment>
              {values.map(value => (
                <Fragment key={value}>{value % 2 ? renderOdd?.({ value }) : renderEven?.({ value })}</Fragment>
              ))}
            </Fragment>
          );
        }

        return function TestComponent({ values }: { readonly values: readonly number[] }) {
          return (
            <Provider middleware={middleware}>
              <App values={values} />
            </Provider>
          );
        };
      })
      .when('the component is rendered', TestComponent => render(<TestComponent values={[1, 2, 3, 4]} />))
      .then('textContent should match', (_, { container }) =>
        expect(container).toHaveProperty('textContent', 'Odd (1)Even (2)Odd (3)Even (4)')
      )
      .when('the component is re-rendered with more components', (TestComponent, result) => {
        result.rerender(<TestComponent values={[1, 2, 3, 4, 5, 6]} />);

        return result;
      })
      .then('textContent should match', (_, { container }) =>
        expect(container).toHaveProperty('textContent', 'Odd (1)Even (2)Odd (3)Even (4)Odd (5)Even (6)')
      );
  },
  NodeTest
);
