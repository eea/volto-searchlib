// import React from 'react';
import { useAppConfig } from '@eeacms/search/lib/hocs';
import { getTermDisplayValue } from '@eeacms/search/lib/utils';

const Term = (props) => {
  const { term, field } = props;
  const { appConfig } = useAppConfig();
  const { vocab = {} } = appConfig;
  return getTermDisplayValue({ vocab, term, field });
};

export default Term;
