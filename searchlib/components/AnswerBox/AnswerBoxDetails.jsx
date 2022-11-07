import React from 'react';
import { Modal, Button } from 'semantic-ui-react'; // Icon
import AnswerFeedback from './AnswerFeedback';

export default (props) => {
  const [open, setOpen] = React.useState(false);
  const { basic } = props;
  return (
    <Modal
      open={open}
      trigger={
        <Button
          basic={basic}
          onClick={() => setOpen(true)}
          className="header-btn"
        >
          {/*<Icon name="help circle" />*/}
          About direct answers
        </Button>
      }
    >
      <Modal.Header>Direct answers</Modal.Header>
      <Modal.Content>
        <p>
          Sometimes we show direct answers to your queries when our AI algorithm
          automatically detects them within the top search results.
        </p>
        <p>
          Some answers may not be correct or up to date, they may be based on
          obsolete content. Therefore, we appreciate your feedback to help us
          improve.
        </p>
        <p>
          Our goal is to keep this information and material timely and accurate.
          If errors are brought to our attention, we will try to correct them.
        </p>
        <AnswerFeedback />
        <p>
          <a
            href="https://www.eea.europa.eu/legal/disclaimer"
            target="_blank"
            rel="noreferrer"
          >
            EEA Disclaimer
          </a>
        </p>
      </Modal.Content>
      <Modal.Actions>
        <Button color="black" onClick={() => setOpen(false)} positive>
          OK
        </Button>
      </Modal.Actions>
    </Modal>
  );
};
