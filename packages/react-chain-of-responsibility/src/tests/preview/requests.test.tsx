
import { test } from 'node:test';
import expect from 'expect';
import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment } from 'react';

import createChainOfResponsibility, { type InferMiddleware } from '../../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: never };
type Request = string;

function Audio() {
  return <Fragment>Audio</Fragment>;
}

function Video() {
  return <Fragment>Video</Fragment>;
}

function Binary() {
  return <Fragment>Binary</Fragment>;
}

scenario('multiple requests', bdd => {
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
        },
        () => () => () => {
          return reactComponent(Binary);
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
