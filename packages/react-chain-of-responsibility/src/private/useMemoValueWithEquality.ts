import { useEffect, useRef } from 'react';

const NOT_INITIALIZED = Symbol();

export default function useMemoValueWithEquality<T>(factory: () => T, equalityFn: (x: T, y: T) => boolean): T {
  const prevRef = useRef<T | typeof NOT_INITIALIZED>(NOT_INITIALIZED);
  const next: T = factory();
  let current: T;

  if (prevRef.current !== NOT_INITIALIZED && equalityFn(prevRef.current, next)) {
    current = prevRef.current;
  } else {
    current = next;
  }

  useEffect(() => {
    prevRef.current = current;
  });

  return current;
}
