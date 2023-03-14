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
          When possible, we show direct answers to your queries if our system
          automatically detects them within the top search results. The answers
          highlighted are only from content available on our websites. We do not
          provide answers from other sources or generate new content.
        </p>
        <p>
          Our algorithm aims to provide you the most relevant and up-to-date
          results. In some cases, however, the algorithm could display results
          which are not the most relevant or up-to-date content we have
          available. We would be grateful if you could let us know. Your
          feedback can help us improve the algorithm, and hence the search
          results.
        </p>

        <AnswerFeedback />
        <p>
          <a
            href="https://www.eea.europa.eu/en/legal-notice#disclaimer"
            target="_blank"
            rel="noreferrer"
          >
            EEA Disclaimer
          </a>
        </p>
      </Modal.Content>
      <Modal.Actions>
        <Button color="black" onClick={() => setOpen(false)} positive>
          Help us improve our search
        </Button>
      </Modal.Actions>
    </Modal>
  );
};
