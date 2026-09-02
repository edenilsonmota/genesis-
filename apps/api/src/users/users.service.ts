import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  findByEmailWithPassword(email: string) {
    return this.users
      .createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .leftJoinAndSelect("user.roles", "roles")
      .leftJoinAndSelect("user.member", "member")
      .where("LOWER(user.email) = LOWER(:email)", { email })
      .getOne();
  }

  findAuthenticatedById(id: string) {
    return this.users.findOne({ where: { id }, relations: { member: true } });
  }

  async recordLogin(user: User) {
    user.lastLoginAt = new Date();
    await this.users.save(user);
  }
  async changePassword(user: User, passwordHash: string) {
    user.passwordHash = passwordHash;
    user.mustChangePassword = false;
    await this.users.save(user);
  }
}
