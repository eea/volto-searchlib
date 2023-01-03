import React from 'react';
import { Button } from 'semantic-ui-react';
import { BodyClass } from '@plone/volto/helpers';
import { BlockChooser, Icon } from '@plone/volto/components';
import useOutsideClick from '@eeacms/search/lib/hocs/useOutsideClick';
import addSVG from '@plone/volto/icons/circle-plus.svg';

const NewBlockAddButton = (props) => {
  const { allowedBlocks, block, onMutateBlock } = props;
  const ref = React.useRef();
  const [isOpenMenu, setOpenMenu] = React.useState(false);

  useOutsideClick(ref, () => setOpenMenu(false));

  return (
    <>
      {isOpenMenu ? (
        <BodyClass className="has-block-chooser">
          <div ref={ref}>
            <BlockChooser
              onMutateBlock={onMutateBlock}
              currentBlock={block}
              showRestricted
              allowedBlocks={allowedBlocks}
            />
          </div>
        </BodyClass>
      ) : (
        <Button
          basic
          icon
          title="Add block"
          onClick={() => setOpenMenu(true)}
          className="add-block-button"
          aria-label={`Add block in position ${block}`}
        >
          <Icon name={addSVG} size="24px" />
          Add block
        </Button>
      )}
    </>
  );
};

export default NewBlockAddButton;
