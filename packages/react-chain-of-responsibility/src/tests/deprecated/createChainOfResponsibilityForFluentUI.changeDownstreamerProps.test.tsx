import { render } from '@testing-library/react';
import { expect } from 'expect';
import { test } from 'node:test';
import React, { Fragment } from 'react';
import { withProps, wrapWith } from 'react-wrap-with';
import createChainOfResponsibilityForFluentUI from '../../createChainOfResponsibilityForFluentUI.tsx';

type Props = { thing: string };

test('pass modified props for next component should reflect the changes', () => {
  // GIVEN: A middleware which change "orange" into "citric fruit".
  const { Provider, useBuildRenderFunction } = createChainOfResponsibilityForFluentUI<Props>();

  const Inner = ({ thing }: Props) => useBuildRenderFunction()({ thing }, props => <Fragment>{props?.thing}</Fragment>);

  const App = wrapWith(
    withProps(Provider, {
      middleware: [
        // Turns "orange" into "citric fruit".
        () => next => props => {
          const NextComponent = next(props);

          if (NextComponent && props?.thing === 'orange') {
            return () => <NextComponent thing="citric fruit" />;
          }

          return NextComponent;
        }
      ]
    })
  )(Inner);

  // WHEN: Render "orange".
  const result = render(<App thing="orange" />);

  // THEN: It should render "citric fruit".
  expect(result.container).toHaveProperty('textContent', 'citric fruit');
});
