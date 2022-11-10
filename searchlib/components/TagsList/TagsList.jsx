import React from 'react';

const TagsList = ({ value }) => {
  const valueArr = Array.isArray(value) ? value : [value];
  return valueArr.map((cVal, index) => <span key={index}>{cVal}</span>);
};
export default TagsList;
