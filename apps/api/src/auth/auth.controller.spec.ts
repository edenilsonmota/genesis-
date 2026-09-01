import { GUARDS_METADATA } from "@nestjs/common/constants";
import { AuthController } from "./auth.controller";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

describe("AuthController", () => {
  it("/auth/me is protected by the JWT guard", () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      AuthController.prototype.me,
    ) as unknown[];
    expect(guards).toContain(JwtAuthGuard);
  });
});
