/**
 * This is a big "switch"
 */
// import React from 'react';

import { SEARCH_STATE_IDS } from '@eeacms/search/constants';

export default function RenderSlot(props) {
  const { slotName, searchState } = props;
  const anyStateId = `${slotName}-${SEARCH_STATE_IDS.any}`;
  const byStateId = `${slotName}-${SEARCH_STATE_IDS[searchState]}`;

  const anyState = props[anyStateId];
  const byState = props[byStateId];

  const res = props[slotName] || byState || anyState || null;
  return res;
}
