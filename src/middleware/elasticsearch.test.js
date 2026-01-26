import '@testing-library/jest-dom/extend-expect';

import { createHandler } from './elasticsearch';

// Mock superagent with proper chaining
const mockEnd = jest.fn();
const mockSet = jest.fn(() => ({ end: mockEnd }));
const mockSend = jest.fn(() => ({ set: mockSet }));

jest.mock('superagent', () => ({
  post: jest.fn(() => ({
    send: mockSend,
  })),
  get: jest.fn(() => ({
    end: mockEnd,
  })),
}));

// Mock @plone/volto/registry
jest.mock('@plone/volto/registry', () => ({
  __esModule: true,
  default: {
    settings: {
      searchlib: {
        searchui: {
          testApp: {
            name: 'testApp',
          },
        },
      },
    },
  },
}));

// Mock download
jest.mock('./download', () => jest.fn());

describe('elasticsearch middleware', () => {
  let handler;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = createHandler();
    mockRes = {
      send: jest.fn(),
    };
    mockNext = jest.fn();
    mockEnd.mockImplementation((callback) => {
      callback(null, { body: { hits: [] } });
    });
  });

  describe('createHandler', () => {
    it('should create a handler function', () => {
      expect(typeof handler).toBe('function');
    });
  });

  describe('search requests', () => {
    it('should handle POST search request', () => {
      mockReq = {
        method: 'POST',
        url: '/_es/testApp/_search',
        path: '/_es/testApp/_search',
        body: { query: { match_all: {} } },
      };

      handler(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalled();
    });

    it('should handle GET search request', () => {
      mockReq = {
        method: 'GET',
        url: '/_es/testApp/_search',
        path: '/_es/testApp/_search',
        body: {},
      };

      handler(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should remove config from body params', () => {
      mockReq = {
        method: 'POST',
        url: '/_es/testApp/_search',
        path: '/_es/testApp/_search',
        body: { params: { config: { sensitive: 'data' } } },
      };

      handler(mockReq, mockRes, mockNext);

      expect(mockReq.body.params.config).toBeUndefined();
    });
  });

  describe('settings requests', () => {
    it('should handle GET settings request', () => {
      mockReq = {
        method: 'GET',
        url: '/_es/testApp/_settings',
        path: '/_es/testApp/_settings',
      };

      handler(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('alias requests', () => {
    it('should handle GET alias request', () => {
      mockReq = {
        method: 'GET',
        url: '/_es/testApp/_alias',
        path: '/_es/testApp/_alias',
      };

      handler(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('document requests', () => {
    it('should handle GET document request', () => {
      mockReq = {
        method: 'GET',
        url: '/_es/testApp/_doc/123',
        path: '/_es/testApp/_doc/123',
      };

      handler(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('download requests', () => {
    it('should handle POST download request', () => {
      mockReq = {
        method: 'POST',
        url: '/_es/testApp/_download',
        path: '/_es/testApp/_download',
        body: {},
      };

      handler(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('unknown requests', () => {
    it('should call next for unknown requests', () => {
      mockReq = {
        method: 'GET',
        url: '/_es/unknownApp/_search',
        path: '/_es/unknownApp/_search',
      };

      handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next for non-matching methods', () => {
      mockReq = {
        method: 'DELETE',
        url: '/_es/testApp/_search',
        path: '/_es/testApp/_search',
      };

      handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('prefix handling', () => {
    it('should handle requests with prefix', () => {
      mockReq = {
        method: 'POST',
        url: '/_es/{status_}testApp/_search',
        path: '/_es/{status_}testApp/_search',
        body: {},
      };

      handler(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
