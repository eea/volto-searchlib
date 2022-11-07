import React from 'react';
import {
  Button,
  Form,
  Modal,
  Radio,
  Header,
  TextArea,
  Segment,
  Icon,
} from 'semantic-ui-react';
// import loadable from '@loadable/component';
// import { Icon } from '@eeacms/search/components';
import runRequest from '@eeacms/search/lib/runRequest';
import { useAppConfig } from '@eeacms/search/lib/hocs';

import { buildFeedbackRequest } from './buildRequest';

import { toast } from 'react-toastify';

const feedbacks = [
  { id: 'helpful', title: 'This is helpful' },
  { id: 'innacurate', title: 'This is misleading or innaccurate' },
  {
    id: 'wrongpassage',
    title: 'The document is correct but the marked answer is wrong',
  },
];

const AnswerFeedback = (props) => {
  const [open, setOpen] = React.useState(false);
  const [think, setThink] = React.useState('');
  const [comment, setComment] = React.useState('');
  const { answer, query } = props; // basic

  const { appConfig } = useAppConfig();

  const submitFeedback = React.useCallback(async () => {
    const state = { answer, query, feedback: think, comment };
    const req = buildFeedbackRequest(state, appConfig);
    await runRequest(req, appConfig);
    toast.info(<div>Feedback submitted. Thank you!</div>);
  }, [appConfig, answer, query, think, comment]);

  return (
    <Modal
      open={open}
      trigger={
        <Button
          // basic={basic}
          onClick={() => setOpen(true)}
          className="feedback-btn"
        >
          Help us improve our answers
          <Icon name="angle right" />
        </Button>
      }
    >
      <Modal.Header>What do you think?</Modal.Header>
      <Modal.Content>
        <Form>
          {feedbacks.map(({ id, title }) => (
            <Form.Field key={id}>
              <Radio
                name="feedback"
                label={title}
                checked={id === think}
                onChange={() => setThink(id)}
              />
            </Form.Field>
          ))}
          <Header as="h4">Comments or suggestions?</Header>
          <Form.Field>
            <TextArea
              placeholder="Optional"
              onChange={(e, { value }) => setComment(value)}
            ></TextArea>
          </Form.Field>
        </Form>
        <Segment>
          <p>
            The data you provide helps improve EEA Global Search.{' '}
            <a href="https://eea.europa.eu">Learn more</a>
          </p>
        </Segment>
      </Modal.Content>
      <Modal.Actions>
        <Button color="black" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          content="Send feedback"
          labelPosition="right"
          icon="checkmark"
          onClick={() => {
            submitFeedback(answer, feedbacks);
            setOpen(false);
          }}
          positive
        />
      </Modal.Actions>
    </Modal>
  );
};

export default AnswerFeedback;
