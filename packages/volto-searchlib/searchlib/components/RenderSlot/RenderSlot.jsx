import { SEARCH_STATE_IDS } from '@eeacms/search/constants';

export default function RenderSlot(props) {
  const { slotName, searchState } = props;
  const byStateId = `${slotName}-${SEARCH_STATE_IDS[searchState]}`;

  const byState = props[byStateId];

  const res = props[slotName] || byState || null;
  return res;
}
