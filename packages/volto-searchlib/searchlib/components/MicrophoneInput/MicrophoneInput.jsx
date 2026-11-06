import React from 'react';
import { Icon } from 'semantic-ui-react';
import cx from 'classnames';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';

const MicrophoneInput = ({ onChange }) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const timeoutRef = React.useRef();

  React.useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (transcript) {
        onChange(transcript);
        resetTranscript();
      }
    }, 1000);

    return () => {
      timeoutRef.current && clearTimeout(timeoutRef.current);
    };
  }, [onChange, resetTranscript, transcript]);

  if (!browserSupportsSpeechRecognition) {
    return '';
  }

  return (
    <div className={cx('ui button compact microphone-input', { listening })}>
      <Icon
        name={cx('microphone', { slash: listening })}
        role="button"
        onClick={() => {
          if (!listening) {
            SpeechRecognition.startListening();
          } else {
            SpeechRecognition.stopListening();
          }
        }}
      />
    </div>
  );
};

export default MicrophoneInput;
