import React from 'react';
import { Modal, Button, Icon } from 'semantic-ui-react';
import AnswerFeedback from './AnswerFeedback';

export default (props) => {
  const [open, setOpen] = React.useState(false);
  return (
    <Modal
      closeIcon
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      trigger={
        <Button onClick={() => setOpen(true)} className="feedback-btn">
          About highlighted answers
          <Icon name="angle right" />
        </Button>
      }
    >
      <Modal.Header>About the answers to your query</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <p>
            When possible, we show direct answers to your queries if our system
            automatically detects them within the top search results. The
            answers highlighted are only from content available on our websites.
            We do not provide answers from other sources or generate new
            content.
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
              rel="noopener"
            >
              EEA Disclaimer
            </a>
          </p>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={() => setOpen(false)}>Close</Button>
      </Modal.Actions>
    </Modal>
  );
};
