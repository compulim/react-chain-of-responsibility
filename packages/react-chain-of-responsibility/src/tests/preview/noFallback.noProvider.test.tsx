/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Fragment, type ComponentType } from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibilityAsRenderCallback';

type Props = {
  readonly children?: never;
  readonly value: number;
};
type Request = void;

scenario('rendering fallback component using useBuildRenderCallback() without <Provider>', bdd => {
  bdd
    .given('a chain of responsiblity', () => createChainOfResponsibility<Request, Props>())
    .and.oneOf<{ TestComponent: ComponentType<{ readonly children?: never }> }>([
      [
        'a <TestComponent> rendered using <Proxy>',
        ({ Proxy }) => ({
          TestComponent: function TestComponent() {
            return <Proxy request={undefined} value={1} />;
          }
        })
      ],
      [
        'a <TestComponent> rendered using useBuildRenderCallback()',
        ({ useBuildRenderCallback }) => ({
          TestComponent: function TestComponent() {
            const render = useBuildRenderCallback()(undefined);

            expect(render).toBeFalsy();

            return <Fragment>{render?.({ value: 1 })}</Fragment>;
          }
        })
      ]
    ])
    .and(
      'a console.warn spy',
      ({ TestComponent }) => ({
        TestComponent,
        warn: jest.spyOn(console, 'warn').mockImplementation(() => {})
      }),
      ({ warn }) => warn.mockRestore()
    )
    .when('the component is rendered', ({ TestComponent }) => render(<TestComponent />))
    .then('textContent should match', (_, { container }) => expect(container).toHaveProperty('textContent', ''))
    .and('should print warning once', ({ warn }) => expect(warn).toHaveBeenCalledTimes(1))
    .and('should print warning message', ({ warn }) =>
      expect(warn).toHaveBeenLastCalledWith(
        expect.stringContaining('the request has fall through all middleware, set "fallbackComponent" as a catchall'),
        undefined
      )
    );
});
