import React, { type ReactNode } from 'react';
import { createChainOfResponsibility } from 'react-chain-of-responsibility';
import { wrapWith } from 'react-wrap-with';

type Props = { children?: ReactNode };

const { Provider, Proxy, types: _types } = createChainOfResponsibility<Set<string> | undefined, Props>();

const Bold = ({ children }: Props) => <strong>{children}</strong>;
const Italic = ({ children }: Props) => <i>{children}</i>;
const Plain = ({ children }: Props) => <>{children}</>;

const middleware: (typeof _types.middleware)[] = [
  () => next => request => {
    const Next = next(request);

    if (request?.has('bold')) {
      const Bolded = (props: Props) => <Bold>{Next && <Next {...props} />}</Bold>;

      Bolded.displayName = 'Bolded';

      return Bolded;
    }

    return Next;
  },
  () => next => request => {
    const nextValue = next(request);

    return request?.has('italic') && nextValue ? wrapWith(Italic)(nextValue) : nextValue;
  },
  () => () => () => Plain
];

const App = () => (
  <Provider middleware={middleware}>
    <Proxy request={new Set(['bold'])}>This is bold.</Proxy>
    <Proxy request={new Set(['italic'])}>This is italic.</Proxy>
    <Proxy request={new Set(['bold', 'italic'])}>This is bold and italic.</Proxy>
    <Proxy request={undefined}>This is plain.</Proxy>
  </Provider>
);

export default App;
