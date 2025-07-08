/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, useEffect, useState, type ReactNode } from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: never };

function Audio() {
  // Audio is running useEffect hook.
  useEffect(() => {});

  return <Fragment>Audio</Fragment>;
}

function Video() {
  // Video is running useState hook.
  useState(() => 'Hello, World!');

  return <Fragment>Video</Fragment>;
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
        }
      ];

      return function TestComponent({ type }: { readonly type: string }) {
        return (
          <Provider middleware={middleware}>
            <Proxy request={type} />
          </Provider>
        );
      };
    })
    .when('the component is rendered as audio', TestComponent => render(<TestComponent type="audio/mp3" />))
    .then('textContent should match', (_, { container }) => expect(container).toHaveProperty('textContent', 'Audio'))
    .when('the component is rendered as video', (TestComponent, result) => {
      // When changing the type, the rendering component will be changed.
      // <Audio> and <Video> component use different hook.
      // As they should be wrapped in their own component, changing which hook to run must not throw.
      result.rerender(<TestComponent type="video/mp4" />);

      return result;
    })
    .then('textContent should match', (_, { container }) => expect(container).toHaveProperty('textContent', 'Video'));
});
