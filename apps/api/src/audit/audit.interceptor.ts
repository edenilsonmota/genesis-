import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { User } from "../users/entities/user.entity";
import { AuditService } from "./audit.service";

type AuditRequest = {
  method: string;
  originalUrl: string;
  path: string;
  ip?: string;
  params: Record<string, string>;
  query: Record<string, unknown>;
  body: unknown;
  user?: User;
};

const MUTATIONS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const SENSITIVE = new Set(["password", "passwordhash", "currentpassword", "newpassword", "token", "accesstoken", "authorization", "jwtsecret"]);
function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, SENSITIVE.has(key.toLowerCase()) ? "[REDACTED]" : sanitize(item)]));
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuditRequest>();
    if (!MUTATIONS.has(request.method) || request.originalUrl.includes("/auth/login")) return next.handle();
    return next.handle().pipe(tap((response: unknown) => {
      const segments = request.path.split("/").filter(Boolean);
      const resource = segments[2] ?? segments[0] ?? "unknown";
      const responseId = response && typeof response === "object" && "id" in response ? String((response as { id: unknown }).id) : null;
      void this.audit.record({ userId: request.user?.id ?? null, userName: request.user?.name ?? null, userEmail: request.user?.email ?? null, action: request.method, resource, route: request.originalUrl.split("?")[0], recordId: request.params?.id ?? responseId, ipAddress: request.ip ?? null, details: sanitize({ params: request.params, query: request.query, body: request.body }) as Record<string, unknown> }).catch(() => undefined);
    }));
  }
}
