import { renderHook, act } from '@testing-library/react';
import {
  AI_SUMMARY_STORAGE_KEY,
  AI_SUMMARY_TOGGLE_EVENT,
  readAISummaryEnabled,
  writeAISummaryEnabled,
  useAISummaryToggle,
} from './aiSummaryToggle';

describe('aiSummaryToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('readAISummaryEnabled', () => {
    it('defaults to enabled when nothing is stored', () => {
      expect(readAISummaryEnabled()).toBe(true);
    });

    it('reads stored "1" as enabled', () => {
      window.localStorage.setItem(AI_SUMMARY_STORAGE_KEY, '1');
      expect(readAISummaryEnabled()).toBe(true);
    });

    it('reads stored "0" as disabled', () => {
      window.localStorage.setItem(AI_SUMMARY_STORAGE_KEY, '0');
      expect(readAISummaryEnabled()).toBe(false);
    });
  });

  describe('writeAISummaryEnabled', () => {
    it('persists the value in localStorage', () => {
      writeAISummaryEnabled(false);
      expect(window.localStorage.getItem(AI_SUMMARY_STORAGE_KEY)).toBe('0');

      writeAISummaryEnabled(true);
      expect(window.localStorage.getItem(AI_SUMMARY_STORAGE_KEY)).toBe('1');
    });

    it('dispatches the toggle event with the new value', () => {
      const listener = jest.fn();
      window.addEventListener(AI_SUMMARY_TOGGLE_EVENT, listener);
      try {
        writeAISummaryEnabled(false);
        expect(listener).toHaveBeenCalledWith(
          expect.objectContaining({ detail: false }),
        );
      } finally {
        window.removeEventListener(AI_SUMMARY_TOGGLE_EVENT, listener);
      }
    });
  });

  describe('useAISummaryToggle', () => {
    it('starts enabled by default and toggle persists the flip', () => {
      const { result } = renderHook(() => useAISummaryToggle());
      expect(result.current[0]).toBe(true);

      act(() => {
        result.current[1]();
      });

      expect(result.current[0]).toBe(false);
      expect(window.localStorage.getItem(AI_SUMMARY_STORAGE_KEY)).toBe('0');

      act(() => {
        result.current[1]();
      });

      expect(result.current[0]).toBe(true);
      expect(window.localStorage.getItem(AI_SUMMARY_STORAGE_KEY)).toBe('1');
    });

    it('reflects a value persisted by another component (same tab)', () => {
      window.localStorage.setItem(AI_SUMMARY_STORAGE_KEY, '0');
      const { result } = renderHook(() => useAISummaryToggle());
      expect(result.current[0]).toBe(false);
    });

    it('syncs live from the custom event', () => {
      const { result } = renderHook(() => useAISummaryToggle());
      expect(result.current[0]).toBe(true);

      act(() => {
        window.dispatchEvent(
          new CustomEvent(AI_SUMMARY_TOGGLE_EVENT, { detail: false }),
        );
      });

      expect(result.current[0]).toBe(false);
    });

    it('syncs from the storage event (cross-tab)', () => {
      const { result } = renderHook(() => useAISummaryToggle());
      expect(result.current[0]).toBe(true);

      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: AI_SUMMARY_STORAGE_KEY,
            newValue: '0',
          }),
        );
      });

      expect(result.current[0]).toBe(false);
    });
  });
});
