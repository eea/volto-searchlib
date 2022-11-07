import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Motion, spring } from 'react-motion';
import { withTooltip, Tooltip, defaultStyles } from '@visx/tooltip';

const DataTooltip = ({
  tooltipLeft,
  tooltipData,
  tooltipTop,
  fieldName,
  ...rest
}) => (
  <Tooltip
    top={tooltipTop}
    left={tooltipLeft}
    style={{
      ...defaultStyles,
      lineHeight: 'initial',
      boxShadow: '',
      fontSize: 'x-small',
    }}
  >
    <div style={{ color: 'black' }}>
      <strong>{`${tooltipData.x0} to ${tooltipData.x}`}</strong>
      <br />
      {fieldName}
      <br />
      {`${tooltipData.y} items`}
    </div>
  </Tooltip>
);

class Histogram extends Component {
  selectBucket(bucket) {
    this.props.onChange([bucket.x0, bucket.x]);
  }

  tooltipTimeout = React.createRef();

  render() {
    const {
      height,
      data,
      histogramStyle,
      showOnDrag,
      selection,
      reset,
      selectedColor,
      unselectedColor,
      scale,
      barBorderRadius,
      barStyle,
      padding,
      barPadding = 4,
      width,
      max,
      dragging,
      tooltipOpen,
      hideTooltip,
      showTooltip,
      // histogramPadding,
      // selectBucket,
    } = this.props;

    // TODO: properly implement react-motion; the "dragging" prop and
    // showOnDrag needs to be passed down;

    const selectionSorted = Array.from(selection).sort((a, b) => +a - +b);
    const showHistogramPredicate = showOnDrag
      ? dragging
        ? true
        : false
      : true;
    const h = showHistogramPredicate ? height : 0;
    const o = showHistogramPredicate ? 1 : 0;

    return (
      <Motion style={{ height: spring(h), opacity: spring(o) }}>
        {(s) => {
          return (
            <div
              style={Object.assign({}, s, {
                zIndex: 0,
                overflow: 'hidden',
                position: showOnDrag && 'absolute',
                bottom: showOnDrag && `calc(100% - ${padding}px)`,
              })}
            >
              <svg
                style={Object.assign(
                  {
                    display: 'block',
                    backgroundColor: 'white',
                  },
                  histogramStyle,
                )}
                width={width}
                height={height}
              >
                <g transform={`translate(0, ${height})`}>
                  <g transform="scale(1,-1)">
                    {data.map((bucket, i) => {
                      let opacity = 0;

                      if (
                        selectionSorted[0] > bucket.x ||
                        selectionSorted[1] < bucket.x0
                      ) {
                        opacity = 0;
                      } else if (
                        selectionSorted[0] <= bucket.x0 &&
                        selectionSorted[1] >= bucket.x
                      ) {
                        // Entire block is covered
                        opacity = 1;
                      } else if (
                        selectionSorted[0] > bucket.x0 &&
                        selectionSorted[1] > bucket.x
                      ) {
                        opacity =
                          1 -
                          (selectionSorted[0] - bucket.x0) /
                            (bucket.x - bucket.x0);
                        // Some of left block is covered
                      } else if (
                        selectionSorted[1] < bucket.x &&
                        selectionSorted[0] < bucket.x0
                      ) {
                        // Some of right block is covered
                        opacity =
                          (selectionSorted[1] - bucket.x0) /
                          (bucket.x - bucket.x0);
                      } else {
                        // Partial match
                        opacity =
                          (selectionSorted[1] - selectionSorted[0]) /
                          (bucket.x - bucket.x0);
                      }
                      // console.log(
                      //   'width',
                      //   bucket,
                      //   scale(bucket.x) - scale(bucket.x0) - barPadding,
                      // );
                      return (
                        <g
                          key={i}
                          transform={`translate(${
                            scale(bucket.x0) + barPadding / 2
                          } 0)`}
                        >
                          {opacity === 0 ? (
                            <rect
                              onClick={this.selectBucket.bind(this, bucket)}
                              onDoubleClick={reset.bind(this)}
                              fill={unselectedColor}
                              style={Object.assign({
                                cursor: 'pointer',
                              })}
                              width={
                                scale(bucket.x) -
                                scale(bucket.x0) -
                                barPadding -
                                4
                              }
                              height={(bucket.y / max) * height}
                              rx={barBorderRadius}
                              ry={barBorderRadius}
                              x={0}
                            />
                          ) : (
                            <rect
                              fill={selectedColor}
                              onClick={this.selectBucket.bind(this, bucket)}
                              onDoubleClick={reset.bind(this)}
                              style={Object.assign(
                                { opacity, cursor: 'pointer' },
                                barStyle,
                              )}
                              width={
                                scale(bucket.x) -
                                scale(bucket.x0) -
                                barPadding -
                                4
                              }
                              height={(bucket.y / max) * height}
                              rx={barBorderRadius}
                              ry={barBorderRadius}
                              x={0}
                              onMouseLeave={() => {
                                this.tooltipTimeout.current = window.setTimeout(
                                  () => {
                                    hideTooltip();
                                  },
                                  1000,
                                );
                              }}
                              onMouseMove={() => {
                                if (this.tooltipTimeout.current)
                                  clearTimeout(this.tooltipTimeout.current);
                                // const top = barY + barHeight + margin.top;
                                // const left = barX - barWidth + margin.left;
                                showTooltip({
                                  tooltipData: bucket,
                                  tooltipTop: 0,
                                  tooltipLeft: scale(bucket.x) - 50,
                                });
                              }}
                            />
                          )}
                        </g>
                      );
                    })}
                  </g>
                </g>
              </svg>

              {tooltipOpen && (
                <DataTooltip {...this.props} fieldName={this.props.label} />
              )}
            </div>
          );
        }}
      </Motion>
    );
  }
}

Histogram.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      x0: PropTypes.number,
      x: PropTypes.number,
      y: PropTypes.number,
    }),
  ).isRequired,
  selection: PropTypes.arrayOf(PropTypes.number).isRequired,
  barBorderRadius: PropTypes.number,
  bucketSize: PropTypes.number,
  width: PropTypes.number,
  innerWidth: PropTypes.number,
  height: PropTypes.number,
  showOnDrag: PropTypes.bool,
  reset: PropTypes.func,
  onChange: PropTypes.func,
};

// Histogram.defaultProps = {
//   histogramPadding: 1,
// };

export default withTooltip(Histogram);
