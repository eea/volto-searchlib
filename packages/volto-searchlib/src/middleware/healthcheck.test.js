import '@testing-library/jest-dom';

import healthcheck from './healthcheck';
import { registry } from '@eeacms/search';

// Mock @eeacms/search with module factory
vi.mock('@eeacms/search', () => {
  const mockResolveObj = {};
  return {
    registry: {
      searchui: {
        testApp: {
          healthcheck: 'testHealthcheck',
        },
      },
      resolve: mockResolveObj,
    },
  };
});

describe('healthcheck middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear the resolve object
    Object.keys(registry.resolve).forEach((key) => {
      delete registry.resolve[key];
    });
    mockRes = {
      send: vi.fn(),
    };
    mockNext = vi.fn();
  });

  it('should return error when healthcheck function is not found', () => {
    mockReq = {
      params: { id: 'testApp' },
      query: {},
    };

    healthcheck(mockReq, mockRes, mockNext);

    expect(mockRes.send).toHaveBeenCalledWith({ error: 'config not found' });
  });

  it('should call healthcheck function when found', async () => {
    const mockHcFunction = vi.fn().mockResolvedValue({ status: 'ok' });
    registry.resolve.testHealthcheck = mockHcFunction;

    mockReq = {
      params: { id: 'testApp' },
      query: {},
    };

    healthcheck(mockReq, mockRes, mockNext);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockHcFunction).toHaveBeenCalled();
    expect(mockRes.send).toHaveBeenCalledWith({ status: 'ok' });
  });

  it('should handle healthcheck function errors', async () => {
    const mockError = { error: 'failed' };
    const mockHcFunction = vi.fn().mockRejectedValue(mockError);
    registry.resolve.testHealthcheck = mockHcFunction;

    mockReq = {
      params: { id: 'testApp' },
      query: {},
    };

    healthcheck(mockReq, mockRes, mockNext);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockHcFunction).toHaveBeenCalled();
    expect(mockRes.send).toHaveBeenCalledWith(mockError);
  });

  it('should merge query params with config', async () => {
    const mockHcFunction = vi.fn().mockResolvedValue({ status: 'ok' });
    registry.resolve.testHealthcheck = mockHcFunction;

    mockReq = {
      params: { id: 'testApp' },
      query: { customParam: 'value' },
    };

    healthcheck(mockReq, mockRes, mockNext);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockHcFunction).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ customParam: 'value' }),
    );
  });
});
