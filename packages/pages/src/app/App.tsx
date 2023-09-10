import React from 'react';

import DecorationDemo from './decoration/Demo';
import FluentButtonDemo from './fluentButton/Demo';
import FluentDemo from './fluentDetailsList/Demo';
import LinkDecoratorDemo from './linkDecorator/Demo';
import RowCounterDemo from './rowCounter/Demo';
import SimpleDemo from './simple/Demo';

const App = () => {
  return (
    <main>
      <section>
        <h1>Simple demo</h1>
        <SimpleDemo />
      </section>
      <section>
        <h1>Decoration demo</h1>
        <DecorationDemo />
      </section>
      <section>
        <h1>Link decorator demo</h1>
        <LinkDecoratorDemo />
      </section>
      <section>
        <h1>Fluent UI &lt;DefaultButton&gt; demo</h1>
        <FluentButtonDemo />
      </section>
      <section>
        <h1>Fluent UI &lt;DetailsList&gt; demo</h1>
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
