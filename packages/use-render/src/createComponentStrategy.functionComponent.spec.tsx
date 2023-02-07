/** @jest-environment jsdom */

import { render, RenderResult } from '@testing-library/react';
import React from 'react';

import createComponentStrategy from './createComponentStrategy';
import wrapWith from './wrapWith';

import type { ComponentMiddleware } from './types';

type MediaProps = {
  alt?: string;
  contentType: string;
  'data-testid'?: string;
  url: string;
};

const Image = ({ alt, 'data-testid': dataTestID, url }: MediaProps) => {
  return <img alt={alt} data-testid={dataTestID} src={url} />;
};

const Video = ({ alt, 'data-testid': dataTestID, url }: MediaProps) => {
  return <video about={alt} data-testid={dataTestID} src={url} />;
};

const middleware: ComponentMiddleware<MediaProps>[] = [
  () => next => props => props.contentType.startsWith('image/') ? Image : next(props),
  () => next => props => props.contentType.startsWith('video/') ? Video : next(props)
];

const { Provider, Proxy, useComponent } = createComponentStrategy<MediaProps>();

const HookApp = wrapWith(Provider, { middleware })((props: MediaProps) => {
  const Media = useComponent()(props);

  return Media ? <Media {...props} /> : null;
});

const ProxyApp = wrapWith(Provider, { middleware })(Proxy);

describe('with function component', () => {
  describe.each(['hook', 'proxy'])('using %s to', type => {
    describe('render an image', () => {
      let result: RenderResult;

      beforeEach(() => {
        const App = type === 'hook' ? HookApp : ProxyApp;

        result = render(<App alt="a cat" contentType="image/jpeg" data-testid="media" url="/assets/cat.jpg" />);
      });

      test('should render <img alt="a cat" data-testid="media" src="/assets/cat.jpg">', () => {
        const image = result.getByTestId('media');

        expect(image.tagName).toBe('IMG');
        expect(image.getAttribute('alt')).toBe('a cat');
        expect(image.getAttribute('src')).toBe('/assets/cat.jpg');
      });
    });

    describe('render a video', () => {
      let result: RenderResult;

      beforeEach(() => {
        const App = type === 'hook' ? HookApp : ProxyApp;

        result = render(
          <App alt="cat chasing a dog" contentType="video/mp4" data-testid="media" url="/assets/cat.mp4" />
        );
      });

      test('should render <video about="cat chasing a dog" data-testid="media" src="/assets/cat.mp4">', () => {
        const video = result.getByTestId('media');

        expect(video.tagName).toBe('VIDEO');
        expect(video.getAttribute('about')).toBe('cat chasing a dog');
        expect(video.getAttribute('src')).toBe('/assets/cat.mp4');
      });
    });

    describe('render an unknown media', () => {
      let result: RenderResult;

      beforeEach(() => {
        const App = type === 'hook' ? HookApp : ProxyApp;

        result = render(<App contentType="application/octet-stream" data-testid="media" url="/assets/cat.zip" />);
      });

      test('should render nothing', () => {
        expect(result.queryByTestId('media')).toBeFalsy();
      });
    });
  });
});
