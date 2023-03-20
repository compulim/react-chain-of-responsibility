# `use-render`

[Chain of responsibility design pattern](https://refactoring.guru/design-patterns/chain-of-responsibility) for React component customization.

## Background

This package is designed for UI component package developers to enable component customization via composition using the [chain of responsibility design pattern](https://refactoring.guru/design-patterns/chain-of-responsibility).

Additional helper hook is provided to use with [Fluent UI `IRenderFunction`](https://github.com/microsoft/fluentui/blob/master/packages/utilities/src/IRenderFunction.ts).

By composing customizations, they can be decoupled and published separately. App developers could import these published customizations and orchestrate them to their needs. This pattern encourage [separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns) and enables economy of customization.

## Demo

Click here for [our live demo](https://compulim.github.io/use-render/).

## How to use

### Using `<Proxy>` component

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

This sample will render:

> **This is bold.** *This is italic.* This is plain.

#### Good middleware is stateless

When writing middleware, keep them as stateless as possible and do not relies on data outside of the `request` object. The way it is writing should be similar to React function components.

If middleware must use external data, when the external data change, make sure the `middleware` prop is invalidated to trigger a re-render of the tree.

#### Good middleware returns false to skip rendering

If the middleware want to skip rendering a request, return `false`/`null`/`undefined` directly. Do not return `() => false` or similar.

This helps the code that use the middleware to know if the rendering result is being skipped or not.

### Using as Fluent UI `IRenderFunction`

The chain of responsibility design pattern can be used in Fluent UI.

After calling `createChainOfResponsibilityForFluentUI`, it will return `useBuildRenderFunction` hook. This hook, when called, will return a function to use as [`IRenderFunction`](https://github.com/microsoft/fluentui/blob/master/packages/utilities/src/IRenderFunction.ts) in Fluent UI components.

There are subtle differences between the standard version and the Fluent UI version:

- Entrypoint is `createChainOfResponsibilityForFluentUI()`
- Request and props are always of same type
  - They are optional too, this is defined in [`IRenderFunction`](https://github.com/microsoft/fluentui/blob/master/packages/utilities/src/IRenderFunction.ts)
- Auto-fallback to `defaultRender`

#### Sample code

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

At component build-time (with the request object), it is unknown if a message bubble should render its timestamp or not. This is because we do not know their neighbors yet. At render-time (with props), because all components are decided, we can start telling each message bubble if they should render their timestamp.

We need to put some logics between build-time and render-time. This is because avatar grouping and timestamp grouping is looking up neighbors at different direction:

- Avatar grouping look at _predecessors_
  - If an earlier message already rendered the avatar, it should not rendered again
- Timestamp grouping look at _successors_
  - If a latter message render the timestamp, it should not render it

### Why the middleware should return component vs. element?

We decided to return component, despite its complexity.

There are multiple advantages by returning a component:

- We know if a request would render (return a component), or not rendered at all (return `false`/`null`/`undefined`)
- Components work with hooks
- Build-time and render-time are separated, this is critical to support some advanced scenarios

### Why we call the handler "middleware"?

"Handler" is often seen in articles explaining the chain of responsibility design pattern. They are typically written in a language-agnostic format, such as pseudo code.

However, "middleware" is a more popular word in JavaScript community. Thus, we chose "middleware".

### Why we need to call `createChainOfResponsibility`?

This is for supporting multiple providers/proxies in a single app/tree.

### Why we disable `allowModifiedRequest` by default?

To reduce learning curve and likelihood of bugs, we disabled this feature until developers are more proficient with this package.

## Behaviors

### `<Proxy>` vs. `useBuildComponentCallback`

Most of the time, use `<Proxy>`.

Behind the scene, `<Proxy>` call `useBuildComponentCallback()` to build the component it would morph into.

Decision tree:

- If you want to know what component will render before actual render happen, use `useBuildComponentCallback()`
  - For example, using `useBuildComponentCallback()` allow you to know if the middleware will skip rendering the request
- Otherwise, use `<Proxy>`

### Calling `next()` multiple times

It is possible to call `next()` multiple times to render an UI multiple times. Middleware should be stateless.

This is best used with options `allowModifiedRequest` set to `true`. This combination allow a middleware to render the UI multiple times with some variations, such as rendering content and minimap at the same time.

### Calling `next()` later

This is not supported.

This is because React does not allow asynchronous render. If `next()` is called after return, an exception will be thrown.

## Inspirations

This package is heavily inspired by the [Redux](https://redux.js.org/) middleware, especially [`applyMiddleware`](https://github.com/reduxjs/redux/blob/master/docs/api/applyMiddleware.md) and [`compose`](https://github.com/reduxjs/redux/blob/master/docs/api/compose.md). [This article](https://medium.com/@jacobp100/you-arent-using-redux-middleware-enough-94ffe991e6) explained the concept well.

Over multiple years, this pattern is proved to be very flexible and expandable in [Bot Framework Web Chat](https://github.co/microsoft/BotFramework-WebChat/). Internal parts of Web Chat is written as middleware consumed by itself. Smaller bundle size can be achieved by removing middleware and treeshaking them off.

Middleware and router in [ExpressJS](https://expressjs.com/) also inspired us to read more about this pattern.

[Bing chat](https://bing.com/chat/) helped us understanding and experimenting with different naming.

## Contributions

Like us? [Star](https://github.com/compulim/use-render/stargazers) us.

Want to make it better? [File](https://github.com/compulim/use-render/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/use-render/pulls) a pull request.
