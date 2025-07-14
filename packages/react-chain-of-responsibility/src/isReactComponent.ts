import {
  type ComponentClass,
  type ComponentType,
  type Consumer,
  type Fragment,
  type FunctionComponent,
  type Provider
} from 'react';
import { custom } from 'valibot';

function isConsumer(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any
): component is Consumer<unknown> {
  return component?.$$typeof?.toString() === 'Symbol(react.context)';
}

function isProvider(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any
): component is Provider<unknown> {
  return component?.$$typeof?.toString() === 'Symbol(react.provider)';
}

function isFragment(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any
): component is typeof Fragment {
  return component?.toString() === 'Symbol(react.fragment)';
}

function isFunctionComponent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any
): component is FunctionComponent {
  if (typeof component === 'function') {
    return true;
  }

  return isPureFunctionComponent(component);
}

function isPureFunctionComponent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any
): component is FunctionComponent {
  return component?.$$typeof?.toString() === 'Symbol(react.memo)' && isFunctionComponent(component.type);
}

function isComponentClass(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any
): component is ComponentClass {
  return typeof component === 'object' && typeof component?.['render'] === 'function';
}

// There are no definitive ways to check if an object is a React component or not.
// We are checking if the object has a render function (classic component).
// Note: "forwardRef()" returns plain object, not class instance.
function isReactComponent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any
): component is ComponentType {
  return (
    isFunctionComponent(component) ||
    isComponentClass(component) ||
    isFragment(component) ||
    isConsumer(component) ||
    isProvider(component)
  );
}

const reactComponent = () =>
  custom<ComponentType<unknown>>(value => isReactComponent(value), 'not a valid React component');

export default isReactComponent;
export { reactComponent };
