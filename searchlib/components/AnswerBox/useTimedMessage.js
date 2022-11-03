import React from 'react';
import { atom, useAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';

export const messageFamily = atomFamily(
  ({ searchTerm, timeout }) => atom({ timeout }),
  (a, b) => a.searchTerm === b.searchTerm,
);

const useTimedMessage = ({ resultSearchTerm, timeout = 5 }) => {
  const messageAtom = messageFamily({ searchTerm: resultSearchTerm, timeout });
  const [count, setCount] = useAtom(messageAtom);

  // console.log('count', count, messageAtom, timeout, countRef);

  React.useEffect(() => {
    let ref;
    if (count.timeout > 0) {
      ref = setTimeout(() => {
        setCount({ timeout: count.timeout - 1 });
      }, 1000);
    }
    return () => ref && clearTimeout(ref);
  }, [setCount, count]);

  return count.timeout;
};

export default useTimedMessage;
