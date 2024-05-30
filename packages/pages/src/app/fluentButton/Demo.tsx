import { DefaultButton } from '@fluentui/react/lib/Button';
import React, { Fragment } from 'react';
import { createChainOfResponsibilityForFluentUI } from 'react-chain-of-responsibility/fluentUI';

import type { IButtonProps } from '@fluentui/react';

// Creates a <Provider> to contain all elements.
const { Provider, types, useBuildRenderFunction } = createChainOfResponsibilityForFluentUI<IButtonProps>();

// List of subcomponents.
const Banana = () => <Fragment>🍌</Fragment>;
const Orange = () => <Fragment>🍊</Fragment>;

// Constructs an array of middleware to handle the request and return corresponding subcomponents.
// Fallback to `defaultRender` of `IRenderFunction` is handled by the hook.
const middleware: (typeof types.middleware)[] = [
  () => next => props => (props?.iconProps?.iconName === 'Banana' ? Banana : next(props)),
  () => next => props => (props?.iconProps?.iconName === 'Orange' ? Orange : next(props))
];

const Inner = () => {
  const renderIconFunction = useBuildRenderFunction();

  return (
    <Fragment>
      <DefaultButton iconProps={{ iconName: 'Banana' }} onRenderIcon={renderIconFunction} />
      <DefaultButton iconProps={{ iconName: 'Orange' }} onRenderIcon={renderIconFunction} />
      <DefaultButton iconProps={{ iconName: 'OpenInNewTab' }} onRenderIcon={renderIconFunction} />
    </Fragment>
  );
};

const App = () => (
  <Provider middleware={middleware}>
    <Inner />
  </Provider>
);

export default App;
