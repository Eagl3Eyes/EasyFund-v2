import jwt from 'jsonwebtoken';

const SECRET = 'dev-access-secret-change-me';
process.env.ACCESS_TOKEN_SECRET = SECRET;
process.env.REFRESH_TOKEN_SECRET = 'dev-refresh-secret-change-me';
process.env.NODE_ENV = 'test';

import { verifyJWT, optionalAuth, authorize } from '../middleware/auth';

function mockReq(authHeader?: string, cookieToken?: string) {
  return {
    headers: { authorization: authHeader },
    cookies: { access_token: cookieToken },
  } as any;
}

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockNext() {
  return jest.fn();
}

describe('verifyJWT middleware', () => {
  it('calls next() with valid Bearer token', async () => {
    const token = jwt.sign({ userId: 'u1', email: 'a@b.com', role: 'user' }, SECRET, { expiresIn: '1h' });
    const req = mockReq(`Bearer ${token}`);
    const res = mockRes();
    const next = mockNext();

    await verifyJWT(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe('u1');
  });

  it('calls next() with valid cookie token', async () => {
    const token = jwt.sign({ userId: 'u1', email: 'a@b.com', role: 'user' }, SECRET, { expiresIn: '1h' });
    const req = mockReq(undefined, token);
    const res = mockRes();
    const next = mockNext();

    await verifyJWT(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });

  it('calls next(error) with no token', async () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    await verifyJWT(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeDefined();
    expect(error.message).toContain('Authentication required');
  });

  it('rejects promise with invalid token', async () => {
    const req = mockReq('Bearer invalid-token');
    const res = mockRes();
    const next = mockNext();

    await expect(verifyJWT(req, res, next)).rejects.toThrow('Invalid token');
  });

  it('rejects promise with expired token', async () => {
    const token = jwt.sign({ userId: 'u1', email: 'a@b.com', role: 'user' }, SECRET, { expiresIn: '-1h' });
    const req = mockReq(`Bearer ${token}`);
    const res = mockRes();
    const next = mockNext();

    await expect(verifyJWT(req, res, next)).rejects.toThrow();
  });
});

describe('optionalAuth middleware', () => {
  it('attaches user when token is valid', async () => {
    const token = jwt.sign({ userId: 'u1', email: 'a@b.com', role: 'user' }, SECRET, { expiresIn: '1h' });
    const req = mockReq(`Bearer ${token}`);
    const res = mockRes();
    const next = mockNext();

    await optionalAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe('u1');
  });

  it('calls next() without user when no token', async () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    await optionalAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });
});

describe('authorize middleware', () => {
  it('allows access for authorized role', () => {
    const req = mockReq();
    req.user = { userId: 'u1', email: 'a@b.com', role: 'admin' };
    const res = mockRes();
    const next = mockNext();

    authorize('admin')(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('throws for unauthorized role', () => {
    const req = mockReq();
    req.user = { userId: 'u1', email: 'a@b.com', role: 'user' };
    const res = mockRes();
    const next = mockNext();

    expect(() => authorize('admin')(req, res, next)).toThrow('Insufficient permissions');
  });

  it('allows access when user has one of multiple roles', () => {
    const req = mockReq();
    req.user = { userId: 'u1', email: 'a@b.com', role: 'fundraiser' };
    const res = mockRes();
    const next = mockNext();

    authorize('admin', 'fundraiser')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('throws when no user', () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    expect(() => authorize('admin')(req, res, next)).toThrow('Authentication required');
  });
});
