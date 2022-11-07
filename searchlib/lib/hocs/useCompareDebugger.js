// A fork of https://github.com/IPWright83/react-use-compare-debugger
// Solves transpilation problems
//
import { useEffect, useRef } from 'react';

const styles = {
  keyStyle: 'font-weight:bold;color:#746A7',
  arrowStyle: 'color:#353F47',
  prevStyle: 'color:#ABABAB',
  nextStyle: 'color:#43B25D',
  matchStyle: 'font-weight:bold;color:#17AFF0',
  unmatchStyle: 'font-weight:bold;color:#DB5D5E',
  mutations: {
    key: 'color:#353F47',
    warning: 'color:#E95420',
    error: 'font-weight:bold;color:#DB5D5E',
  },
};

const isFunction = (value) =>
  value && {}.toString.call(value) === '[object Function]';

const isObject = (value) => (value ? typeof value === 'object' : false);

const getFormat = (value) => {
  if (isFunction(value)) {
    return 'Function';
  }

  if (isObject(value)) {
    return 'Object';
  }

  return value;
};

/**
 * Log a primitive value to the console
 * @param  {String} key         The key of the values being compared
 * @param  {Any}    previous    The previous value
 * @param  {Any}    current     The current value
 */
const logValue = (key, previous, current) => {
  const areReferentiallyEqual = previous === current;
  const matchStyle = areReferentiallyEqual
    ? styles.matchStyle
    : styles.unmatchStyle;

  console.log(
    `%c${key}: %c${getFormat(previous)} %c=== %c${getFormat(
      current,
    )} %c${areReferentiallyEqual}`,
    styles.keyStyle,
    styles.prevStyle,
    styles.arrowStyle,
    styles.nextStyle,
    matchStyle,
  );
};

/**
 * Deep compare and log the properties of 2 objects using reference equality
 * @param  {Object}         previous    The previous object tree
 * @param  {Object}         current     The current object tree
 * @param  {Array<String>}  ignoreKeys  Any fields to ignore recursing into
 * @return {Array<Object>}              An array of fields that were mutated
 */
const deepCompare = (previous, current, ignoreKeys = [], depth = 0) => {
  // Grab the current set of keys
  const keys = Object.keys(current);
  const mutations = [];

  for (const key of keys) {
    // Grab the values out
    const currentValue = current[key];
    const previousValue = previous ? previous[key] : undefined;

    const _isObject = isObject(currentValue);
    const _isFunction = isFunction(currentValue);
    const _isMatch = currentValue === previousValue;

    // Recurse for nested objects, unless it's in the ignore list
    if (_isObject && !_isFunction) {
      if (ignoreKeys.includes(key)) {
        logValue(key, previousValue, currentValue);

        // Record the object is different, but we're not sure if it's nonReferentiallyEqual
        // as we haven't recursed into it
        if (_isMatch === false) {
          mutations.push({
            key,
            type: 'Object',
            isNonReferentiallyEqual: false,
          });
        }

        continue;
      }

      console.group(`${key} ${_isMatch}`);

      // Grab the set of mutations from the deepCompare
      const objMutations = deepCompare(
        previousValue,
        currentValue,
        ignoreKeys,
        depth++,
      );
      if (objMutations.length === 0 && _isMatch === false) {
        mutations.push({ key, type: 'Object', isNonReferentiallyEqual: true });
      } else {
        mutations.push(
          ...objMutations.map((o) => ({ ...o, key: `${key}.${o.key}` })),
        );
      }

      console.groupEnd();
      continue;
    }

    // Ignore some keys
    logValue(key, previousValue, currentValue);

    // Add to the list of mutations
    if (currentValue !== previousValue) {
      // If this is a function, determine if it is essentially the same
      if (_isFunction) {
        const currentF = (currentValue || '').toString();
        const previousF = (previousValue || '').toString();
        mutations.push({
          key,
          type: 'Function',
          isNonReferentiallyEqual: currentF == previousF,
        });
        continue;
      }

      mutations.push({ key, type: 'Primitive' });
    }
  }

  return mutations;
};

/**
 * Logs a mutation to the console
 * @param  {Object} m   The mutation to log
 */
const logMutation = (m) => {
  switch (m.type) {
    case 'Primitive':
      console.log(`%c${m.key}`, styles.mutations.key);
      break;

    case 'Object':
      // This is bad, the same content but a different reference
      if (m.isNonReferentiallyEqual) {
        console.log(
          `%c${m.key} - %cWARNING This is a new object reference that looks identical to the previous`,
          styles.mutations.key,
          styles.mutations.error,
        );
      } else {
        // As some fields were skipped, we can't be certain if this was a safe mutation or not
        console.log(
          `%c${m.key} - %cWARNING This object may be the same as the previous, however some fields were ignored in the comparison`,
          styles.mutations.key,
          styles.mutations.warning,
        );
      }
      break;
    case 'Function':
      // This is bad, the same function string but a different reference
      if (m.isNonReferentiallyEqual) {
        console.log(
          `%c${m.key} - %cWARNING This is a new function that looks identical to the previous`,
          styles.mutations.key,
          styles.mutations.error,
        );
      } else {
        console.log(`%c${m.key}`, styles.mutations.key);
        break;
      }
      break;
  }
};

/**
 * Debug state changes
 * @param  {String}         component   The name of the component you are testing
 * @param  {Object}         value       The current props
 * @param  {Array<String>}  ignoreKeys  Any fields to ignore recursing into
 * @return {Object}                     The old props
 */
function useCompareDebugger(component, value, ignoreKeys) {
  if (process.env.NODE_ENV !== 'development') {
    console.warn(
      `The useCompareDebugger should only be used when developing. It is still registered for ${component}`,
    );
  }

  const ref = useRef();

  // Record the previous value so we can compare later
  useEffect(() => {
    ref.current = value;
  }, [value]);

  // Log the comparison to the console
  console.groupCollapsed(`${component} ${new Date().toLocaleTimeString()}`);
  const mutations = deepCompare(ref.current, value, ignoreKeys);

  // Log the mutations
  console.group(`The following mutations were detected: `);
  mutations.forEach((m) => logMutation(m));
  console.groupEnd();

  console.groupEnd();

  return ref.current;
}

export default useCompareDebugger;
