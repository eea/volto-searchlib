import React from 'react';

const String = ({ val }) => {
  return typeof val === 'string'
    ? val
    : Array.isArray(val)
    ? val.map((item, i) => (
        <span key={i} className="array-string-item">
          <String val={item} key={i} />
        </span>
      ))
    : `${val}`;
};

export default String;
