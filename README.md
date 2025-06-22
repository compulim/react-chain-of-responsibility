# `react-chain-of-responsibility`

[Chain of responsibility design pattern](https://refactoring.guru/design-patterns/chain-of-responsibility) for compositing and customizing React component.

## Background

This package is designed for React component developers to enable component customization via composition using the [chain of responsibility design pattern](https://refactoring.guru/design-patterns/chain-of-responsibility). This pattern is also used in [Express](https://expressjs.com/) and [Redux](https://redux.js.org/).

By composing customizations, they can be decoupled and published separately. App developers could import these published customizations and orchestrate them to their needs. This pattern encourages [separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns) and enables economy of customizability.

## Demo

Click here for [our live demo](https://compulim.github.io/react-chain-of-responsibility/).

## How to use?

3 steps to adopt the chain of responsibility pattern.

1. [Create a chain](#create-a-chain)
1. [Register handlers in the chain](#register-handlers-in-the-chain)
1. [Make a render request](#make-a-render-request)

In this sample, we will use chain of responsibility pattern to create a file preview UI which can handle various file types.

### Create a chain

A chain consists of multiple handlers (a.k.a. middleware) and each would handle rendering requests.

The request will be passed to the first handler and may traverse down the chain. The returning result will be a React component. If the chain decided not to render anything, it will return `undefined`.

```tsx
import { createChainOfResponsibility } from 'react-chain-of-responsibility';

type Request = { contentType: string };
type Props = { url: string };

const { asMiddleware, Provider, Proxy } = createChainOfResponsibility<Request, Props>();
```

In this sample, the `request` contains file type. And the `props` contains the URL of the file.

Tips: `request` is appearance, while `props` is for content.

### Register handlers in the chain

Based on the rendering request, each middleware is called in turn and they will make decision:

- Will render
  - Will render a component on its own
  - Will render a component by compositing component from the next middleware in the chain
- Will not render
  - Will not render anything at all
  - Will not render, but let the next middleware in the chain to decide what to render

```tsx
// Will handle request with content type `image/*`.
const Image = ({ middleware: { request, Next }, url }) =>
  request.contentType.startsWith('image/') ? (
    <img src={url} />
  ) : (
    <Next />
  );

// Will handle request with content type `video/*`.
const Video = ({ middleware: { request, Next }, url }) =>
  request.contentType.startsWith('video/') ? (
    <video>
      <source src={url} />
    </video>
  ) : (
    <Next />
  );

// Will handle everything.
const Binary = ({ url }) => <a href={url}>{url}</a>;

const middleware = [asMiddleware(Image), asMiddleware(Video), asMiddleware(Binary)];
```

In this sample, 3 middleware are registered:

- `<Image>` will render `<img>` if content type is `'image/*'`, otherwise, will pass to next middleware (`<Video>`)
- `<Video>` will render `<video>` if content type is `'video/*'`, otherwise, will pass to next middleware (`<Binary>`)
- `<Binary>` is a catch-all and will render as a link

Notes: props passed to `<Next>` will override original props, however, `request` cannot be overridden.

### Make a render request

Before calling any components or hooks, the `<Provider>` component must be set up with the chain.

When `<Proxy>` is being rendered, it will pass the `request` to the chain. The component returned from the chain will be rendered with `...props`. If no component is returned, it will be rendered as `undefined`.

```tsx
render(
  <Provider middleware={middleware}>
    <Proxy request={{ contentType: 'image/png' }} url="https://.../cat.png" />
    <Proxy request={{ contentType: 'video/mp4' }} url="https://.../cat-jump.mp4" />
    <Proxy request={{ contentType: 'application/octet-stream' }} url="https://.../cat.zip" />
  </Provider>
);
```

The code above will render:

```html
<img src="https://.../cat.png" />
<video>
  <source src="https://.../cat-jump.mp4" />
</video>
<a href="https://.../cat.zip">https://.../cat.zip</a>
```

For advanced scenario with precise rendering control, use the `useBuildComponentCallback` hook. This can be found in our live demo and latter sections.

## How should I use?

Here are some recipes on leveraging the chain of responsibility pattern for UI composition.

### Bring your own component

Customer of a component library can "bring your own" component by registering their component in the `<Provider>` component.

For example, in a date picker UI, using the chain of responsibility pattern enables app developer to bring their own "month picker" component.

```diff
  type MonthPickerProps = Readonly<{
    onChange: (date: Date) => void;
    value: Date
  }>;

  function MonthPicker(props: MonthPickerProps) {
    return (
      <div>
        {props.value.toLocaleDateString(undefined, { month: 'long' })}
      </div>
    );
  };

+ const {
+   asMiddleware: asMonthPickerMiddleware,
+   Provider: MonthPickerProvider,
+   Proxy: MonthPickerProxy
+ } = createChainOfResponsibility<undefined, MonthPickerProps>();

  type DatePickerProps = Readonly<{
+   monthPickerComponent?: ComponentType<MonthPickerProps> | undefined;
    onChange: (date: Date) => void;
    value: Date;
  }>;

+ const monthPickerMiddleware = asMonthPickerMiddleware(MonthPicker);

  function DatePicker(props: DatePickerProps) {
+   const monthPickerMiddleware = useMemo(
+     () =>
+       props.monthPickerComponent
+         ? [
+             asMonthPickerMiddleware(props.monthPickerComponent),
+             monthPickerMiddleware
+           ]
+         : [monthPickerMiddleware],
+     [props.monthPickerComponent]
+   );

    return (
+     <MonthPickerProvider middleware={monthPickerMiddleware}>
        <div>
-         <MonthPicker onChange={onChange} value={value} />
+         <MonthPickerProxy onChange={onChange} value={value} />
          <Calendar value={value} />
        </div>
+     </MonthPickerProvider>
    );
  }
```

### Customizing component

The "which component to render" decision in the middleware enables 4 key customization scenarios:

- Add a new component
  - Register a new `<Audio>` middleware component to handle content type of "audio/\*"
- Replace an existing component
  - Register a new `<Image2>` middleware component to handle content type of "image/\*"
- Remove an existing component
  - Return `undefined` when handling content type of "video/\*"
- Decorate an existing component
  - Return a component which render `<div class="my-border"><Next /></div>`

### Improve load time through code splitting and lazy loading

After lazy-loading a bundle, register the component in the middleware.

When the `<Provider>` is updated, the lazy-loaded component will be rendered.

This recipe can also used to build multiple flavors of bundle and allow bundle to be composited to suit the apps need.

## Advanced usage

### Registering component using functional pattern

The `asMiddleware()` is a helper function to turn a React component into a component middleware for simpler registration. As it operates in render-time, there are disadvantages. For example, a VDOM node is always required.

If precise rendering control is a requirement, consider registering the component natively using functional programming.

The following code snippet shows the conversion from the `<Image>` middleware component in our previous sample, into a component registered via functional programming.

```diff
  // Simplify the `<Image>` component by removing `middleware` props.
- const Image = ({ middleware: { request, Next }, url }) =>
-   request.contentType.startsWith('image/') ? <img src={url} /> : <Next />;
+ const Image = ({ url }) => <img src={url} />;

  // Registering the `<Image>` component functionally.
  const middleware = [
-   asMiddleware(Image);
+   () => next => request =>
+     request.contentType.startsWith('image/') ? Image : next(request)
  ];
```

Notes: for performance reason, the return value of the `next(request)` should be a stable value. In the example above, the middleware return `Image`, which is a constant and is stable.

### Making render request through `useBuildMiddlewareCallback`

Similar the `asMiddleware`, the `<Proxy>` component is a helper component for easier rendering. It shares similar disadvantages.

The following code snippet shows the conversion from the `<Proxy>` component into the `useBuildMiddlewareCallback()` hook.

```diff
  function App() {
    // Make a render request (a.k.a. build a component.)
+   const buildMiddleware = useBuildMiddlewareCallback();
+   const FilePreview = buildMiddleware({ contextType: 'image/png' });

    return (
      <Provider middleware={middleware}>
        {/* Simplify the element by removing `request` props and handling `FilePreview` if it is `undefined`. */}
-       <Proxy request={{ contentType: 'image/png' }} url="https://.../cat.png" />
+       {FilePreview && <FilePreview url="https://.../cat.png" />}
      </Provider>
    );
  }
```

### Using as `IRenderFunction` in Fluent UI v8

> We are considering deprecating the `IRenderFunction` as Fluent UI no longer adopt this pattern.

The chain of responsibility design pattern can be used in Fluent UI v8.

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

### Nesting `<Provider>`

If the `<Provider>` from the same chain appears nested in the tree, the `<Proxy>` will render using the middleware from the closest `<Provider>` and fallback up the chain. The following code snippet will render "Second First".

```jsx
const { Provider, Proxy } = createChainOfResponsibility();

const firstMiddleware = () => next => request => {
  const Next = next(request);

  return () => <>First {Next && <Next />}</>;
};

const secondMiddleware = () => next => request => {
  const Next = next(request);

  return () => <>Second {Next && <Next />}</>;
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
  asMiddleware(
    middlewareComponent: ComponentType<MiddlewareComponentProps<Request, Props, Init>>
  ): ComponentMiddleware<Request, Props, Init>;
  Provider: ComponentType<ProviderProps<Request, Props, Init>>;
  Proxy: ComponentType<ProxyProps<Request, Props>>;
  types: {
    init: Init;
    middleware: ComponentMiddleware<Request, Props, Init>;
    middlewareComponentProps: MiddlewareComponentProps<Request, Props, Init>;
    props: Props;
    request: Request;
  };
  useBuildComponentCallback(): (
    request: Request,
    options?: {
      fallbackComponent?: ComponentType<Props> | undefined
    }
  ) => ComponentType<Props> | undefined;
};

type MiddlewareComponentProps<Request, Props, Init> = Props & {
  middleware: {
    init: Init;
    Next: ComponentType<Partial<Props>>;
    request: Request;
  }
}
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

If `passModifiedRequest` is default or `false`, middleware will not be allowed to pass another reference of `request` object to their `next()` middleware. Instead, the `request` object passed to `next()` will be ignored and the next middleware always receive the original `request` object. This behavior is similar to [Express](https://expressjs.com/) middleware.

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

### What is the difference between request, and props?

- Request is for *appearance*, while props is for *content*
- Request is for *deciding which component to render*, while props is for *what to render*

For example:

- Button
  - Request: button, link button, push button
  - Props: icon, text
- File preview
  - Request: image preview, video preview
  - Props: file name, URL
- Input
  - Request: text input, number input, password input
  - Props: label, value, instruction

### Why the type of request and props can be different?

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

With the default settings, if the `request` object passed to `next()` differs from the original `request` object, a reminder will be logged in the console.

### Why `request` cannot be modified using `asMiddleware` even `passModifiedRequest` is enabled?

Request is for deciding which component to render. It is a build-time value.

For component registered using `asMiddleware()`, the `request` prop is a render-time value. A render-time value cannot be used to influence build phase.

To modify request, the middleware component must be converted to functional programming.

## Behaviors

### `<Proxy>` vs. `useBuildComponentCallback`

Most of the time, use `<Proxy>` unless precise rendering is needed.

Behind the scene, `<Proxy>` call `useBuildComponentCallback()` to build the component it would morph into.

You can use the following decision tree to know when to use `<Proxy>` vs. `useBuildComponentCallback`

- If you need to know what kind of component will be rendered before actual render happen, use `useBuildComponentCallback()`
  - For example, using `useBuildComponentCallback()` allow you to know if the middleware would skip rendering the request
- If your component use `request` prop which is conflict with `<Proxy>`, use `useBuildComponentCallback()`
  - Also consider using a wrapping component to rename `request` prop
- Otherwise, use `<Proxy>`

### Calling `next()` multiple times

It is possible to call `next()` multiple times. However, the return value should be stable, calling it multiple times without a different request should yield the same result.

This is best used with options `passModifiedRequest` set to `true`. This combination allow a middleware to render the UI multiple times with some variations, such as rendering content and minimap at the same time.

### Calling `next()` later

This is not supported.

This is because React does not allow asynchronous render. An exception will be thrown if the `next()` is called after return.

### Good middleware is stateless

When writing middleware, keep them as stateless as possible and do not relies on data outside of the `request` object. The way it is writing should be similar to React function components.

When using functional programming to register the middleware, the return value should be stable.

### Good middleware returns `false`/`null`/`undefined` to skip rendering

If the middleware wants to skip rendering a request, return `false`/`null`/`undefined` directly. Do not return `() => false`, `<Fragment />`, or any other invisible components.

This helps the hosting component to determine whether the request would be rendered or not.

### Typing a component which expect no props to be passed

To type a component which expects no props to be passed, use `ComponentType<{ children?: undefined }>`.

In TypeScript, `{}` literally means any objects. Components of type `ComponentType<{}>` means [anything can be passed as props](https://www.typescriptlang.org/play?#code/C4TwDgpgBACgTgezAZygXigbwL4G4BQ+AxggHbLBRiIoBcsNqGmUyCAthMABYCWpAc3oByCABtkEYVDz4gA).

Although `Record<any, never>` means empty object, it is not extensible. Thus, [`Record<any, never> & { className: string }` means `Record<any, never>`](https://www.typescriptlang.org/play?#code/C4TwDgpgBACgTgezAZygXigJQgYwXAEwB4BDAOxABooyIA3COAPgG4AoUSKAZQFcAjeElQYhKKADIoAbyg4ANiWTIAciQC2EAFxRkwOAEsyAcygBfdmzxk9UMIhQ6+ghyJlzFytZp0BydSRGvubsQA).

## Inspirations

This package is heavily inspired by [Redux](https://redux.js.org/) middleware, especially [`applyMiddleware()`](https://github.com/reduxjs/redux/blob/master/docs/api/applyMiddleware.md) and [`compose()`](https://github.com/reduxjs/redux/blob/master/docs/api/compose.md). We read [this article](https://medium.com/@jacobp100/you-arent-using-redux-middleware-enough-94ffe991e6) to understand the concept, followed by some more readings on functional programming topics.

Over multiple years, the chain of responsibility design pattern is proven to be very flexible and extensible in [Bot Framework Web Chat](https://github.co/microsoft/BotFramework-WebChat/). Internal parts of Web Chat is written as middleware consumed by itself. Multiple bundles with various sizes can be offered by removing some middleware and treeshaking them off.

Middleware and router in [Express](https://expressjs.com/) also inspired us to learn more about this pattern. Their fallback middleware always returns 404 is an innovative approach.

[Microsoft Copilot](https://copilot.microsoft.com/) helped us understand and experiment with different naming.

### Differences from Redux and Express

The chain of responsibility design pattern implemented in [Redux](https://redux.js.org/) and [Express](https://expressjs.com/) prefers fire-and-forget execution (a.k.a. unidirectional): the result from the last middleware will not bubble up back to the first middleware. Instead, the caller may only collect the result from the last middleware, or via asynchronous and intermediate `dispatch()` calls. Sometimes, middleware may interrupt the execution and never return any results.

However, the chain of responsibility design pattern implemented in this package prefers synchronous call-and-return execution: the result from the last middleware will propagate back to the first middleware before returning to the caller. This gives every middleware a chance to manipulate the result from downstreamers before sending it back.

## Plain English

This package implements the _chain of responsibility_ design pattern. Based on _request_, the chain of responsibility will be asked to _build a React component_. The middleware would _form a chain_ and request is _passed to the first one in the chain_. If the chain decided to render it, a component will be returned, otherwise, `false`/`null`/`undefined`.

## Contributions

Like us? [Star](https://github.com/compulim/react-chain-of-responsibility/stargazers) us.

Want to make it better? [File](https://github.com/compulim/react-chain-of-responsibility/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/react-chain-of-responsibility/pulls) a pull request.
