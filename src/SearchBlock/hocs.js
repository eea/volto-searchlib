import React from 'react';
import { isEqual } from 'lodash';

export const useDebouncedStableData = (data, timeout = 100) => {
  const [stableData, setStableData] = React.useState(data);
  const timer = React.useRef();

  const isSameData = isEqual(stableData, data);

  React.useEffect(() => {
    if (timer.current) clearInterval(timer.current);

    timer.current = setTimeout(() => {
      if (!isSameData) setStableData(data);
    }, timeout);
    return () => timer.current && clearTimeout(timer.current);
  }, [data, isSameData, timeout]);

  return stableData;
};
