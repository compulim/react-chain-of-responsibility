// TODO: Related to https://github.com/microsoft/TypeScript/issues/17002.
//       typescript@5.2.2 has a bug, Array.isArray() is a type predicate but only works with mutable array, not readonly array.
export default function isArray<T extends readonly unknown[]>(value: unknown): value is T {
  return Array.isArray(value);
}
