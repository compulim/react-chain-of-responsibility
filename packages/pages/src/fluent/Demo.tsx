import { createChainOfResponsibilityForFluentUI } from 'use-render';
import { DetailsList } from '@fluentui/react/lib/DetailsList';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { Link } from '@fluentui/react/lib/Link';
import { mergeStyles } from '@fluentui/react/lib/Styling';
import { Rating } from '@fluentui/react/lib/Rating';
import React, { Fragment, useCallback, useMemo, useState } from 'react';

import type { FormEventHandler } from 'react';
import type { IColumn, IDetailsColumnFieldProps } from '@fluentui/react';

initializeIcons();

const cellClassName = mergeStyles({ paddingBottom: 4, paddingLeft: 12, paddingTop: 4 });

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
  const renderFunction = useRenderFunctionCallback({
    // Key generation logic adopted from https://github.com/microsoft/fluentui/blob/7fde5c94869ff9841b142b7ff1d0a3df0ab58f74/packages/react/src/components/DetailsList/DetailsRowFields.tsx#L61.
    getKey: request =>
      `${request?.column.key}${typeof request?.cellValueKey !== undefined ? `-${request?.cellValueKey}` : ''}`
  });

  return <DetailsList columns={COLUMNS} items={ITEMS} onRenderField={renderFunction} />;
};

const Demo = () => {
  const [shouldDecorateNameColumn, setShouldDecorateNameColumn] = useState(true);
  const [shouldDecorateRatingColumn, setShouldDecorateRatingColumn] = useState(true);
  const middleware = useMemo<(typeof types.middleware)[]>(() => {
    const middleware = [];

    shouldDecorateNameColumn && middleware.push(decorateFieldWithLink);
    shouldDecorateRatingColumn && middleware.push(decorateFieldWithRating);

    return middleware;
  }, [shouldDecorateNameColumn, shouldDecorateRatingColumn]);

  const handleShouldDecorateNameColumnChange = useCallback<FormEventHandler<HTMLInputElement>>(
    ({ currentTarget: { checked } }) => setShouldDecorateNameColumn(checked),
    [setShouldDecorateNameColumn]
  );

  const handleShouldDecorateRatingColumnChange = useCallback<FormEventHandler<HTMLInputElement>>(
    ({ currentTarget: { checked } }) => setShouldDecorateRatingColumn(checked),
    [setShouldDecorateRatingColumn]
  );

  return (
    <Fragment>
      <div>
        <label>
          <input checked={shouldDecorateNameColumn} onChange={handleShouldDecorateNameColumnChange} type="checkbox" />{' '}
          Decorate name column
        </label>
      </div>
      <div>
        <label>
          <input
            checked={shouldDecorateRatingColumn}
            onChange={handleShouldDecorateRatingColumnChange}
            type="checkbox"
          />{' '}
          Decorate rating column
        </label>
      </div>
      <Provider middleware={middleware}>
        <Inner />
      </Provider>
    </Fragment>
  );
};

export default Demo;
