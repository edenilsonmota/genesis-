import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcryptjs";
import { User, UserStatus } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.users.findByEmailWithPassword(
      dto.email.trim().toLowerCase(),
    );
    const validPassword = user
      ? await compare(dto.password, user.passwordHash)
      : false;

    if (!user || !validPassword || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("E-mail ou senha inválidos");
    }

    const accessToken = await this.jwt.signAsync({ sub: user.id });
    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn: this.config.getOrThrow<string>("JWT_EXPIRES_IN"),
      user: this.serializeUser(user),
    };
  }

  serializeUser(user: User) {
    const roles = (user.roles ?? []).map((role) => role.name);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      isAdmin: roles.includes("admin"),
      roles,
      permissions: [],
      member: user.member
        ? {
            id: user.member.id,
            name: user.member.name,
            churchId: user.member.churchId,
          }
        : null,
    };
  }
}
