export const isFunction = (value) =>
  value &&
  (Object.prototype.toString.call(value) === '[object Function]' ||
    'function' === typeof value ||
    value instanceof Function);
