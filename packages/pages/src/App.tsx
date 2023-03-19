import React, { Fragment } from 'react';

import FluentDemo from './fluent/Demo';
import RowCounterDemo from './rowCounter/Demo';

const App = () => {
  return (
    <Fragment>
      <h1>Fluent UI demo</h1>
      <FluentDemo />
      <h1>Visible row counter demo</h1>
      <RowCounterDemo />
    </Fragment>
  );
};

export default App;
