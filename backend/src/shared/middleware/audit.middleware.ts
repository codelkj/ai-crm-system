/**
 * Audit Middleware
 * Automatic POPIA-compliant audit logging for all API requests
 */

import { Request, Response, NextFunction } from 'express';
import auditLogService, { AuditAction } from '../../modules/legal-crm/services/audit-log.service';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    firm_id: string;
    email: string;
    role?: any;
  };
}

/**
 * Map HTTP method to audit action
 */
function getActionFromMethod(method: string): string {
  const methodMap: { [key: string]: string } = {
    'POST': AuditAction.CREATE,
    'GET': AuditAction.READ,
    'PUT': AuditAction.UPDATE,
    'PATCH': AuditAction.UPDATE,
    'DELETE': AuditAction.DELETE
  };
  return methodMap[method] || method;
}

/**
 * Extract entity type from route path
 */
function getEntityTypeFromPath(path: string): string {
  // Extract entity type from path like /api/v1/companies/:id or /api/v1/deals/:id
  const matches = path.match(/\/api\/v1\/([^/]+)/);
  if (matches && matches[1]) {
    return matches[1].replace(/-/g, '_');
  }
  return 'unknown';
}

/**
 * Audit logging middleware
 * Logs all create, update, delete operations
 */
export const auditLog = (action?: AuditAction, entityType?: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Skip audit logging for read-only operations unless explicitly required
    if (req.method === 'GET' && !action) {
      return next();
    }

    // Intercept response to capture created/updated entity ID
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      // Log the action asynchronously (don't block response)
      setImmediate(async () => {
        try {
          const logAction = action || getActionFromMethod(req.method);
          const logEntityType = entityType || getEntityTypeFromPath(req.path);
          const entityId = req.params.id || body?.id || body?.data?.id;

          // Build changes object for UPDATE operations
          let changes: any = undefined;
          if (logAction === AuditAction.UPDATE && req.body) {
            changes = {
              old: (req as any)._auditOldData, // Set by controller before update
              new: req.body
            };
          }

          await auditLogService.log({
            firm_id: req.user?.firm_id || '',
            user_id: req.user?.id,
            action: logAction,
            entity_type: logEntityType,
            entity_id: entityId,
            changes: changes,
            ip_address: req.ip || req.socket.remoteAddress,
            user_agent: req.headers['user-agent']
          });
        } catch (error) {
          console.error('Audit logging failed:', error);
          // Don't throw - audit failures shouldn't break the main flow
        }
      });

      return originalJson(body);
    };

    next();
  };
};

/**
 * Audit log for custom actions (e.g., APPROVE, SEND)
 */
export const auditCustomAction = async (
  req: AuthRequest,
  action: string,
  entityType: string,
  entityId: string,
  reason?: string
) => {
  try {
    await auditLogService.log({
      firm_id: req.user?.firm_id || '',
      user_id: req.user?.id,
      action: action,
      entity_type: entityType,
      entity_id: entityId,
      reason: reason,
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent']
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
};

/**
 * Store old data before update for audit trail
 */
export const storeOldData = (oldData: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    (req as any)._auditOldData = oldData;
    next();
  };
};
