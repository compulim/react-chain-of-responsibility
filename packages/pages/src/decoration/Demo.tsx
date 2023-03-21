import { createChainOfResponsibility } from 'react-chain-of-responsibility';
import { wrapWith } from 'react-wrap-with';
import React from 'react';

import type { ReactNode } from 'react';

type Props = { children?: ReactNode };

const { Provider, Proxy, types } = createChainOfResponsibility<Set<string> | undefined, Props>();

const Bold = ({ children }: Props) => <strong>{children}</strong>;
const Italic = ({ children }: Props) => <i>{children}</i>;
const Plain = ({ children }: Props) => <>{children}</>;

const middleware: (typeof types.middleware)[] = [
  () => next => request => {
    const Next = next(request);

    if (request?.has('bold')) {
      return props => <Bold>{Next && <Next {...props} />}</Bold>;
    }

    return Next;
  },
  () => next => request => wrapWith(request?.has('italic') && Italic)(next(request)),
  () => () => () => Plain
];

const App = () => (
  <Provider middleware={middleware}>
    <Proxy request={new Set(['bold'])}>This is bold.</Proxy>
    <Proxy request={new Set(['italic'])}>This is italic.</Proxy>
    <Proxy request={new Set(['bold', 'italic'])}>This is bold and italic.</Proxy>
    <Proxy>This is plain.</Proxy>
  </Provider>
);

export default App;
