import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { User } from "../../users/entities/user.entity";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const user = context.switchToHttp().getRequest().user as User | undefined;
    if (!user?.roles?.some((role) => role.name === "admin")) {
      throw new ForbiddenException("Acesso restrito ao administrador");
    }
    return true;
  }
}
