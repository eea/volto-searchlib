import React from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';

import { toast } from 'react-toastify';

const Toast = ({ level = 'warning', children, options }) => {
  useDeepCompareEffect(() => {
    const action = toast[level];
    action(<div>{children}</div>, { ...options });
  }, [children, level, options]);
  return null;
};

export default Toast;
