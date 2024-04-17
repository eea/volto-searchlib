const styles = {
  range: {
    cursor: 'pointer',
    width: '100%',
    height: '20px',
  },
  inner: {
    margin: '0 10px 0 10px',
    height: '20px',
    position: 'relative',
  },
  /*
    .ui.range .inner:hover {
      cursor: pointer;
    }*/
  track: {
    position: 'absolute',
    width: '100%',
    height: '4px',
    borderRadius: '4px',
    top: '9px',
    left: '0',
    backgroundColor: 'var(--range-track-background-color)',
  },
  invertedTrack: {
    backgroundColor: 'var(--range-inverted-track-background-color)',
  },
  trackFill: {
    position: 'absolute',
    width: '0',
    height: '4px',
    borderRadius: '4px',
    top: '9px',
    left: '0',
    backgroundColor: 'var(--range-track-fill-background-color)',
  },
  invertedTrackFill: {
    backgroundColor: 'var(--range-inverted-track-fill-background-color)',
  },
  knob: {
    position: 'absolute',
    top: '0px',
    left: '0',
    height: '20px',
    width: '20px',
    background:
      'var(--background-color) linear-gradient(transparent, var(--range-knob-background-color-gradient))',
    background:
      'var(--background-color) -webkit-linear-gradient(transparent, var(--range-knob-background-color-gradient))',
    background:
      'var(--background-color) -o-linear-gradient(transparent, var(--range-knob-background-color-gradient))',
    background:
      'var(--background-color) -moz-linear-gradient(transparent, var(--range-knob-background-color-gradient))',
    borderRadius: '6px',
    backgroundColor: 'var(--range-knob-background-color)',
    boxShadow:
      '0 1px 2px 0 var(--range-knob-box-shadow-color),0 0 0 1px var(--range-knob-box-shadow-color) inset',
  },
  red: {
    backgroundColor: '#DB2828',
  },
  'inverted-red': {
    backgroundColor: '#FF695E',
  },
  /* Orange */
  orange: {
    backgroundColor: '#F2711C',
  },
  'inverted-orange': {
    backgroundColor: '#FF851B',
  },
  /* Yellow */
  yellow: {
    backgroundColor: '#FBBD08',
  },
  'inverted-yellow': {
    backgroundColor: '#FFE21F',
  },
  /* Olive */
  olive: {
    backgroundColor: '#B5CC18',
  },
  'inverted-olive': {
    backgroundColor: '#D9E778',
  },
  /* Green */
  green: {
    backgroundColor: '#21BA45',
  },
  'inverted-green': {
    backgroundColor: '#2ECC40',
  },
  /* Teal */
  teal: {
    backgroundColor: '#00B5AD',
  },
  'inverted-teal': {
    backgroundColor: '#6DFFFF',
  },
  /* Blue */
  blue: {
    backgroundColor: '#2185D0',
  },
  'inverted-blue': {
    backgroundColor: '#54C8FF',
  },
  /* Violet */
  violet: {
    backgroundColor: '#6435C9',
  },
  'inverted-violet': {
    backgroundColor: '#A291FB',
  },
  /* Purple */
  purple: {
    backgroundColor: '#A333C8',
  },
  'inverted-purple': {
    backgroundColor: '#DC73FF',
  },
  /* Pink */
  pink: {
    backgroundColor: '#E03997',
  },
  'inverted-pink': {
    backgroundColor: '#FF8EDF',
  },
  /* Brown */
  brown: {
    backgroundColor: '#A5673F',
  },
  'inverted-brown': {
    backgroundColor: '#D67C1C',
  },
  /* Grey */
  grey: {
    backgroundColor: '#767676',
  },
  'inverted-grey': {
    backgroundColor: '#DCDDDE',
  },
  /* Black */
  black: {
    backgroundColor: '#1b1c1d',
  },
  'inverted-black': {
    backgroundColor: '#545454',
  },
  /*--------------
    Disabled
---------------*/
  disabled: {
    cursor: 'not-allowed',
    opacity: '.5',
  },

  /*--------------
    Disabled
---------------*/

  disabledTrackFill: {
    backgroundColor: 'var(--disabled-track-fill-background-color)',
  },

  /*--------------
    Invalid-Input
---------------*/
  invalidInputTrack: {
    cursor: 'not-allowed',
    opacity: '.3',
    background: 'var(--invalid-input-track-background-color)',
  },
  invalidInputTrackFill: {
    opacity: '.0',
  },
};

export default styles;
