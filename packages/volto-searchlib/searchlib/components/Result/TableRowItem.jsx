import React from 'react';
import { useAppConfig } from '@eeacms/search/lib/hocs';
import { Table, Label } from 'semantic-ui-react';
import { ResultHeader } from './ResultModal';

const normalizeStr = (str) => {
  let tmp = document.createElement('DIV');
  tmp.innerHTML = str;
  str = tmp.textContent || tmp.innerText || '';
  return str;
};

const WrappedRowItem = (props) => {
  const { appConfig } = useAppConfig();
  const { tableViewParams } = appConfig;
  const { result } = props;
  const days =
    (Date.now() - Date.parse(result['issued']?.raw)) / 1000 / 60 / 60 / 24;
  // console.log('card props', props, appConfig);
  let expired = false;
  if (result['expires']?.raw !== undefined) {
    expired = Date.parse(result['expires']?.raw) < Date.now();
  }

  return (
    <Table.Row>
      {tableViewParams.columns.map((col, index) => (
        <Table.Cell key={index}>
          {index === 0 ? (
            <>
              <div>
                <ResultHeader
                  {...props}
                  {...tableViewParams}
                  appConfig={appConfig}
                />
              </div>
              {days < 30 ? (
                <>
                  &nbsp;
                  <Label className="new-item" horizontal>
                    New
                  </Label>
                </>
              ) : expired ? (
                <>
                  &nbsp;
                  <Label className="archived-item" horizontal>
                    Archived
                  </Label>
                </>
              ) : (
                ''
              )}
            </>
          ) : (
            normalizeStr(
              Array.isArray(result[col.field]?.raw)
                ? result[col.field]?.raw.sort().join(', ')
                : result[col.field]?.raw || '',
            )
          )}
        </Table.Cell>
      ))}
    </Table.Row>
  );
};

const TableRowItem = (props) => <WrappedRowItem {...props} />;

export default TableRowItem;
