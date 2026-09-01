import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { hash } from "bcryptjs";
import { User, UserStatus } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  const users = {
    findByEmailWithPassword: jest.fn(),
  } as unknown as UsersService;
  const jwt = {
    signAsync: jest.fn().mockResolvedValue("signed-token"),
  } as unknown as JwtService;
  const config = {
    getOrThrow: jest.fn().mockReturnValue("15m"),
  } as unknown as ConfigService;
  const service = new AuthService(users, jwt, config);

  beforeEach(() => jest.clearAllMocks());

  async function user(status = UserStatus.ACTIVE) {
    return {
      id: "user-id",
      name: "Admin",
      email: "admin@example.com",
      passwordHash: await hash("correct-password", 4),
      status,
      roles: [{ id: "role-id", name: "admin", fixed: true, description: null }],
      member: null,
    } as User;
  }

  it("authenticates valid credentials without exposing sensitive data", async () => {
    jest
      .spyOn(users, "findByEmailWithPassword")
      .mockResolvedValue(await user());
    const result = await service.login({
      email: "ADMIN@example.com",
      password: "correct-password",
    });
    expect(result.accessToken).toBe("signed-token");
    expect(result.user.isAdmin).toBe(true);
    expect(result.user).not.toHaveProperty("passwordHash");
    expect(result).not.toHaveProperty("refreshToken");
  });

  it("rejects an invalid password with a generic message", async () => {
    jest
      .spyOn(users, "findByEmailWithPassword")
      .mockResolvedValue(await user());
    await expect(
      service.login({ email: "admin@example.com", password: "wrong-password" }),
    ).rejects.toEqual(new UnauthorizedException("E-mail ou senha inválidos"));
  });

  it("rejects inactive users", async () => {
    jest
      .spyOn(users, "findByEmailWithPassword")
      .mockResolvedValue(await user(UserStatus.INACTIVE));
    await expect(
      service.login({
        email: "admin@example.com",
        password: "correct-password",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
