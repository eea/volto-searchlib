import React from 'react';

const ExternalLink = (props) => {
  return (
    <a
      className={props.className}
      href={props.href}
      target="_blank"
      rel="noopener"
      style={props.style}
      title={props.title}
    >
      {props.children}
    </a>
  );
};

export default ExternalLink;
