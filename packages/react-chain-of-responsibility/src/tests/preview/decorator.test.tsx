/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { type ReactNode } from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: ReactNode | undefined };

function Bold({ children }: Props) {
  return <strong>{children}</strong>;
}

function Italic({ children }: Props) {
  return <i>{children}</i>;
}

function Text({ children }: Props) {
  return children;
}

type Request = ReadonlySet<'bold' | 'italic'>;

scenario('decorating downstreamer', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, Proxy, reactComponent, types: _types } = createChainOfResponsibility<Request, Props>();

      const middleware: readonly (typeof _types.middleware)[] = [
        () => next => request => {
          const renderNext = next(request);

          if (request.has('bold')) {
            return reactComponent(Bold, props => ({ children: renderNext?.render(props) }));
          }

          return renderNext;
        },
        () => next => request => {
          const renderNext = next(request);

          if (request.has('italic')) {
            return reactComponent(Italic, props => ({ children: renderNext?.render(props) }));
          }

          return renderNext;
        },
        () => () => () => {
          return reactComponent(Text);
        }
      ];

      return function TestComponent({ request }: { readonly request: Request }) {
        return (
          <Provider middleware={middleware}>
            <Proxy request={request}>Hello, World!</Proxy>
          </Provider>
        );
      };
    })
    .when('the component is rendered with "bold"', TestComponent =>
      render(<TestComponent request={new Set(['bold'])} />)
    )
    .then('should be bold', (_, { container }) =>
      expect(container).toHaveProperty('innerHTML', '<strong>Hello, World!</strong>')
    )
    .when('the component is rendered with both "bold" and "italic"', TestComponent =>
      render(<TestComponent request={new Set(['bold', 'italic'])} />)
    )
    .then('should be bold and italic', (_, { container }) =>
      expect(container).toHaveProperty('innerHTML', '<strong><i>Hello, World!</i></strong>')
    )
    .when('the component is rendered with nothing', TestComponent =>
      render(<TestComponent request={new Set()} />)
    )
    .then('should be plain text', (_, { container }) =>
      expect(container).toHaveProperty('innerHTML', 'Hello, World!')
    );
});
