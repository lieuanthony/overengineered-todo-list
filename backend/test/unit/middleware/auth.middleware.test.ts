import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authenticateToken, authenticateRefreshToken } from "../../../src/middleware/auth.middleware";

const mockReq = (overrides = {}) => ({ headers: {}, cookies: {}, ...overrides } as unknown as Request);
const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const next = jest.fn() as NextFunction;

describe("authenticateToken", () => {
  const payload = { userId: "user-123", email: "test@example.com" };

  it("calls next() with a valid access token", () => {
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "15m" });
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } });
    authenticateToken(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it("attaches user to req with a valid token", () => {
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "15m" });
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } });
    authenticateToken(req, mockRes(), next);
    expect((req as any).user).toMatchObject({ userId: "user-123" });
  });

  it("returns 401 when no token is provided", () => {
    const req = mockReq();
    const res = mockRes();
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when token is invalid", () => {
    const req = mockReq({ headers: { authorization: "Bearer badtoken" } });
    const res = mockRes();
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when token is expired", () => {
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "0s" });
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } });
    const res = mockRes();
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe("authenticateRefreshToken", () => {
  const payload = { userId: "user-123" };

  it("calls next() with a valid refresh token cookie", () => {
    const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });
    const req = mockReq({ cookies: { refreshToken: token } });
    authenticateRefreshToken(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it("returns 401 when no refresh token cookie is present", () => {
    const req = mockReq();
    const res = mockRes();
    authenticateRefreshToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when refresh token is invalid", () => {
    const req = mockReq({ cookies: { refreshToken: "badtoken" } });
    const res = mockRes();
    authenticateRefreshToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when refresh token is expired", () => {
    const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: "0s" });
    const req = mockReq({ cookies: { refreshToken: token } });
    const res = mockRes();
    authenticateRefreshToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});