/** Who made a finance change, for `FinanceAuditLog` — the logged-in user from `verifyJWT`. */
export const toActor = (user: { id: string; role: string } | undefined) =>
  user ? { id: user.id, username: `${user.role}:${user.id}` } : undefined;
