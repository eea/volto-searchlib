// import React from 'react';

const StringList = ({ value }) => {
  return Array.isArray(value) ? value.join(', ') : value || '';
};
export default StringList;
