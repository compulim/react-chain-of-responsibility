// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function arePropsEqual<T extends Record<string, any>>(x: T, y: T): boolean {
  if (Object.is(x, y)) {
    return true;
  }

  const mapOfX = new Map(Object.entries(x));
  const mapOfY = new Map(Object.entries(y));

  if (mapOfX.size !== mapOfY.size) {
    return false;
  }

  const keys = new Set([...mapOfX.keys(), ...mapOfY.keys()]);

  for (const key of keys) {
    if (!Object.is(mapOfX.get(key), mapOfY.get(key))) {
      return false;
    }
  }

  return true;
}
