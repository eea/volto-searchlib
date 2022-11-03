import { atom } from 'jotai';
import { atomFamily, useReducerAtom } from 'jotai/utils';

export function normalize_state(state) {
  let tmp_state = [];
  let has_names = true;

  if (typeof state?.[0] === 'string') {
    tmp_state = state;
  }

  if (typeof state?.[0] === 'object') {
    if (state?.[0]?.name) {
      tmp_state = state.map((st) => st.name);
      // } else if (state?.[0]?.to ?? null) {
      //   // support histogram range facet
      //   tmp_state = [
      //     ...state.map(({ from, to }) =>
      //       Array(to - from + 1)
      //         .fill(1)
      //         .map((x, y) => from - 1 + x + y),
      //     ),
      //   ];
      //   has_names = false;
    } else {
      tmp_state = state;
      has_names = false;
    }
  }

  return { tmp_state, has_names };
}

export const filterFamily = atomFamily(
  ({ filterName, initialState }) => atom(initialState),
  (a, b) => a.filterName === b.filterName,
);

export function filterStateReducer(prev, action) {
  const { value } = action;
  const { tmp_state, has_names } = normalize_state(prev);
  const tmp_value = typeof value === 'object' ? value.name : value;

  switch (action.type) {
    case 'set':
      if (has_names && tmp_state.includes(tmp_value)) {
        return [];
      }
      return action.force ? value : [...prev, value];
    case 'remove':
      return [...prev].filter((v) =>
        typeof v === 'object' ? v.name !== tmp_value : v !== tmp_value,
      );
    case 'reset':
      return [...action.value];
    default:
      throw new Error('unknown action type for filterStateReducer');
  }
}

export function useFilterState(filterName, initialState) {
  const filterAtom = filterFamily({ filterName, initialState });
  // return useReducerAtom(filterAtom, filterStateReducer);
  const [state, dispatch] = useReducerAtom(filterAtom, filterStateReducer);

  return [
    state,
    dispatch,
    (v) => {
      console.log('dispatch', filterName, v);
      return dispatch(v);
    },
  ];
}
