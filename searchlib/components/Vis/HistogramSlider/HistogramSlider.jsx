import React from 'react';
import { Slider, Rail, Handles, Tracks, Ticks } from 'react-compound-slider';
import { SliderRail, Handle, Track, Tick } from './SliderComponents';
import Histogram from './Histogram';

import { max, min } from 'd3-array';
import { scaleLinear as linear } from 'd3-scale';

const sliderStyle = {
  position: 'relative',
  width: '100%',
};

const HistogramSlider = ({
  data,
  // width = 400,
  height = 200,
  padding = 10,
  sliderHeight = 0,
  defaultWidth = 200,
  selectedColor = 'blue',
  unselectedColor = '#e8e8e8',
  trackColor = 'red',
  selection,
  onChange,
}) => {
  const [width, setWidth] = React.useState(defaultWidth);
  const nodeRef = React.useRef();
  React.useEffect(() => {
    console.log('update width', nodeRef.current?.clientWidth);
    nodeRef.current && setWidth(nodeRef.current.clientWidth);
  }, []);

  const innerHeight = height - padding * 2;
  const innerWidth = width - padding * 2;
  const histogramHeight = innerHeight - sliderHeight;

  const sortedData = data.sort((a, b) => +a.x0 - +b.x0);
  const extent = [
    min(sortedData, ({ x0 }) => +x0),
    max(sortedData, ({ x }) => +x),
  ];
  const values = selection || [...extent];

  const maxValue = max(sortedData, ({ y }) => +y);

  const scale = linear().domain(extent).range([0, innerWidth]);
  scale.clamp(true);
  const step = (extent[1] - extent[0]) / data.length;

  // TODO: fix step, ticks count

  return (
    <div
      style={{
        height: `${height}px`,
        width: '100%',
        padding: `${padding}px`,
        marginBottom: '20px',
      }}
      ref={nodeRef}
    >
      <Histogram
        height={histogramHeight}
        data={data}
        selection={selection}
        scale={scale}
        width={width}
        reset={() => onChange([extent[0], extent[1]])}
        max={maxValue}
        barPadding={0}
        padding={0}
        onChange={onChange}
        showOnDrag={false}
        unselectedColor={unselectedColor}
        selectedColor={selectedColor}
      />
      <Slider
        mode={2}
        step={step}
        domain={extent}
        rootStyle={sliderStyle}
        onUpdate={onChange}
        onChange={onChange}
        values={values}
      >
        <Rail>
          {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
        </Rail>
        <Handles>
          {({ handles, activeHandleID, getHandleProps }) => (
            <div className="slider-handles">
              {handles.map((handle) => (
                <Handle
                  key={handle.id}
                  handle={handle}
                  domain={extent}
                  isActive={handle.id === activeHandleID}
                  getHandleProps={getHandleProps}
                />
              ))}
            </div>
          )}
        </Handles>
        <Tracks left={false} right={false}>
          {({ tracks, getTrackProps }) => (
            <div className="slider-tracks">
              {tracks.map(({ id, source, target }) => (
                <Track
                  trackColor={trackColor}
                  key={id}
                  source={source}
                  target={target}
                  getTrackProps={getTrackProps}
                />
              ))}
            </div>
          )}
        </Tracks>
        <Ticks count={5}>
          {({ ticks }) => (
            <div className="slider-ticks">
              {ticks.map((tick) => (
                <Tick key={tick.id} tick={tick} count={ticks.length} />
              ))}
            </div>
          )}
        </Ticks>
      </Slider>
    </div>
  );
};

export default HistogramSlider;
