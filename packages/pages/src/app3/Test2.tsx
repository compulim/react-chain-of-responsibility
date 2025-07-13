import React, { Fragment, memo, useEffect, useState, type ComponentType, type ReactNode } from 'react';

const HelloWorldText = memo(() => {
  console.log('3');

  return <Fragment>Hello, World!</Fragment>;
});

type Props = { children?: ReactNode | undefined };

const Container1 = memo(({ children }: Props) => {
  console.log('1a', children);

  return <div>{children}</div>;
});

const Container2 = memo(({ children }: Props) => {
  console.log('2b', children);

  return <div>{children}</div>;
});

function Test() {
  const [RenderingComponent, setRenderingComponent] = useState<ComponentType<any>>(() => Container1);

  useEffect(() => {
    const timeout = setTimeout(() => setRenderingComponent(() => Container2), 1000);

    return () => clearTimeout(timeout);
  }, [setRenderingComponent]);

  return <RenderingComponent><HelloWorldText /></RenderingComponent>;
}

export default memo(Test);
