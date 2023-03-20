# `use-render`

[Chain of responsibility design pattern](https://refactoring.guru/design-patterns/chain-of-responsibility) for React component customization.

## Background

This package is designed for React component developers to enable component customization via composition using the [chain of responsibility design pattern](https://refactoring.guru/design-patterns/chain-of-responsibility).

Additional helper hook is provided to use with [Fluent UI `IRenderFunction`](https://github.com/microsoft/fluentui/blob/master/packages/utilities/src/IRenderFunction.ts).

By composing customizations, they can be decoupled and published separately. App developers could import these published customizations and orchestrate them to their needs. This pattern encourage [separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns) and enables economy of customization.

## Demo

Click here for [our live demo](https://compulim.github.io/use-render/).

## How to use

### Using `<Proxy>` component

```tsx
import { createChainOfResponsibility } from 'use-render';

// Creates a <Provider> providing the chain of responsibility service.
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

> **This is bold.** _This is italic._ This is plain.

### Using with Fluent UI as `IRenderFunction`

The chain of responsibility design pattern can be used in Fluent UI.

After calling `createChainOfResponsibilityForFluentUI`, it will return `useBuildRenderFunction` hook. This hook, when called, will return a function to use as [`IRenderFunction`](https://github.com/microsoft/fluentui/blob/master/packages/utilities/src/IRenderFunction.ts) in Fluent UI components.

#### Sample code

```tsx
import { createChainOfResponsibilityForFluentUI } from 'use-render';

// Creates a <Provider> providing the chain of responsibility service.
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

There are subtle differences between the standard version and the Fluent UI version:

- Entrypoint is `createChainOfResponsibilityForFluentUI()`
- Request and props are always of same type
  - They are optional too, as defined in [`IRenderFunction`](https://github.com/microsoft/fluentui/blob/master/packages/utilities/src/IRenderFunction.ts)
- Automatic fallback to `defaultRender`

### Decorating UI components

One core feature of chain of responsibility design pattern is allowing middleware to control the execution flow. In other words, middleware can decorate the result of their `next()` middleware. The code snippet below shows how the wrapping could be done.

The bold middleware uses traditional approach to wrap the `next()` result, which is a component named `<Next>`. The italic middleware uses [`react-wrap-with`](https://npmjs.com/package/react-wrap-with/) to simplify the wrapping code.

```ts
const middleware = [
  () => next => request => {
    const Next = next(request);

    if (request?.has('bold')) {
      return props => <Bold>{Next && <Next {...props} />}</Bold>;
    }

    return Next;
  },
  () => next => request => wrapWith(request?.has('italic') && Italic)(next(request)),
  () => () => () => Plain
];

const App = () => (
  <Provider middleware={middleware}>
    <Proxy request={new Set(['bold'])}>This is bold.</Proxy>
    <Proxy request={new Set(['italic'])}>This is italic.</Proxy>
    <Proxy request={new Set(['bold', 'italic'])}>This is bold and italic.</Proxy>
    <Proxy>This is plain.</Proxy>
  </Provider>
);
```

This sample will render:

> **This is bold.** _This is italic._ **_This is bold and italic._** This is plain.

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

| Name                        | Type                                              | Description                                                                           |
| --------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `Provider`                  | `React.ComponentType`                             | Entrypoint component, must wraps all usage of customizations                          |
| `Proxy`                     | `React.ComponentType`                             | Proxy component, process the `request` from props and morph into the result component |
| `types`                     | `{ init, middleware, props, request }`            | TypeScript: shorthand types, all objects are `undefined` intentionally                |
| `useBuildComponentCallback` | `() => (request, options) => React.ComponentType` | Callback hook which return a function to build the component for rendering the result |

### Options

```tsx
type Options = {
  /** Allows a middleware to pass another request object to its next middleware. Default is false. */
  passModifiedRequest?: boolean;
};
```

If `passModifiedRequest` is default or `false`, middleware will not be allowed to pass another reference of `request` object to their `next()` middleware. Instead, the `request` object passed to `next()` will be ignored and the next middleware always receive the original `request` object. This behavior is similar to [ExpressJS](https://expressjs.com/) middleware.

Setting to `true` will enable advanced scenarios and allow a middleware to influence their downstreamers.

When the option is default or `false`, middleware could still modify the `request` object and influence their downstreamers. It is recommended to follow immutable pattern when handling the `request` object, or use deep [`Object.freeze`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) to guarantee immutability.

### API of `useBuildComponentCallback`

```tsx
type UseBuildComponentCallbackOptions<Props> = { defaultComponent?: ComponentType<Props> | false | null | undefined };

type UseBuildComponentCallback<Request, Props> = (
  request: Request,
  options?: UseBuildComponentCallbackOptions<Props>
) => ComponentType<Props> | false | null | undefined;
```

### API for Fluent UI

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

When rendering the element, `getKey` is called to compute the `key` attribute. This is required for some `onRenderXXX` props. These props are usually used to render more than one elements, such as [`DetailsList.onRenderField`](https://developer.microsoft.com/en-us/fluentui#/controls/web/detailslist#implementation), which renders every field (a.k.a. cell) in the [`<DetailsList>`](https://developer.microsoft.com/en-us/fluentui#/controls/web/detailslist).

## Designs

### Why the type of request and props can be different?

This approach may seem overkill at first.

This is to support advanced scenarios where props are not ready until all rendering components are decided.

For example, in a chat UI, the middleware is used to influence how the message bubble is rendered, say, a text message vs. an image vs. a hidden message.

The message bubble is responsible to render its timestamp. However, if timestamp grouping is enabled, timestamps in some bubbles will not be rendered because it is rendered by their neighboring bubbles. This is also true for avatar grouping.

At component build-time (with the request object), it is not known if a message bubble should render its timestamp or not. This is because we do not know their neighbors yet. At render-time (with props), because all components are prepared, we can start telling each message bubble if they should render their timestamp.

We need to put some logics between build-time and render-time to support grouping. This needs to be a "two-pass" operation because avatar grouping and timestamp grouping is looking up neighbors in a different direction:

- Avatar grouping look at _predecessors_
  - If an earlier message already rendered the avatar, it should not render again
- Timestamp grouping look at _successors_
  - If a latter message is going to render the timestamp, it should not render it now

### Why the middleware should return component instead of element?

We decided to return component, despite its complexity.

There are several advantages when returning component:

- We know if a request would render or not render a request
  - If it would render, middleware will return a component
  - If it would not render, middleware will return `false`/`null`/`undefined`
- Components works with hooks in a more natural way
- Build-time and render-time are separated to support advanced scenarios

### Why we call the handler "middleware"?

"Handler" is often seen in articles explaining the chain of responsibility design pattern. They are typically written in a language-agnostic format, such as pseudo code.

However, "middleware" is a more popular word in JavaScript community. Thus, we chose "middleware".

### Why we need to call `createChainOfResponsibility()` to create `<Provider>`?

This is for supporting multiple providers/proxies under a single app/tree.

### Why we disable `passModifiedRequest` by default?

To reduce learning curve and likelihood of bugs, we disabled this feature until developers are more proficient with this package.

## Behaviors

### `<Proxy>` vs. `useBuildComponentCallback`

Most of the time, use `<Proxy>`.

Behind the scene, `<Proxy>` call `useBuildComponentCallback()` to build the component it would morph into.

You can use the following decision tree to decide when to use `<Proxy>` vs. `useBuildComponentCallback`

- If you want to know what component will render before actual render happen, use `useBuildComponentCallback()`
  - For example, using `useBuildComponentCallback()` allow you to know if the middleware will skip rendering the request
- If your component use `request` prop which is conflict with `<Proxy>`, use `useBuildComponentCallback()`
- Otherwise, use `<Proxy>`

### Calling `next()` multiple times

It is possible to call `next()` multiple times to render multiple copies of UI. Middleware should be written as a stateless function.

This is best used with options `passModifiedRequest` set to `true`. This combination allow a middleware to render the UI multiple times with some variations, such as rendering content and minimap at the same time.

### Calling `next()` later

This is not supported.

This is because React does not allow asynchronous render. An exception will be thrown if the `next()` is called after return.

### Good middleware is stateless

When writing middleware, keep them as stateless as possible and do not relies on data outside of the `request` object. The way it is writing should be similar to React function components.

### Good middleware returns false to skip rendering

If the middleware wants to skip rendering a request, return `false`/`null`/`undefined` directly. Do not return `() => false`, `<Fragment />`, or any other invisible components.

This helps the component which send the request to the chain of responsibility to determine whether the request could be rendered or not.

### Typing a component which expect no props to be passed

To type a component which expects no props to be passed, use `ComponentType<{ children?: undefined }>`.

In TypeScript, `{}` literally means any objects. If your component is of type `ComponentType<{}>`, it means [anything can be passed as props](https://www.typescriptlang.org/play?#code/C4TwDgpgBACgTgezAZygXigbwL4G4BQ+AxggHbLBRiIoBcsNqGmUyCAthMABYCWpAc3oByCABtkEYVDz4gA).

Although `Record<any, never>` means empty object, it is not extensible. Thus, [`Record<any, never> & { className: string }` means `Record<any, never>`](https://www.typescriptlang.org/play?#code/C4TwDgpgBACgTgezAZygXigJQgYwXAEwB4BDAOxABooyIA3COAPgG4AoUSKAZQFcAjeElQYhKKADIoAbyg4ANiWTIAciQC2EAFxRkwOAEsyAcygBfdmzxk9UMIhQ6+ghyJlzFytZp0BydSRGvubsQA).

We believe the best way to say a component which does not allow any props, is `ComponentType<{ children?: undefined }>`.

## Inspirations

This package is heavily inspired by [Redux](https://redux.js.org/) middleware, especially [`applyMiddleware()`](https://github.com/reduxjs/redux/blob/master/docs/api/applyMiddleware.md) and [`compose()`](https://github.com/reduxjs/redux/blob/master/docs/api/compose.md). We read [this article](https://medium.com/@jacobp100/you-arent-using-redux-middleware-enough-94ffe991e6) to understand the concept, followed by some more readings on functional programming topics.

Over multiple years, this pattern is proven to be very flexible and expandable in [Bot Framework Web Chat](https://github.co/microsoft/BotFramework-WebChat/). Internal parts of Web Chat is written as middleware consumed by itself. Multiple bundles with various sizes can be offered by removing some middleware and treeshaking them off.

Middleware and router in [ExpressJS](https://expressjs.com/) also inspired us to learn more about this pattern. Its default middleware returns 404 is a very innovative approach.

[Bing chat](https://bing.com/chat/) helped us understand and experiment with different naming.

## Plain English

This package implements the _chain of responsibility_ design pattern. Based on _request_, the chain of responsibility will be asked to _build a React component_. The middleware will _form a chain_ and request is _passed to the first one in the chain_. If the chain decided to render it, a component will be returned, otherwise, `false`/`null`/`undefined`.

## Contributions

Like us? [Star](https://github.com/compulim/use-render/stargazers) us.

Want to make it better? [File](https://github.com/compulim/use-render/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/use-render/pulls) a pull request.
