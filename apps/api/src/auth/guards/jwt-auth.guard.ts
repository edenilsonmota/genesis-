import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { isObservable, lastValueFrom } from "rxjs";
import { User } from "../../users/entities/user.entity";
import { ALLOW_PASSWORD_CHANGE } from "../password-change.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private readonly reflector: Reflector) {
    super();
  }
  async canActivate(context: ExecutionContext) {
    const result = super.canActivate(context);
    const active = isObservable(result)
      ? await lastValueFrom(result)
      : await result;
    const user = context.switchToHttp().getRequest().user as User;
    const allowed = this.reflector.getAllAndOverride<boolean>(
      ALLOW_PASSWORD_CHANGE,
      [context.getHandler(), context.getClass()],
    );
    if (user?.mustChangePassword && !allowed)
      throw new ForbiddenException("Altere sua senha para continuar");
    return active;
  }
}
