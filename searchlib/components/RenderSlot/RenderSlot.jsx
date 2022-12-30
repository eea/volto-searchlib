import React from 'react';

import { SEARCH_STATES } from '@eeacms/search/constants';

export default function RenderSlot(props) {
  const { slotName, searchState } = props;
  return props[slotName] ? props[slotName] : null;
}
