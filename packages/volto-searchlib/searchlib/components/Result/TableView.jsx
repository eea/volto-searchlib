import React from 'react';
import { Table } from 'semantic-ui-react';
import { useAppConfig } from '@eeacms/search/lib/hocs';

const WrappedTable = (props) => {
  const { appConfig } = useAppConfig();
  const { tableViewParams } = appConfig;

  return (
    <Table celled compact>
      <Table.Header>
        <Table.Row>
          {tableViewParams.columns.map((col, index) => (
            <Table.HeaderCell key={index}>
              {col.title || col.field}
            </Table.HeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>{props.children}</Table.Body>
    </Table>
  );
};

const TableView = (props) => <WrappedTable {...props} />;
export default TableView;
