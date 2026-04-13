import { Request, Response, NextFunction } from "express";
import { authenticate } from "../../src/middlewares/auth.middleware";
import * as jwtUtils from "../../src/utils/jwt";

jest.mock("../../src/utils/jwt");

const mockNext = jest.fn() as jest.MockedFunction<NextFunction>;

const buildRequest = (authHeader?: string): Partial<Request> => ({
  headers: { authorization: authHeader },
  userId: "",
  userEmail: "",
});

describe("authenticate middleware", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deve definir userId e chamar next() com token válido", () => {
    (jwtUtils.verifyToken as jest.Mock).mockReturnValue({
      userId: "uuid-1",
      email: "ana@email.com",
    });

    const req = buildRequest("Bearer valid-token") as Request;
    authenticate(req, {} as Response, mockNext);

    expect(req.userId).toBe("uuid-1");
    expect(req.userEmail).toBe("ana@email.com");
    expect(mockNext).toHaveBeenCalledWith();
  });

  it("deve lançar AppError 401 sem header Authorization", () => {
    const req = buildRequest(undefined) as Request;
    expect(() => authenticate(req, {} as Response, mockNext)).toThrow(
      expect.objectContaining({ statusCode: 401 }),
    );
  });

  it("deve lançar AppError 401 sem prefixo Bearer", () => {
    const req = buildRequest("Token xyz") as Request;
    expect(() => authenticate(req, {} as Response, mockNext)).toThrow(
      expect.objectContaining({ statusCode: 401 }),
    );
  });

  it("deve propagar erro do verifyToken", () => {
    (jwtUtils.verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error("jwt error");
    });
    const req = buildRequest("Bearer token-invalido") as Request;
    expect(() => authenticate(req, {} as Response, mockNext)).toThrow();
  });
});
