// copied from @elastic/search-ui, as it's not exported

import queryString from 'qs';

function isTypeNumber(value) {
  return value !== undefined && value !== null && typeof value === 'number';
}
function isTypeBoolean(value) {
  return value && typeof value === 'boolean';
}
function toBoolean(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error('Invalid type parsed as Boolean value');
}

/* Encoder for qs library which preserve number types on the URL. Numbers
are padded with "n_{number}_n", and booleans with "b_{boolean}_b"*/
const preserveTypesEncoder = {
  encode(value, encode) {
    if (isTypeNumber(value)) {
      return `n_${value}_n`;
    }
    if (isTypeBoolean(value)) {
      return `b_${value}_b`;
    }
    return encode(value);
  },
  decode(value, decode) {
    //eslint-disable-next-line
    if (/n_-?[\d\.]*_n/.test(value)) {
      const numericValueString = value.substring(2, value.length - 2);
      return Number(numericValueString);
    }
    if (/^b_(true|false)*_b$/.test(value)) {
      const booleanValueString = value.substring(2, value.length - 2);
      return toBoolean(booleanValueString);
    }
    return decode(value);
  },
};

const qs = {
  parse(string) {
    return queryString.parse(string, {
      ignoreQueryPrefix: true,
      decoder: preserveTypesEncoder.decode,
      arrayLimit: 1000,
    });
  },
  stringify(object) {
    return queryString.stringify(object, {
      encoder: preserveTypesEncoder.encode,
    });
  },
};

function stateToParams({
  searchTerm,
  current,
  filters,
  resultsPerPage,
  sortDirection,
  sortField,
  sortList,
}) {
  const params = {};
  if (current > 1) params.current = current;
  if (searchTerm) params.q = searchTerm;
  if (resultsPerPage) params.size = resultsPerPage;
  if (filters && filters.length > 0) {
    params['filters'] = filters;
  }
  if (sortList && sortList.length > 0) {
    params['sort'] = sortList;
  } else if (sortField) {
    params['sort-field'] = sortField;
    params['sort-direction'] = sortDirection;
  }
  return params;
}

export function stateToQueryString(state) {
  return qs.stringify(stateToParams(state));
}
