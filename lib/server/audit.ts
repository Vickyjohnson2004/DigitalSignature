import { AuditLog } from './models/AuditLog';

export async function audit(
  userId: string | undefined,
  action: string,
  resourceType?: string,
  resourceId?: string,
  ip?: string,
  details?: unknown
): Promise<void> {
  try {
    await AuditLog.create({ userId, action, resourceType, resourceId, ip, details });
  } catch {
    // Non-critical — don't fail request if audit fails
  }
}
