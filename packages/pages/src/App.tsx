import React from 'react';

import FluentDemo from './fluent/Demo';
import LinkDecoratorDemo from './linkDecorator/Demo';
import RowCounterDemo from './rowCounter/Demo';

const App = () => {
  return (
    <main>
      <section>
        <h1>Link decorator demo</h1>
        <LinkDecoratorDemo />
      </section>
      <section>
        <h1>Fluent UI demo</h1>
        <FluentDemo />
      </section>
      <section>
        <h1>Visible row counter demo</h1>
        <RowCounterDemo />
      </section>
    </main>
  );
};

export default App;
