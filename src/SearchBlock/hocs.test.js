import { renderHook, act } from '@testing-library/react-hooks';
import { useDebouncedStableData } from './hocs';

jest.useFakeTimers();

describe('useDebouncedStableData', () => {
  it('should clear previous timers when data changes', () => {
    const { rerender } = renderHook(
      ({ data }) => useDebouncedStableData(data),
      {
        initialProps: { data: { key: 'initial' } },
      },
    );

    rerender({ data: { key: 'first update' } });
    rerender({ data: { key: 'second update' } });

    expect(clearTimeout).toHaveBeenCalledTimes(2);
  });

  it('should return initial data immediately', () => {
    const { result } = renderHook(() =>
      useDebouncedStableData({ key: 'value' }),
    );
    expect(result.current).toEqual({ key: 'value' });
  });

  it('should debounce updates', () => {
    const { result, rerender } = renderHook(
      ({ data }) => useDebouncedStableData(data),
      {
        initialProps: { data: { key: 'initial' } },
      },
    );

    // Initial render
    expect(result.current).toEqual({ key: 'initial' });

    // Update data
    rerender({ data: { key: 'updated' } });

    // Should not update immediately
    expect(result.current).toEqual({ key: 'initial' });

    // Fast-forward until all timers have been executed
    act(() => {
      jest.runAllTimers();
    });

    // Now it should be updated
    expect(result.current).toEqual({ key: 'updated' });
  });
});
