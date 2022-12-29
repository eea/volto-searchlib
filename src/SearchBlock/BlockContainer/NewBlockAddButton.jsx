import React from 'react';
import { Button } from 'semantic-ui-react';
import { BlockChooser, Icon } from '@plone/volto/components';
import useOutsideClick from '@eeacms/search/lib/hocs/useOutsideClick';
import addSVG from '@plone/volto/icons/add.svg';

const NewBlockAddButton = (props) => {
  const { allowedBlocks, block, onMutateBlock } = props;
  const ref = React.useRef();
  const [isOpenMenu, setOpenMenu] = React.useState(false);

  useOutsideClick(ref, () => setOpenMenu(false));

  return (
    <>
      {isOpenMenu ? (
        <div ref={ref}>
          <BlockChooser
            onMutateBlock={onMutateBlock}
            currentBlock={block}
            showRestricted
            allowedBlocks={allowedBlocks}
          />
        </div>
      ) : (
        <Button
          basic
          icon
          onClick={() => setOpenMenu(true)}
          className="add-block-button"
          aria-label={`Add block in position ${block}`}
        >
          <Icon name={addSVG} className="circled" size="24px" />
        </Button>
      )}
    </>
  );
};

export default NewBlockAddButton;
