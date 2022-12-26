import React from 'react';
import { SelectWidget } from '@plone/volto/components';
import { useSearchDriver } from '@eeacms/search/lib/hocs';
import BasicSearchApp from '@eeacms/search/components/SearchApp/BasicSearchApp';

function SortWidgetView(props) {
  const { onChange } = props;
  const driver = useSearchDriver();

  const handleOnChange = React.useCallback(
    (id, value) => {
      onChange(id, value);
      const [sortField, direction] = value.split('|');
      if (driver) driver.setSort(sortField, direction);
    },
    [onChange, driver],
  );

  return <SelectWidget {...props} onChange={handleOnChange} />;
}

function SortWidget(props) {
  return <BasicSearchApp {...props} searchViewComponent={SortWidgetView} />;
}

export default SortWidget;
