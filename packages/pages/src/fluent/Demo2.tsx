import { createChainOfResponsibility } from 'use-render';
import { DetailsList } from '@fluentui/react/lib/DetailsList';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { Link } from '@fluentui/react/lib/Link';
import { mergeStyles } from '@fluentui/react/lib/Styling';
import { Rating } from '@fluentui/react/lib/Rating';
import React, { useCallback, useMemo } from 'react';

import type { IColumn, IDetailsColumnFieldProps, IRenderFunction } from '@fluentui/react';

initializeIcons();

const cellClassName = mergeStyles({ paddingLeft: 12 });

function createFluentRenderFunction(options: {
  useComponent: typeof useComponent;
}): IRenderFunction<Exclude<typeof types.request, undefined>> {
  const getComponent = options.useComponent();

  return useCallback(
    (props, defaultRender) => {
      const Component = getComponent(props, {
        defaultComponent: defaultRender && (() => defaultRender(props))
      });

      return Component ? <Component /> : null;
    },
    [getComponent]
  );
}

const { Provider, types, useComponent } = createChainOfResponsibility<IDetailsColumnFieldProps | undefined>();

const renderFunction = createFluentRenderFunction({ useComponent });

const COLUMNS: IColumn[] = [
  { fieldName: 'fruit', key: 'fruit', minWidth: 0, name: 'Fruit' },
  { fieldName: 'rating', key: 'rating', minWidth: 0, name: 'Rating' }
];

const ITEMS = [
  { fruit: 'Apple', rating: false },
  { fruit: 'Banana', rating: true },
  { fruit: 'Orange', rating: false }
];

const decorateFieldWithLink: typeof types.middleware = () => next => fieldProps => {
  if (fieldProps?.item.fruit === 'Orange') {
    return () => <Link className={cellClassName}>Orange 🍊</Link>;
  }

  return next(fieldProps);
};

const decorateFieldWithRating: typeof types.middleware = () => next => fieldProps => {
  if (fieldProps?.column.fieldName === 'rating') {
    return fieldProps?.item.rating && (() => <Rating className={cellClassName} />);
  }

  return next(fieldProps);
};

const InnerDemo = () => {
  return <DetailsList columns={COLUMNS} items={ITEMS} onRenderField={renderFunction} />;
};

const Demo = () => {
  const middleware = useMemo(() => [decorateFieldWithRating, decorateFieldWithLink], []);

  return (
    <Provider middleware={middleware}>
      <InnerDemo />
    </Provider>
  );
};

export default Demo;
