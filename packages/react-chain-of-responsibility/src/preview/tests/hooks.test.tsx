/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, useEffect, useState } from 'react';

import createChainOfResponsibility, { type InferMiddleware } from '../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: never };
type Request = string;

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

scenario('middleware use hooks while changing request', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, Proxy, reactComponent } = createChainOfResponsibility<Request, Props>();

      const middleware: readonly InferMiddleware<typeof Provider>[] = [
        () => next => request => {
          if (request.startsWith('audio/')) {
            return reactComponent(Audio);
          }

          return next(request);
        },
        () => next => request => {
          if (request.startsWith('video/')) {
            return reactComponent(Video);
          }

          return next(request);
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
