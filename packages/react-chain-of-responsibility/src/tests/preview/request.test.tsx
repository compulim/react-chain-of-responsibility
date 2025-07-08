/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, type ReactNode } from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: never };

function Audio() {
  return <Fragment>Audio</Fragment>;
}

function Video() {
  return <Fragment>Video</Fragment>;
}

function Binary() {
  return <Fragment>Binary</Fragment>;
}

type PassthroughProps = Props & { readonly renderNext: () => ReactNode };

function Passthrough({ renderNext }: PassthroughProps) {
  return <Fragment>{renderNext()}</Fragment>;
}

scenario('hoisting request to props', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, Proxy, types: _types } = createChainOfResponsibility<string, Props>();

      const middleware: readonly (typeof _types.middleware)[] = [
        () => next => request => {
          if (request.startsWith('audio/')) {
            return [Audio];
          }

          const renderNext = next(request);

          return [Passthrough as typeof _types.component, () => ({ renderNext })];
        },
        () => next => request => {
          if (request.startsWith('video/')) {
            return [Video];
          }

          const renderNext = next(request);

          return [Passthrough as typeof _types.component, () => ({ renderNext })];
        },
        () => () => () => {
          return [Binary];
        }
      ];

      return function TestComponent() {
        return (
          <Provider middleware={middleware}>
            <Proxy request="audio/mp3" />
            <Proxy request="video/mp4" />
            <Proxy request="application/json" />
          </Provider>
        );
      };
    })
    .when('the component is rendered', TestComponent => render(<TestComponent />))
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', 'AudioVideoBinary')
    );
});
