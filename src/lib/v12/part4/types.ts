export type UUID = string;

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; code: string; message: string };

export type TenantContext = {
  tenantId: UUID;
  actorId: UUID;
  permissions: ReadonlySet<string>;
};

export function requirePermission(ctx: TenantContext, permission: string): void {
  if (!ctx.permissions.has(permission)) {
    throw new Error(`FORBIDDEN:${permission}`);
  }
}
