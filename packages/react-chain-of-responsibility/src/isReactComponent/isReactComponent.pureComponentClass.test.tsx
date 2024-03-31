import React, { PureComponent } from 'react';

import isReactComponent from '../isReactComponent';

test('component class should return true', () => {
  class ComponentClass extends PureComponent {
    override render() {
      return <div>Hello, World!</div>;
    }
  }

  expect(isReactComponent(ComponentClass)).toBe(true);
});
