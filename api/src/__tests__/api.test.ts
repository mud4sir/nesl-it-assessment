import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { login } from '@/controllers/auth-controller';
import { getPosts, deletePostById } from '@/controllers/post-controller';
import { authorize } from '@/middleware/auth-middleware';
import { users, posts } from '@/config/db';
import { Roles } from '@/types/enums/enums.common';
import { ApiSuccess } from '@/utils/ApiSucess';
import { ApiError } from '@/utils/ApiError';

jest.mock('@/config/db');
jest.mock('jsonwebtoken');

const secretToken = process.env.JWT_SECRET || 'super-secret'

const mockRequest = (options: Partial<Request> = {}) => ({
  body: {},
  query: {},
  params: {},
  headers: {},
  ...options,
} as Request);

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockNext = jest.fn() as NextFunction;

describe('Login Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 for invalid credentials', async () => {
    const req = mockRequest({ body: { id: '999' } });
    const res = mockResponse();
    // (users.find as jest.Mock).mockReturnValue(undefined);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
  });
});

describe('Post Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (posts as any) = [
      { id: 1, title: 'Post 1' },
      { id: 2, title: 'Post 2' },
      { id: 3, title: 'Post 3' },
    ];
  });

  describe('getPosts', () => {
    it('should return paginated posts with correct headers', async () => {
      const req = mockRequest({ query: { page: '1', limit: '2' } });
      const res = mockResponse();

      await getPosts(req, res, mockNext);

      expect(res.set).toHaveBeenCalledWith({
        'X-Current-Page': '1',
        'X-Total-Pages': '2',
        'X-Total-Count': '3',
        'X-Per-Page': '2',
        'X-Has-Next-Page': 'true',
        'X-Has-Prev-Page': 'false',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.any(ApiSuccess)
      );
    });

    it('should handle default pagination parameters', async () => {
      const req = mockRequest({ query: {} });
      const res = mockResponse();

      await getPosts(req, res, mockNext);

      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'X-Current-Page': '1',
          'X-Per-Page': '10',
        })
      );
    });
  });

  describe('deletePostById', () => {
    it('should return 403 for non-admin users', async () => {
      const req = mockRequest({
        params: { id: '1' },
        user: { id: '1', role: Roles.USER },
      });
      const res = mockResponse();

      await deletePostById(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.any(ApiError)
      );
    });

    it('should return 404 for non-existent post', async () => {
      const req = mockRequest({
        params: { id: '999' },
        user: { id: '1', role: Roles.ADMIN },
      });
      const res = mockResponse();

      await deletePostById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.any(ApiError)
      );
    });

    it('should delete post successfully for admin', async () => {
      const req = mockRequest({
        params: { id: '1' },
        user: { id: '1', role: Roles.ADMIN },
      });
      const res = mockResponse();

      await deletePostById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.any(ApiSuccess)
      );
      expect(posts.length).toBe(2);
    });
  });
});

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secret';
  });

  it('should return 401 for missing token', async () => {
    const req = mockRequest({ headers: {} });
    const res = mockResponse();

    await authorize(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid token format' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 for invalid token format', async () => {
    const req = mockRequest({ headers: { authorization: 'Invalid' } });
    const res = mockResponse();

    await authorize(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid token format' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 500 if JWT_SECRET is not configured', async () => {
    const req = mockRequest({ headers: { authorization: 'Bearer token' } });
    const res = mockResponse();
    delete process.env.JWT_SECRET;

    await authorize(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'JWT secret is not configured' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 for expired token', async () => {
    const req = mockRequest({ headers: { authorization: 'Bearer expired-token' } });
    const res = mockResponse();
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new jwt.TokenExpiredError('jwt expired', new Date());
    });

    await authorize(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token expired' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 for invalid token', async () => {
    const req = mockRequest({ headers: { authorization: 'Bearer invalid-token' } });
    const res = mockResponse();
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new jwt.JsonWebTokenError('invalid token');
    });

    await authorize(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});