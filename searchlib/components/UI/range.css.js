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
    backgroundColor: 'var(--rangeTrackBackgroundColor)',
  },
  invertedTrack: {
    backgroundColor: 'var(--rangeInvertedTrackBackgroundColor)',
  },
  trackFill: {
    position: 'absolute',
    width: '0',
    height: '4px',
    borderRadius: '4px',
    top: '9px',
    left: '0',
    backgroundColor: 'var(--rangeTrackFillBackgroundColor)',
  },
  invertedTrackFill: {
    backgroundColor: 'var(--rangeInvertedTrackFillBackgroundColor)',
  },
  knob: {
    position: 'absolute',
    top: '0px',
    left: '0',
    height: '20px',
    width: '20px',
    background:
      'var(--backgroundColor) linear-gradient(transparent, var(--rangeKnobBackgroundColorGradient))',
    background:
      'var(--backgroundColor) -webkit-linear-gradient(transparent, var(--rangeKnobBackgroundColorGradient))',
    background:
      'var(--backgroundColor) -o-linear-gradient(transparent, var(--rangeKnobBackgroundColorGradient))',
    background:
      'var(--backgroundColor) -moz-linear-gradient(transparent, var(--rangeKnobBackgroundColorGradient))',
    borderRadius: '6px',
    backgroundColor: 'var(--rangeKnobBackgroundColor)',
    boxShadow:
      '0 1px 2px 0 var(--rangeKnobBoxShadowColor),0 0 0 1px var(--rangeKnobBoxShadowColor) inset',
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
    backgroundColor: 'var(--disabledTrackFillBackgroundColor)',
  },

  /*--------------
    Invalid-Input
---------------*/
  invalidInputTrack: {
    cursor: 'not-allowed',
    opacity: '.3',
    background: 'var(--invalidInputTrackBackgroundColor)',
  },
  invalidInputTrackFill: {
    opacity: '.0',
  },
};

export default styles;
