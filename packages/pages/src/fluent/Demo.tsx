import { createChainOfResponsibility } from 'use-render';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { wrapWith } from 'react-wrap-with';
import React, { Fragment, useCallback } from 'react';

import CompassIcon from './CompassIcon';

import type { IButtonProps, IRenderFunction } from '@fluentui/react';

const { Provider, useComponent } = createChainOfResponsibility<IButtonProps | undefined>();

const Demo = () => {
  const getComponent = useComponent();
  const handleRenderChildren = useCallback<IRenderFunction<IButtonProps>>(
    (props?: IButtonProps, defaultRender?: IRenderFunction<IButtonProps>) => {
      const Component = getComponent(props);

      return Component ? <Component /> : defaultRender?.(props) || null;
    },
    []
  );

  return (
    <Fragment>
      <DefaultButton onRenderText={handleRenderChildren} text="CompassNW" />
      <DefaultButton onRenderText={handleRenderChildren} text="Orange" />
    </Fragment>
  );
};

export default wrapWith(Provider, {
  middleware: [
    () => next => buttonProps => buttonProps?.text === 'CompassNW' ? CompassIcon : next(buttonProps)
  ]
})(Demo);
