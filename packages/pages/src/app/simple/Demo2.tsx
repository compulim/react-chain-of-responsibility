import React, { type ReactNode } from 'react';
import { createChainOfResponsibility } from 'react-chain-of-responsibility';

type Props = { children?: ReactNode };
type Request = string | undefined;

const { asMiddleware, Provider, Proxy, types: _types } = createChainOfResponsibility<Request, Props>();

const Plain = ({ children }: Props) => <>{children}</>;

const Bold = ({ children, middleware }: typeof _types.middlewareComponentProps) =>
  middleware.request === 'bold' ? <strong>{children}</strong> : <middleware.Next />;

const Italic = ({ children }: Props) => <i>{children}</i>;

const middleware = Object.freeze([
  asMiddleware(Bold),
  () => next => request => (request === 'italic' ? Italic : next(request)),
  () => () => () => Plain
] satisfies (typeof _types.middleware)[]);

const App = () => (
  <Provider middleware={middleware}>
    <Proxy request="bold">This is bold.</Proxy> <Proxy request="italic">This is italic.</Proxy>{' '}
    <Proxy>This is plain.</Proxy>
  </Provider>
);

export default App;
