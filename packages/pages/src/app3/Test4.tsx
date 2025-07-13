// Decorate downstreamer

import React, { Fragment, memo, useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';

const HelloWorldText = memo(() => {
  console.log('3 ------------ Hello, World!');

  return <Fragment>Hello, World!</Fragment>;
});

type Props = { children?: ReactNode | undefined };

const Container = memo(({ children }: Props) => {
  console.log('1a', children);

  return <div>{children}</div>;
});

const Strong = memo(({ children }: { children: ReactNode }) => {
  return <strong>{children}</strong>;
});

const upstream = next => request => {
  const Downstreamer = next(request);

  // Return render function so it can lock down on props.
  return () => {
    return (
      <Strong>
        <Downstreamer />
      </Strong>
    );
  };
};

function Test() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('-------------------');

      setRenderComponent(() => renderContainer2);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [setRenderComponent]);

  const renderFn = useMemo<() => ReactNode>(
    () => () => <Wrapper key={Date.now()} fn={renderComponent} />,
    [renderComponent]
  );

  return <>{renderFn()}</>;
}

export default memo(Test);
