import { createChainOfResponsibilityForFluentUI } from 'use-render';
import { DetailsList } from '@fluentui/react/lib/DetailsList';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { Link } from '@fluentui/react/lib/Link';
import { mergeStyles } from '@fluentui/react/lib/Styling';
import { Rating } from '@fluentui/react/lib/Rating';
import React, { useMemo } from 'react';

import type { IColumn, IDetailsColumnFieldProps } from '@fluentui/react';

initializeIcons();

const cellClassName = mergeStyles({ paddingLeft: 12 });

const { Provider, types, useRenderFunctionCallback } =
  createChainOfResponsibilityForFluentUI<IDetailsColumnFieldProps>();

const COLUMNS: IColumn[] = [
  { fieldName: 'name', key: 'name', minWidth: 0, name: 'Fruit' },
  { fieldName: 'rating', key: 'rating', minWidth: 0, name: 'Rating' }
];

type Item = {
  canClick?: boolean;
  name: string;
  rating?: number;
};

const ITEMS: Item[] = [
  { name: 'Apple' },
  { name: 'Banana', rating: 4.5 },
  { name: 'Orange', canClick: true, rating: 3.5 }
];

const decorateFieldWithLink: typeof types.middleware = () => next => request => {
  const NextComponent = next(request);

  if (request?.column.fieldName === 'name' && request?.item.canClick) {
    return props => <Link>{NextComponent && <NextComponent {...props} />}</Link>;
  }

  return NextComponent;
};

const ItemRating = ({ item }: { item: Item }) => (
  <Rating className={cellClassName} rating={item.rating} readOnly={true} />
);

const decorateFieldWithRating: typeof types.middleware = () => next => request => {
  if (request?.column.fieldName === 'rating') {
    if (request?.item.rating) {
      return ItemRating;
    }

    const NextComponent = next(request);

    return NextComponent && (props => <NextComponent {...props} item={{ ...props.item, rating: 'Not rated' }} />);
  }

  return next(request);
};

const Inner = () => {
  // Key generation logic adopted from https://github.com/microsoft/fluentui/blob/7fde5c94869ff9841b142b7ff1d0a3df0ab58f74/packages/react/src/components/DetailsList/DetailsRowFields.tsx#L61.
  const renderFunction = useRenderFunctionCallback({
    getKey: request =>
      `${request?.column.key}${typeof request?.cellValueKey !== undefined ? `-${request?.cellValueKey}` : ''}`
  });

  // Currently, there is a bug in Fluent UI.
  // When we pass a different function to the "onRenderField" prop, it will not re-render the <DetailsList>.
  return <DetailsList columns={COLUMNS} items={ITEMS} onRenderField={renderFunction} />;
};

const Demo = () => {
  const middleware = useMemo(() => [decorateFieldWithRating, decorateFieldWithLink], []);

  return (
    <Provider middleware={middleware}>
      <Inner />
    </Provider>
  );
};

export default Demo;
