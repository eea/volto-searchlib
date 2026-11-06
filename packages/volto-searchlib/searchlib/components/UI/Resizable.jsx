import React from 'react';
import { Icon } from 'semantic-ui-react';
import { Resizable as UIResizable } from 're-resizable';

const CustomHandle = (props) => {
  return (
    <div
      style={{
        width: '100%',
        padding: 0,
        textAlign: 'center',
      }}
      {...props}
    />
  );
};

const BottomHandle = (props) => (
  <CustomHandle>
    <Icon name="window minimize" color="grey" size="small" />
  </CustomHandle>
);

const Resizable = (props) => (
  <UIResizable
    defaultSize={{
      height: 200,
    }}
    minHeight={60}
    enable={{
      top: false,
      right: false,
      bottom: true,
      left: false,
      topRight: false,
      bottomRight: false,
      bottomLeft: false,
      topLeft: false,
    }}
    handleComponent={{
      bottom: <BottomHandle />,
    }}
  >
    {props.children}
  </UIResizable>
);

export default Resizable;
