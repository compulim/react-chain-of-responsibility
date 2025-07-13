import React, { Fragment, memo, useEffect, useState, type ReactNode } from 'react';

const HelloWorldText = memo(() => {
  console.log('3');

  return <Fragment>Hello, World!</Fragment>;
});

type Props = { children?: ReactNode | undefined };

const Container = memo(({ children }: Props) => {
  console.log('1a', children);

  return <div>{children}</div>;
});

function renderContainer1() {
  console.log('renderContainer1');

  return (
    <Container>
      <HelloWorldText />
    </Container>
  );
}

function renderContainer2() {
  console.log('renderContainer2');

  return (
    <Container>
      <HelloWorldText />
    </Container>
  );
}

function Test() {
  const [renderComponent, setRenderComponent] = useState<(() => ReactNode) | undefined>(() => renderContainer1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('-------------------');

      setRenderComponent(() => renderContainer2);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [setRenderComponent]);

  return <>{renderComponent?.()}</>;
}

export default memo(Test);
