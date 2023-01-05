import React from 'react';
import { SelectWidget } from '@plone/volto/components';
import { useSearchContext } from '@eeacms/search/lib/hocs';

export default function SortWidget(props) {
  const { onChange } = props;
  const searchContext = useSearchContext();
  const { setSort } = searchContext;

  const handleOnChange = React.useCallback(
    (id, value) => {
      onChange(id, value);
      const [sortField, direction] = value.split('|');
      setSort(sortField, direction);
    },
    [onChange, setSort],
  );

  return <SelectWidget {...props} onChange={handleOnChange} />;
}
