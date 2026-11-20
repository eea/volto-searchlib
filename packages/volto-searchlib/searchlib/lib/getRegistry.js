/**
 * Lazy getter for registry to avoid circular dependencies.
 * Use this instead of directly importing registry in lib/ files.
 */
let registry = null;

export default function getRegistry() {
  if (!registry) {
    registry = require('@eeacms/search/registry').default;
  }
  return registry;
}
