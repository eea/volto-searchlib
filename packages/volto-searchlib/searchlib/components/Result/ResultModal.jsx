import React from 'react';
import { Modal, Item } from 'semantic-ui-react';
import String from './String';
import { firstWords } from '@eeacms/search/lib/utils';

export const ListingViewDetails = (props) => {
  const { result, appConfig } = props;
  const { listingViewParams } = appConfig;
  const { details } = listingViewParams;
  // console.log('result', { result, details });
  return (
    <div className="listing-view-details">
      {details.sections?.map((section, index) => {
        if (section.condition && !section.condition(result)) return null;
        return (
          <div className="listing-view-details-section" key={index}>
            {section.title ? (
              <h4>
                <String val={section.title} />
              </h4>
            ) : (
              ''
            )}
            {section.titleField ? (
              <h5>
                <String val={result[section.titleField]?.raw} />
              </h5>
            ) : (
              ''
            )}
            {section.fields?.map((field, index) => (
              <div className="details-field" key={index}>
                <div className="details-field-label">
                  <String val={field.label || field.field} />
                </div>
                <div className="details-field-value">
                  <String
                    val={result[field.field]?.raw ?? result[field.field]?.raw}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export const ResultHeader = (props) => {
  const [showModal, setShowModal] = React.useState(false);
  const { result, appConfig, details } = props;
  const { Level = 'h4', urlField, titleField } = props;
  const url = result[urlField]?.raw;
  const title = result[titleField]?.raw || result.id;
  const shortTitle = firstWords(title, 10);
  const modalHash = `showitem${result.id}`;

  const closeModal = () => {
    window.location.hash = '';
    setShowModal(false);
  };

  const resultID = result.id;

  const openModal = React.useCallback(() => {
    setShowModal(true);
    window.location.hash = modalHash;
  }, [modalHash]);

  React.useEffect(() => {
    if (window.location.hash.includes('showitem' + result.id)) {
      openModal();
    }
  }, [result.id, openModal, resultID]);

  return (
    <>
      <Level>
        {url ? (
          <a href={url} title={title}>
            {shortTitle}
          </a>
        ) : (
          <Item.Header
            className="listing-view-item"
            as="a"
            onClick={(e) => {
              openModal(true);
              e.preventDefault();
              e.stopPropagation();
            }}
            onKeyDown={() => openModal(true)}
            title={title}
          >
            {shortTitle}
          </Item.Header>
        )}
      </Level>
      <Modal
        open={showModal}
        onClose={() => closeModal(false)}
        onOpen={() => openModal(true)}
        closeOnDimmerClick={true}
        closeOnDocumentClick={true}
      >
        <Modal.Header>
          {details?.titleField
            ? firstWords(result[details.titleField]?.raw, 10)
            : 'Details:'}
        </Modal.Header>
        <Modal.Content scrolling>
          <ListingViewDetails result={result} appConfig={appConfig} />
        </Modal.Content>
        <Modal.Actions>
          <button
            style={{ marginRight: 14 + 'px' }}
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.href}`);
            }}
          >
            Copy permalink
          </button>
          <button onClick={() => closeModal(false)}>Close</button>
        </Modal.Actions>
      </Modal>
    </>
  );
};
