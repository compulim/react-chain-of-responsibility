import { scenario } from '@testduet/given-when-then';

import arePropsEqual from './arePropsEqual';

scenario('arePropsEqual()', bdd =>
  bdd
    .given('2 contentful equal props', () => ({
      first: { abc: 123 },
      second: { abc: 123 }
    }))
    .when('arePropsEqual() is called', ({ first, second }) => arePropsEqual(first, second))
    .then('should return true', (_, result) => expect(result).toBe(true))
);

scenario('arePropsEqual()', bdd =>
  bdd
    .given('2 props of same reference', () => {
      const props = { abc: 123 };

      return {
        first: props,
        second: props
      };
    })
    .when('arePropsEqual() is called', ({ first, second }) => arePropsEqual(first, second))
    .then('should return true', (_, result) => expect(result).toBe(true))
);

scenario('arePropsEqual()', bdd =>
  bdd
    .given('2 props with first prop larger than second prop', () => ({
      first: { abc: 123, xyz: 789 },
      second: { abc: 123 }
    }))
    .when('arePropsEqual() is called', ({ first, second }) => arePropsEqual(first, second))
    .then('should return false', (_, result) => expect(result).toBe(false))
);

scenario('arePropsEqual()', bdd =>
  bdd
    .given('2 props with second prop larger than first prop', () => ({
      first: { abc: 123 },
      second: { abc: 123, xyz: 789 }
    }))
    .when('arePropsEqual() is called', ({ first, second }) => arePropsEqual(first, second))
    .then('should return false', (_, result) => expect(result).toBe(false))
);
