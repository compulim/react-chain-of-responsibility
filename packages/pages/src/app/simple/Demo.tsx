import React, { type ReactNode } from 'react';
import { createChainOfResponsibility } from 'react-chain-of-responsibility';

type Props = { children?: ReactNode };

const { Provider, Proxy, types: _types } = createChainOfResponsibility<string | undefined, Props>();

const Bold = ({ children }: Props) => <strong>{children}</strong>;
const Italic = ({ children }: Props) => <i>{children}</i>;
const Plain = ({ children }: Props) => <>{children}</>;

const middleware: (typeof _types.middleware)[] = [
  () => next => request => (request === 'bold' ? Bold : next(request)),
  () => next => request => (request === 'italic' ? Italic : next(request)),
  () => () => () => Plain
];

const App = () => (
  <Provider middleware={middleware}>
    <Proxy request="bold">This is bold.</Proxy> <Proxy request="italic">This is italic.</Proxy>{' '}
    <Proxy request={undefined}>This is plain.</Proxy>
  </Provider>
);

export default App;
