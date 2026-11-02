import { render, act } from '@testing-library/react';
import { trackEvent } from '@eeacms/volto-matomo/utils';
import useSummaryExposure from './useSummaryExposure';

jest.mock('@eeacms/volto-matomo/utils', () => ({ trackEvent: jest.fn() }));

const defaults = {
  enabled: true,
  searchTerm: 'Private search text',
  isLoading: false,
  action: 'Summary viewed',
  exposureKey: 'summary',
};

function Fixture(props) {
  const ref = useSummaryExposure(props);
  return <div ref={ref}>Visible content</div>;
}

describe('AI Summary viewport exposures', () => {
  let observers;
  const originalObserver = global.IntersectionObserver;

  beforeEach(() => {
    jest.clearAllMocks();
    observers = [];
    global.IntersectionObserver = jest.fn((callback) => {
      const observer = {
        callback,
        observe: jest.fn(),
        disconnect: jest.fn(),
      };
      observers.push(observer);
      return observer;
    });
  });

  afterEach(() => {
    global.IntersectionObserver = originalObserver;
  });

  const intersect = (observer, ratio = 0.5) => {
    act(() =>
      observer.callback([
        {
          target: observer.observe.mock.calls[0][0],
          isIntersecting: ratio > 0,
          intersectionRatio: ratio,
        },
      ]),
    );
  };

  it('waits for viewport visibility and counts an answer only once', () => {
    const { rerender } = render(<Fixture {...defaults} />);
    expect(trackEvent).not.toHaveBeenCalled();
    intersect(observers[0], 0);
    intersect(observers[0], 0.001);
    expect(trackEvent).not.toHaveBeenCalled();
    intersect(observers[0]);
    intersect(observers[0]);
    rerender(<Fixture {...defaults} />);
    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith({
      category: 'Search - AI summary',
      action: 'Summary viewed',
    });
    expect(observers[0].disconnect).toHaveBeenCalled();
  });

  it('counts disabled exposure independently, without recounting after a toggle', () => {
    const { rerender } = render(<Fixture {...defaults} />);
    intersect(observers[0]);
    rerender(
      <Fixture
        {...defaults}
        action="Disabled box viewed"
        exposureKey="disabled"
      />,
    );
    intersect(observers[1]);
    rerender(<Fixture {...defaults} />);
    expect(trackEvent).toHaveBeenCalledTimes(2);
    expect(trackEvent).toHaveBeenLastCalledWith({
      category: 'Search - AI summary',
      action: 'Disabled box viewed',
    });
  });

  it.each([
    { enabled: false },
    { isLoading: true },
    { searchTerm: '' },
    { action: null },
  ])('does not observe when exposure is not eligible (%j)', (overrides) => {
    render(<Fixture {...defaults} {...overrides} />);
    expect(global.IntersectionObserver).not.toHaveBeenCalled();
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it('counts the disabled box once for each completed search', () => {
    const props = {
      ...defaults,
      action: 'Disabled box viewed',
      exposureKey: 'disabled',
    };
    const { rerender } = render(<Fixture {...props} />);
    intersect(observers[0]);
    rerender(<Fixture {...props} isLoading />);
    intersect(observers[0]); // queued callback from the previous search
    expect(trackEvent).toHaveBeenCalledTimes(1);
    rerender(<Fixture {...props} isLoading={false} />);
    intersect(observers[1]);
    rerender(<Fixture {...props} searchTerm="Another private query" />);
    intersect(observers[2]);
    expect(trackEvent).toHaveBeenCalledTimes(3);
  });

  it('ignores stale observers on opt-out and unmount', () => {
    const { rerender, unmount } = render(<Fixture {...defaults} />);
    rerender(<Fixture {...defaults} enabled={false} />);
    intersect(observers[0]);
    rerender(<Fixture {...defaults} enabled />);
    unmount();
    intersect(observers[1]);
    expect(trackEvent).not.toHaveBeenCalled();
    expect(
      observers.every((observer) => observer.disconnect.mock.calls.length > 0),
    ).toBe(true);
  });

  it('does not invent an exposure if IntersectionObserver is unavailable', () => {
    global.IntersectionObserver = undefined;
    render(<Fixture {...defaults} />);
    expect(trackEvent).not.toHaveBeenCalled();
  });
});
