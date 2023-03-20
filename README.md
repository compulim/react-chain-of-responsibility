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
  useBuildComponentCallback: () => UseBuildComponent<Request, Props>;
};
```

### Return value

| Name                        | Type                                     | Description                                                                           |
| --------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------- |
| `Provider`                  | `React.ComponentType`                    | Entrypoint component, must wraps all usage of customizations                          |
| `Proxy`                     | `React.ComponentType`                    | Proxy component, process the `request` from props and morph into the result component |
| `useBuildComponentCallback` | `() => (request) => React.ComponentType` | Callback hook which return a function to build the component for rendering the result |
| `types`                     | `{ init, middleware, props, request }`   | TypeScript: shorthand types, all objects are `undefined` intentionally                |

### Options

```tsx
type Options = {
  /** Allows a middleware to pass another request object when calling its next middleware. Default is disabled. */
  allowModifiedRequest?: boolean;
};
```

If `allowModifiedRequest` is default or `false`, middleware will not be allowed to pass another reference of `request` object to their `next()` middleware. Setting to `true` will enable advanced scenarios and allow a middleware to influence downstreamers.

However, when keep at default or `false`, middleware can still modify the `request` object to influence the next middleware. It is recommended to follow immutable pattern when handling the `request` object, or use deep [`Object.freeze`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) to guarantee immutability.

### API of `useBuildComponentCallback`

```tsx
type UseBuildComponentCallbackOptions<Props> = { defaultComponent?: ComponentType<Props> | false | null | undefined };

type UseBuildComponentCallback<Request, Props> = (
  request: Request,
  options?: UseBuildComponentCallbackOptions<Props>
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

`getKey` will be called to compute the `key` attribute when rendering the element. This is required for some render functions. These functions are usually used to render multiple elements, such as [`DetailsList.onRenderField`](https://developer.microsoft.com/en-us/fluentui#/controls/web/detailslist#implementation), which renders every field (a.k.a. cell) in the [`<DetailsList>`](https://developer.microsoft.com/en-us/fluentui#/controls/web/detailslist).

## Designs

### Why we allow request and props to be different?

It may seem overkill at first.

To support advanced scenarios where props are not obtainainable until all rendering components are decided.

For example, in a chat UI, the middleware is used to influence how the message bubble is rendered, say, a text message vs. an image vs. hidden message.

The message bubble will be responsible to render its timestamp. However, if timestamp grouping is enabled, timestamps in some bubbles will not be rendered because it is rendered by their neighboring bubbles. This is also true for avatar grouping.

At component build-time (request), it is unknown if a message bubble should render its timestamp or not. This is because we do not know their neighbors yet. At render-time (props), because all components are decided, we can start telling each message bubble if their timestamp should be rendered.

We need to put some logics between build-time and render-time. This is because avatar grouping and timestamp grouping is looking up at different direction:

- Avatar grouping look at *predecessors*
  - If an earlier message already rendered the avatar, it should not rendered again
- Timestamp grouping look at *successors*
  - If a latter message render the timestamp, it should not render it

### Why returning a component but not element?

By returning a component, we can know if a request will turn into a rendered element, or not rendered at all.

Also, we can separate the build-time and render-time. This is critical to support some advanced scenarios.

### Why we call the handler "middleware"?

"Handler" is often seen in articles explaining the chain of responsibility design pattern. They are typically written in a language-agnostic format, such as pseudo code.

However, "middleware" is a more popular word in JavaScript community.

## Behaviors

### `<Proxy>` vs. `useBuildComponentCallback`

Most of the time, use `<Proxy>`.

Behind the scene, `<Proxy>` call `useBuildComponentCallback` to build the component it would morph into.

Decision tree:

- If you want to know what components will render, before actual render happen, use `useBuildComponentCallback`
  - For example, after processing all requests, you want to know how many components will actually render
- Otherwise, use `<Proxy>`

## Inspirations

This package is inspired by the following packages:

- [Bot Framework Web Chat](https://github.co/microsoft/BotFramework-WebChat/)
- [ExpressJS](https://expressjs.com/) middleware
- [Redux](https://redux.js.org/) middleware

## Contributions

Like us? [Star](https://github.com/compulim/use-render/stargazers) us.

Want to make it better? [File](https://github.com/compulim/use-render/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/use-render/pulls) a pull request.
