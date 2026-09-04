import React from 'react';

import { MutatingDots } from './MutatingDots';
import { Watch } from './Watch';
import { RevolvingDot } from './RevolvingDot';
import ThreeDots from './ThreeDots';

const Spinner = {
  // 'Audio',
  // 'BallTriangle',
  // 'Bars',
  // 'Circles',
  // 'Grid',
  // 'Hearts',
  // 'Oval',
  // 'Puff',
  // 'Rings',
  // 'TailSpin',
  ThreeDots,
  // 'RevolvingDot',
  // 'Triangle',
  // 'Plane',
  // 'CradleLoader',
  Watch,
  MutatingDots,
  RevolvingDot,
};

function componentName(type) {
  return Spinner[type] || Spinner.Watch;
}

export default function Loader(props) {
  const [display, setDisplay] = React.useState(true);

  React.useEffect(() => {
    let timer;
    if (props.timeout && props.timeout > 0) {
      timer = setTimeout(() => {
        setDisplay(false);
      }, props.timeout);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  });

  if (!props.visible || props.visible === 'false') {
    return null;
  }
  return display ? (
    <div aria-busy="true" className={props.className} style={props.style}>
      {React.createElement(componentName(props.type), { ...props })}
    </div>
  ) : null;
}
