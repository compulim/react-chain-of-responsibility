# `use-render`

[Chain of responsibility design pattern]9https://refactoring.guru/design-patterns/chain-of-responsibility) for React component customization.

## Background

This package is designed for UI component package developers to enable component customization via composition using the [chain of responsibility design pattern](https://refactoring.guru/design-patterns/chain-of-responsibility).

Additional helper hook is provided to use with [Fluent UI `IRenderFunction`](https://github.com/microsoft/fluentui/blob/master/packages/utilities/src/IRenderFunction.ts).

By composing customizations, they can be decoupled and published separately. App developers could import these published customizations and orchestrate them to their needs. This pattern encourage [separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns) and enables economy of customization.

## Demo

Click here for [our live demo](https://compulim.github.io/use-render/).

## How to use

```tsx
import { createChainOfResponsibility } from 'use-render';

// Creates a <Provider> to contain all elements.
const { Provider, Proxy } = createChainOfResponsibility();

// List of subcomponents.
const Bold = ({ children }) => <strong>{children}</strong>;
const Italic = ({ children }) => <i>{children}</i>;
const Plain = ({ children }) => <>{children}</>;

// Constructs an array of middleware to handle the request and return corresponding subcomponents.
const middleware = [
  () => next => request => request === 'bold' ? Bold : next(request),
  () => next => request => request === 'italic' ? Italic : next(request),
  () => () => () => Plain
];

render(
  <Provider middleware={middleware}>
    <Proxy request="bold">This is bold.</Proxy>
    <Proxy request="italic">This is italic.</Proxy>
    <Proxy>This is plain.</Proxy>
  </Provider>
);
```

### Using as Fluent UI `IRenderFunction`

The chain of responsibility can be used in Fluent UI. `useRenderFunctionCallback` hook will return render function as `IRenderFunction`.

There are subtle differences between the standard version and the Fluent UI version:

- Entrypoint is `createChainOfResponsibilityForFluentUI`
- Request and props are always of same type
  - Request is optional, as defined in [`IRenderFunction`](https://github.com/microsoft/fluentui/blob/master/packages/utilities/src/IRenderFunction.ts)
- Auto-fallback to `defaultRender` of `IRenderFunction`

```tsx
import { createChainOfResponsibilityForFluentUI } from 'use-render';

// Creates a <Provider> to contain all elements.
const { Provider, Proxy } = createChainOfResponsibilityForFluentUI();

// List of subcomponents.
const Banana = () => <>🍌</>;
const Orange = () => <>🍊</>;

// Constructs an array of middleware to handle the request and return corresponding subcomponents.
const middleware = [
  () => next => props => props?.iconProps?.iconName === 'Banana' ? Banana : next(props),
  () => next => props => props?.iconProps?.iconName === 'Orange' ? Orange : next(props)
  // Fallback to `defaultRender` of `IRenderFunction` is automatically injected by the hook.
];

const Inner = () => {
  const renderIconFunction = useRenderFunctionCallback();

  return (
    <Fragment>
      <DefaultButton iconProps={{ iconName: 'Banana' }} onRenderIcon={renderIconFunction} />
      <DefaultButton iconProps={{ iconName: 'Orange' }} onRenderIcon={renderIconFunction} />
      <DefaultButton iconProps={{ iconName: 'OpenInNewTab' }} onRenderIcon={renderIconFunction} />
    </Fragment>
  );
};

render(
  <Provider middleware={middleware}>
    <Inner />
  </Provider>
);
```

## API

```tsx
function createChainOfResponsibility<Request = undefined, Props = { children?: never }, Init = undefined>(
  options?: Options
): {
  Provider: ComponentType<ProviderProps<Request, Props, Init>>;
  Proxy: ComponentType<ProxyProps<Request, Props>>;
  types: {
    init: Init;
    middleware: ComponentMiddleware<Request, Props, Init>;
    props: Props;
    request: Request;
  };
  useBuildComponent: () => UseBuildComponent<Request, Props>;
};
```

### Options

```tsx
type Options = {
  /** Allows a middleware to pass another request object when calling its next middleware. Default is disabled. */
  allowModifiedRequest?: boolean;
};
```

### API of `useBuildComponent`

```tsx
type UseBuildComponentOptions<Props> = { defaultComponent?: ComponentType<Props> | false | null | undefined };

type UseBuildComponent<Request, Props> = (
  request: Request,
  options?: UseBuildComponentOptions<Props>
) => ComponentType<Props> | false | null | undefined;
```

### Using as Fluent UI `IRenderFunction`

```tsx
export default function createChainOfResponsibilityForFluentUI<Props extends {}, Init = undefined>(
  options?: Options
): ReturnType<typeof createChainOfResponsibility<Props | undefined, Props, Init>> & {
  useRenderFunctionCallback: UseRenderFunctionCallback<Props>;
};
```

#### API of `useRenderFunctionCallback`

```ts
type UseRenderFunctionCallbackOptions<Props> = { getKey?: (props: Props | undefined) => Key };

type UseRenderFunctionCallback<Props> = (options?: UseRenderFunctionCallbackOptions<Props>) => IRenderFunction<Props>;
```

## Designs

## Behaviors

## Contributions

Like us? [Star](https://github.com/compulim/use-render/stargazers) us.

Want to make it better? [File](https://github.com/compulim/use-render/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/use-render/pulls) a pull request.
