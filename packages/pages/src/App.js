import React, { Fragment, useCallback } from 'react';
import { useRender } from 'use-render';

const App = () => {
  const readAlert = useRender();

  const handleClick = useCallback(() => readAlert('Hello, World!'), [readAlert]);

  return (
    <Fragment>
      <h1>useRender demo</h1>
      <button onClick={handleClick} type="button">
        Click me
      </button>
    </Fragment>
  );
};

export default App;
