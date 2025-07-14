/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import React, { Component, Fragment } from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibilityAsRenderCallback';

type Props = { readonly children?: never };
type Request = string;

type MyComponentProps = Props & { request: string };

class MyComponent extends Component<MyComponentProps> {
  render() {
    return <Fragment>{this.props.request}</Fragment>;
  }
}

scenario('call enhancer() twice', bdd => {
  bdd
    .given('a TestComponent using chain of responsiblity', () => {
      const { Provider, Proxy, reactComponent } = createChainOfResponsibility<Request, Props>({
        passModifiedRequest: true
      });

      return function TestComponent() {
        return (
          <Provider middleware={[() => () => request => reactComponent(MyComponent, { request })]}>
            <Proxy request="Hello, World!" />
          </Provider>
        );
      };
    })
    .when('the component is rendered', TestComponent => render(<TestComponent />))
    .then('textContent should match', (_, { container }) =>
      expect(container).toHaveProperty('textContent', 'Hello, World!')
    );
});
