# `use-render`

A Strategy pattern for UI components in React.

## Background

Strategy pattern:

- In terms of input/output, all strategies in the same family are similar
   - All components shares the same type of props
   - All components renders same type of UI

## How to use

## API

```ts
```

## Behaviors

### All wrappers must have props of `children`

Wrappers must allow `children` props. This is because wrapper is going to wrap around another component in parent-child relationship.

If you are seeing the following error in TypeScript, please make sure the wrapper component allow `children` props. `React.PropsWithChildren<>` is a typing helper to add `children` to any props.

```
Argument of type 'FC<Props>' is not assignable to parameter of type 'false | ComponentType<PropsWithChildren<EmptyProps>> | null | undefined'.
  Type 'FunctionComponent<Props>' is not assignable to type 'FunctionComponent<PropsWithChildren<EmptyProps>>'.
    Types of property 'propTypes' are incompatible.
      ...
```

## Contributions

Like us? [Star](https://github.com/compulim/use-render/stargazers) us.

Want to make it better? [File](https://github.com/compulim/use-render/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/use-render/pulls) a pull request.
