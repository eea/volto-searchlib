import React from 'react';
import { HistogramSlider } from '@eeacms/search/components/Vis';

import debounce from 'lodash.debounce';

const visualStyle = {
  selectedColor: '#55cee4',
  unselectedColor: '#e8e8e8',
  trackColor: '#00548a',
};

const useDebouncedInput = (initialValue) => {
  const [storedValue, setValue] = React.useState(initialValue);
  React.useEffect(() => {
    if (initialValue !== storedValue) {
      // console.log('should update internal state', {
      //   initialValue,
      //   storedValue,
      // });
      setValue(initialValue);
    }
  }, [storedValue, initialValue]);

  const timerRef = React.useRef();

  const changeHandler = React.useCallback((newValue, callback) => {
    setValue(newValue);
    timerRef.current && clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      // console.log('calling callback');
      callback();
    }, 1000);
  }, []);

  return [storedValue, changeHandler];
};

const HistogramFacetComponent = (props) => {
  const { data, histogram_range, onChange, selection } = props; // , step
  const {
    start = selection ? selection[0] : undefined ?? histogram_range.start,
    end = selection ? selection[1] : undefined ?? histogram_range.end,
  } = props;

  const [startValue] = useDebouncedInput(start);
  const [endValue] = useDebouncedInput(end);

  const debouncedSliderChangeHandler = React.useMemo(
    () =>
      debounce((sliderRange) => {
        onChange({ from: sliderRange[0], to: sliderRange[1] });
      }, 300),
    [onChange],
  );

  // step={step}
  return (
    <div className="histogram-facet">
      <div className="text-input">
        <label>{startValue}</label>
        <label>{endValue}</label>
      </div>

      <HistogramSlider
        data={data.map((d) => ({
          x0: d.value.from,
          x: d.value.to,
          y: d.count,
        }))}
        {...visualStyle}
        selection={[start, end]}
        onChange={debouncedSliderChangeHandler}
      />
    </div>
  );
};

export default HistogramFacetComponent;
