import React from 'react';
import { Button, Container, Icon } from 'semantic-ui-react';

const ViewSelector = (props) => {
  const { views, active, onSetView } = props;
  return (
    <Container className="view-selector">
      <Button.Group size="tiny" compact>
        {views.map((view) => {
          const { render: Render, icon, title } = view;
          return Render ? (
            <Render {...props} />
          ) : (
            <Button
              key={view.id}
              active={view.id === active}
              onClick={() => onSetView(view.id)}
            >
              {icon ? <Icon color="black" title={title} name={icon} /> : title}
            </Button>
          );
        })}
      </Button.Group>
    </Container>
  );
};

export default ViewSelector;
