import React, { Fragment, useCallback, useMemo, useState, type FormEventHandler } from 'react';
import { createChainOfResponsibility } from 'react-chain-of-responsibility';

const { Provider, types, useBuildComponentCallback } = createChainOfResponsibility<number>();

type Props = { items: number[] };

const Inner = ({ items }: Props) => {
  const buildComponent = useBuildComponentCallback();

  const components = useMemo(() => items.map(value => buildComponent(value)), [buildComponent, items]);

  const visibleComponents = useMemo(
    () => components.filter(Boolean) as Exclude<(typeof components)[0], false | null | undefined>[],
    [components]
  );

  return (
    <Fragment>
      <ul>
        {visibleComponents.map((Component, index) => (
          <li key={index}>
            <Component />
          </li>
        ))}
      </ul>
      <div>Number of visible rows: {visibleComponents.length}</div>
    </Fragment>
  );
};

const Demo = () => {
  const [evenOnly, setEvenOnly] = useState(false);
  const [items] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  const handleEvenOnlyChange = useCallback<FormEventHandler<HTMLInputElement>>(
    ({ currentTarget: { checked } }) => setEvenOnly(checked),
    [setEvenOnly]
  );
  const middleware = useMemo<(typeof types.middleware)[]>(() => {
    const middleware: (typeof types.middleware)[] = [];

    evenOnly &&
      middleware.push(() => next => value => {
        if (value % 2) {
          return false;
        }

        return next(value);
      });

    middleware.push(() => () => value => {
      const Component = () => <Fragment>{value}</Fragment>;

      Component.displayName = 'Component';

      return Component;
    });

    return middleware;
  }, [evenOnly]);

  return (
    <Fragment>
      <div>
        <label>
          <input checked={evenOnly} onChange={handleEvenOnlyChange} type="checkbox" /> Show even number only
        </label>
      </div>
      <Provider middleware={middleware}>
        <Inner items={items} />
      </Provider>
    </Fragment>
  );
};

export default Demo;
