import React from 'react';
import { Button, Modal } from 'semantic-ui-react';
import { useAppConfig } from '@eeacms/search/lib/hocs';
import ReactJson from 'react-json-view';

const DebugConfig = (props) => {
  const [open, setOpen] = React.useState(false);
  const { appConfig } = useAppConfig();

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      trigger={<Button onClick={() => setOpen(true)}>Debug config</Button>}
    >
      <Modal.Header>Debug configuration</Modal.Header>
      <Modal.Content>
        <ReactJson src={appConfig} />
      </Modal.Content>
    </Modal>
  );
};

export default DebugConfig;
