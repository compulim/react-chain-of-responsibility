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

function renderContainer1() {
  useEffect(() => {}, []);

  const [state] = useState(1);

  console.log('renderContainer1');

  return (
    <Container>
      <HelloWorldText />
      {state}
    </Container>
  );
}

function renderContainer2() {
  const [state] = useState(2);

  useEffect(() => {}, []);

  console.log('renderContainer2');

  return (
    <Container>
      <HelloWorldText />
      {state}
    </Container>
  );
}

type WrapperProps = { readonly fn: () => ReactNode };

const Wrapper = memo<WrapperProps>(({ fn }) => <>{fn()}</>);

function Test() {
  const [renderComponent, setRenderComponent] = useState<() => ReactNode>(() => renderContainer1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('-------------------');

      setRenderComponent(() => renderContainer2);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [setRenderComponent]);

  const renderFn = useMemo<() => ReactNode>(() => () => <Wrapper fn={renderComponent} />, [renderComponent]);

  return <>{renderFn()}</>;
}

export default memo(Test);
