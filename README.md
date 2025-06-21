# `react-chain-of-responsibility`

[Chain of responsibility design pattern](https://refactoring.guru/design-patterns/chain-of-responsibility) for React component customization.

## Background

This package is designed for React component developers to enable component customization via composition using the [chain of responsibility design pattern](https://refactoring.guru/design-patterns/chain-of-responsibility).

By composing customizations, they can be decoupled and published separately. App developers could import these published customizations and orchestrate them to their needs. This pattern encourages [separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns) and enables economy of customizability.

Additional entrypoint and hook are provided to use with [Fluent UI as `IRenderFunction`](https://github.com/microsoft/fluentui/blob/master/packages/utilities/src/IRenderFunction.ts).

## Demo

Click here for [our live demo](https://compulim.github.io/react-chain-of-responsibility/).

## Sample

In this sample, we are using the chain-of-responsibility pattern to render few different types of file, including images, videos, and binary files. Depends on type of the file, the rendering will be handled by `<Image>`, `<Video>`, and `<Binary>` respectively.

```jsx
import { createChainOfResponsibility } from 'react-chain-of-responsibility';

type Request = { contentType: string; };
type Props = { url: string; };

const { asMiddleware, Provider, Proxy } = createChainOfResponsibility<Request, Props>();

// Will handle request with content type `image/*`.
const Image = ({ middleware: { request, Next }, url }) =>
  request.contentType.startsWith('image/') ? <img src={url} /> : <Next />;

// Will handle request with content type `video/*`.
const Video = ({ middleware: { request, Next }, url }) =>
  request.contentType.startsWith('video/') ? <video><source src={url} /></video> : <Next />;

// Will handle everything.
const Binary = ({ url }) => <a href={url}>{url}</a>

const middleware = [
  asMiddleware(Image),
  asMiddleware(Video),
  asMiddleware(Binary)
];

render(
  <Provider middleware={middleware}>
    <Proxy request={{ contentType: 'image/png' }} url="https://.../cat.png" />
    <Proxy request={{ contentType: 'video/mp4' }} url="https://.../cat-jump.mp4" />
    <Proxy request={{ contentType: 'application/octet-stream' }} url="https://.../cat.zip" />
  </Provider>
);
```

When the app is run, the following HTML will be produced:

```html
```

## Explanation

### Middleware component

```jsx
const Image = ({ middleware: { request, Next }, url }) =>
  request.contentType.startsWith('image/') ? <img src={url} /> : <Next />;
```

`<Image>` is a React component. If the `request.contentType` is `image/*`, it will render via `<img>`. Otherwise, it will fallback to the next middleware.

### Forming the chain

```jsx
const middleware = [
  asMiddleware(Image),
  asMiddleware(Video),
  asMiddleware(Binary)
];
```

`<Image>` will be rendered first. If the request is of type `image/*`, it will render. Otherwise, it will ask the next middleware to render, which is `<Video>`.

`<Video>` will render if the type is `video/*`, otherwise, it will fallback again to `<Binary>`.

Lastly, `<Binary>` is a catch-all and it will render everything as a link.

### Rendering requests

```jsx
render(
  <Provider middleware={middleware}>
    <Proxy request={{ contentType: 'image/png' }} url="https://.../cat.png" />
    <Proxy request={{ contentType: 'video/mp4' }} url="https://.../cat-jump.mp4" />
    <Proxy request={{ contentType: 'application/octet-stream' }} url="https://.../cat.zip" />
  </Provider>
);
```

Register our middleware chain to `<Provider>`.

`<Proxy>` is a proxy component. Depends on the request, it could be either `<Image>`, `<Video>`, or `<Binary>`.

The first `<Proxy>` will be proxied to `<Image>`, which accept the content type of `image/png` and render as `<img src="https://.../cat.png" />`.

The second `<Proxy>` will be proxied to `<Image>` too. But `<Image>` does not understand the content type, thus, it render the `<Next>` component.The `<Next>` is a proxy of `<Video>` (next middleware in the chain), which accept the content type of `video/mp4` and render as `<video><source src="https://.../cat-jump.mp4" /></video>`.

The last `<Proxy>` will proxy to `<Image>`, then `<Video>`, then `<Binary>`. The catch-all `<Binary>` will render it as `<a href="https://.../cat.zip">https://.../cat.zip</a>`.

## How to use

### Using `<Proxy>` component

```jsx
import { createChainOfResponsibility } from 'react-chain-of-responsibility';

// Creates a <Provider> providing the chain of responsibility service.
const { Provider, Proxy } = createChainOfResponsibility();

// List of subcomponents.
const Bold = ({ children }) => <strong>{children}</strong>;
const Italic = ({ children }) => <i>{children}</i>;
const Plain = ({ children }) => <>{children}</>;

// Constructs an array of middleware to handle the request and return corresponding subcomponents.
const middleware = [
  () => next => request => (request === 'bold' ? Bold : next(request)),
  () => next => request => (request === 'italic' ? Italic : next(request)),
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

```jsx
<strong>This is bold.</strong>
<i>This is italic.</i>
<>This is plain.</>
```

### Using with Fluent UI as `IRenderFunction`

The chain of responsibility design pattern can be used in Fluent UI.

After calling `createChainOfResponsibilityForFluentUI`, it will return `useBuildRenderFunction` hook. This hook, when called, will return a function to use as [`IRenderFunction`](https://github.com/microsoft/fluentui/blob/master/packages/utilities/src/IRenderFunction.ts) in Fluent UI components.

#### Sample code

```jsx
import { createChainOfResponsibilityForFluentUI } from 'react-chain-of-responsibility/fluentUI';

// Creates a <Provider> providing the chain of responsibility service.
const { Provider, Proxy } = createChainOfResponsibilityForFluentUI();

// List of subcomponents.
const Banana = () => <>🍌</>;
const Orange = () => <>🍊</>;

// Constructs an array of middleware to handle the request and return corresponding subcomponents.
const middleware = [
  () => next => props => (props?.iconProps?.iconName === 'Banana' ? Banana : next(props)),
  () => next => props => (props?.iconProps?.iconName === 'Orange' ? Orange : next(props))
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

- Entrypoint is `createChainOfResponsibilityForFluentUI()` and imported from 'react-chain-of-responsibility/fluentUI'
- Request and props are always of same type
  - They are optional too, as defined in [`IRenderFunction`](https://github.com/microsoft/fluentui/blob/master/packages/utilities/src/IRenderFunction.ts)
- Automatic fallback to `defaultRender`

### Decorating UI components

One core feature of chain of responsibility design pattern is allowing middleware to control the execution flow. In other words, middleware can decorate the result of their `next()` middleware. The code snippet below shows how the wrapping could be done.

The bold middleware uses traditional approach to wrap the `next()` result, which is a component named `<Next>`. The italic middleware uses [`react-wrap-with`](https://npmjs.com/package/react-wrap-with/) to simplify the wrapping code.

```jsx
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

```jsx
<Bold>This is bold.</Bold>
<Italic>This is italic.</Italic>
<Bold><Italic>This is bold and italic.</Italic></Bold>
<Plain>This is plain.</Plain>
```

### Nesting `<Provider>`

If the `<Provider>` from the same chain appears nested in the tree, the `<Proxy>` will render using the middleware from the closest `<Provider>` and fallback up the chain. The following code snippet will render "Second First".

```jsx
const { Provider, Proxy } = createChainOfResponsibility();

const firstMiddleware = () => next => request => {
  const NextComponent = next(request);

  return () => <Fragment>First {NextComponent && <NextComponent />}</Fragment>;
};

const secondMiddleware = () => next => request => {
  const NextComponent = next(request);

  return () => <Fragment>Second {NextComponent && <NextComponent />}</Fragment>;
};

render(
  <Provider middleware={[firstMiddleware]}>
    <Provider middleware={[secondMiddleware]}>
      <Proxy /> <!-- Renders "Second First" -->
    </Provider>
  </Provider>
);
```

## API

```ts
function createChainOfResponsibility<Request = undefined, Props = { children?: never }, Init = undefined>(
  options?: Options
): {
  asMiddleware: (
    middlewareComponent: ComponentType<MiddlewareComponentProps<Init, Request, Props>>
  ) => ComponentMiddleware<Request, Props, Init>;
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

| Name                        | Description                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------- |
| `asMiddleware`              | A helper function to convert a React component into a middleware.                     |
| `Provider`                  | Entrypoint component, must wraps all usage of customizations                          |
| `Proxy`                     | Proxy component, process the `request` from props and morph into the result component |
| `types`                     | TypeScript: shorthand types, all objects are `undefined` intentionally                |
| `useBuildComponentCallback` | Callback hook which return a function to build the component for rendering the result |

### Options

> `passModifiedRequest` is not supported by `asMiddleware`.

```ts
type Options = {
  /** Allows a middleware to pass another request object to its next middleware. Default is false. */
  passModifiedRequest?: boolean;
};
```

If `passModifiedRequest` is default or `false`, middleware will not be allowed to pass another reference of `request` object to their `next()` middleware. Instead, the `request` object passed to `next()` will be ignored and the next middleware always receive the original `request` object. This behavior is similar to [ExpressJS](https://expressjs.com/) middleware.

Setting to `true` will enable advanced scenarios and allow a middleware to influence their downstreamers.

When the option is default or `false`, middleware could still modify the `request` object and influence their downstreamers. It is recommended to follow immutable pattern when handling the `request` object, or use deep [`Object.freeze()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) to guarantee immutability.

### API of `useBuildComponentCallback`

```ts
type UseBuildComponentCallbackOptions<Props> = { fallbackComponent?: ComponentType<Props> | false | null | undefined };

type UseBuildComponentCallback<Request, Props> = (
  request: Request,
  options?: UseBuildComponentCallbackOptions<Props>
) => ComponentType<Props> | false | null | undefined;
```

The `fallbackComponent` is a component which all unhandled requests will sink into, including calls without ancestral `<Provider>`.

### API for Fluent UI

```ts
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

This is to support advanced scenarios where props are not ready until all rendering components are built.

For example, in a chat UI, the middleware is used to influence how the message bubble is rendered, say, a text message vs. an image vs. a hidden message.

The message bubble is responsible to render its timestamp. However, if timestamp grouping is enabled, timestamps in some bubbles will not be rendered if its neighboring bubble render the timestamp. This is also true for avatar grouping.

At component build-time (with the request object), it is not known if a message bubble should render its timestamp or not. This is because we do not know their neighbors yet. At render-time (with props), because all components are prepared, we can start telling each message bubble if they should render their timestamp.

We need to put some logics between build-time and render-time to support grouping. This needs to be a "two-pass" operation because avatar grouping and timestamp grouping look up neighbors in a different direction:

- Avatar grouping look at _predecessors_
  - If an earlier message already rendered the avatar, it should not render again
- Timestamp grouping look at _successors_
  - If a latter message is going to render the timestamp, it should not render it now

### Why the middleware should return component instead of element?

Despite its complexity, there are several advantages when returning component:

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

If the `request` object passed to `next()` differs from the original `request` object, a reminder will be logged in the console.

## Behaviors

### `<Proxy>` vs. `useBuildComponentCallback`

Most of the time, use `<Proxy>`.

Behind the scene, `<Proxy>` call `useBuildComponentCallback()` to build the component it would morph into.

You can use the following decision tree to know when to use `<Proxy>` vs. `useBuildComponentCallback`

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

In TypeScript, `{}` literally means any objects. Components of type `ComponentType<{}>` means [anything can be passed as props](https://www.typescriptlang.org/play?#code/C4TwDgpgBACgTgezAZygXigbwL4G4BQ+AxggHbLBRiIoBcsNqGmUyCAthMABYCWpAc3oByCABtkEYVDz4gA).

Although `Record<any, never>` means empty object, it is not extensible. Thus, [`Record<any, never> & { className: string }` means `Record<any, never>`](https://www.typescriptlang.org/play?#code/C4TwDgpgBACgTgezAZygXigJQgYwXAEwB4BDAOxABooyIA3COAPgG4AoUSKAZQFcAjeElQYhKKADIoAbyg4ANiWTIAciQC2EAFxRkwOAEsyAcygBfdmzxk9UMIhQ6+ghyJlzFytZp0BydSRGvubsQA).

We believe the best way to type a component which does not allow any props, is `ComponentType<{ children?: undefined }>`.

## Inspirations

This package is heavily inspired by [Redux](https://redux.js.org/) middleware, especially [`applyMiddleware()`](https://github.com/reduxjs/redux/blob/master/docs/api/applyMiddleware.md) and [`compose()`](https://github.com/reduxjs/redux/blob/master/docs/api/compose.md). We read [this article](https://medium.com/@jacobp100/you-arent-using-redux-middleware-enough-94ffe991e6) to understand the concept, followed by some more readings on functional programming topics.

Over multiple years, the chain of responsibility design pattern is proven to be very flexible and extensible in [Bot Framework Web Chat](https://github.co/microsoft/BotFramework-WebChat/). Internal parts of Web Chat is written as middleware consumed by itself. Multiple bundles with various sizes can be offered by removing some middleware and treeshaking them off.

Middleware and router in [ExpressJS](https://expressjs.com/) also inspired us to learn more about this pattern. Their fallback middleware always returns 404 is an innovative approach.

[Bing chat](https://bing.com/chat/) helped us understand and experiment with different naming.

### Differences from Redux and ExpressJS

The chain of responsibility design pattern implemented in [Redux](https://redux.js.org/) and [ExpressJS](https://expressjs.com/) prefers fire-and-forget execution (a.k.a. unidirectional): the result from the last middleware will not bubble up back to the first middleware. Instead, the caller may only collect the result from the last middleware. Sometimes, middleware may interrupt the execution and never return any results.

However, the chain of responsibility design pattern implemented in this package prefers call-and-return execution: the result from the last middleware will propagate back to the first middleware before returning to the caller. This gives every middleware a chance to manipulate the result from downstreamers before sending it back.

## Plain English

This package implements the _chain of responsibility_ design pattern. Based on _request_, the chain of responsibility will be asked to _build a React component_. The middleware will _form a chain_ and request is _passed to the first one in the chain_. If the chain decided to render it, a component will be returned, otherwise, `false`/`null`/`undefined`.

## Contributions

Like us? [Star](https://github.com/compulim/react-chain-of-responsibility/stargazers) us.

Want to make it better? [File](https://github.com/compulim/react-chain-of-responsibility/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/react-chain-of-responsibility/pulls) a pull request.
