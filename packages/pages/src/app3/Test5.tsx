import React, { Fragment, memo, useEffect, useState, type ComponentType, type ReactNode } from 'react';

const HelloWorldText = memo(() => {
  console.log('3 ------------ Hello, World!');

  return <Fragment>Hello, World!</Fragment>;
});

type Props = { children?: ReactNode | undefined };

const Buttonize = memo(({ children, type }: { children?: ReactNode | undefined; type: Request }) => {
  console.log('1 ---------- Buttonize');

  return <button type={type}>{children}</button>;
});

type Request = 'button' | 'submit';
type RenderFn = () => ReactNode | undefined;

// type Fn = (request: Request) => [ComponentType<Props>, Props];

type Enhancer<P extends object> = (next: (request: Request) => RenderFn) => (request: Request) => [ComponentType<P>, P];

const upstream: Enhancer<Props & { type: Request }> = next => request => {
  const renderNext = next(request);

  return [Buttonize, { children: renderNext(), type: request }] as const;
};

const Strongize = memo(() => {
  console.log('2 ------------- strongize');

  return (
    <strong>
      <HelloWorldText />
    </strong>
  );
});

const downstream: Enhancer<Props> = _next => _request => {
  return [Strongize, { children: undefined }] as const;
};

const renderRequest = (request: Request) => {
  const upstreamResult = upstream(() => {
    const downstreamResult = downstream(() => {
      throw new Error('Should not call');
    })(request);

    const [DownstreamComponent] = downstreamResult;

    return () => <DownstreamComponent />;
  });

  const [UpstreamComponent, props] = upstreamResult(request);

  return <UpstreamComponent {...props} />;
};

function Test() {
  const [renderComponent, setRenderComponent] = useState<ReactNode>(() => renderRequest('button'));

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('0 ---------------- TIMEOUT');

      setRenderComponent(() => renderRequest('submit'));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [setRenderComponent]);

  return <>{renderComponent}</>;
}

export default memo(Test);
