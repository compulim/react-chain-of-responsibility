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

The chain of responsibility can be used in Fluent UI. After calling `createChainOfResponsibilityForFluentUI`, the returned `useBuildRenderFunction` hook, when called, will build a function to use as [`IRenderFunction`](https://github.com/microsoft/fluentui/blob/master/packages/utilities/src/IRenderFunction.ts).

There are subtle differences between the standard version and the Fluent UI version:

- Entrypoint is `createChainOfResponsibilityForFluentUI()`
- Request and props are always of same type
  - It is optional, this is defined in [`IRenderFunction`](https://github.com/microsoft/fluentui/blob/master/packages/utilities/src/IRenderFunction.ts)
- Auto-fallback to `defaultRender`

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
  // Fallback to `defaultRender` of `IRenderFunction` is automatically injected.
];

const Inner = () => {
  const renderIconFunction = useBuildRenderFunction();

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

### Return value

| Name                | Type                                     | Description                                                                           |
| ------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------- |
| `Provider`          | `React.ComponentType`                    | Entrypoint component, must wraps all usage of customizations                          |
| `Proxy`             | `React.ComponentType`                    | Proxy component, process the `request` from props and morph into the result component |
| `useBuildComponent` | `() => (request) => React.ComponentType` | Callback hook to build the component for rendering the result                         |
| `types`             | `{ init, middleware, props, request }`   | TypeScript: shorthand types, all objects are `undefined` intentionally                |

### Options

```tsx
type Options = {
  /** Allows a middleware to pass another request object when calling its next middleware. Default is disabled. */
  allowModifiedRequest?: boolean;
};
```

If `allowModifiedRequest` is unset or `false`, middleware will not be allowed to pass another reference of `request` object to the `next()` middleware. However, middleware can still modify the `request` object to influence the next middleware. It is recommended to follow immutable pattern when handling request object, or use deep `Object.freeze` to guarantee immutability.

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
  useBuildRenderFunction: useBuildRenderFunction<Props>;
};
```

#### Return value

| Name                     | Type                                     | Description                                                      |
| ------------------------ | ---------------------------------------- | ---------------------------------------------------------------- |
| `useBuildRenderFunction` | `({ getKey }) => IRenderFunction<Props>` | Callback hook to build the `IRenderFunction` to use in Fluent UI |

#### API of `useBuildRenderFunction`

```ts
type UseBuildRenderFunctionOptions<Props> = { getKey?: (props: Props | undefined) => Key };

type UseBuildRenderFunction<Props> = (options?: UseBuildRenderFunctionOptions<Props>) => IRenderFunction<Props>;
```

`getKey` is required for some render functions. These functions are usually used to render multiple elements, such as [`DetailsList.onRenderField`](https://developer.microsoft.com/en-us/fluentui#/controls/web/detailslist#implementation), which renders every field (a.k.a. cell) in the [`<DetailsList>`](https://developer.microsoft.com/en-us/fluentui#/controls/web/detailslist). This function will be called to compute the `key` attribute when rendering the element.

## Designs

## Behaviors

## Inspirations

This package is inspired by the following packages:

- [Bot Framework Web Chat](https://github.co/microsoft/BotFramework-WebChat/)
- [ExpressJS](https://expressjs.com/)
- [Redux](https://redux.js.org/)

## Contributions

Like us? [Star](https://github.com/compulim/use-render/stargazers) us.

Want to make it better? [File](https://github.com/compulim/use-render/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/use-render/pulls) a pull request.
