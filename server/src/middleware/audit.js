import AuditLog from '../models/AuditLog.js';

/**
 * Per-route audit middleware.
 * Usage:
 *   router.post('/', protect, auditLogger('CREATE', 'Patient'), handler);
 *
 * Logs asynchronously AFTER the response is sent, so it never slows the request.
 * Only logs successful responses (2xx).
 */
export function auditLogger(action, entity) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      res.on('finish', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          AuditLog.create({
            actor: req.user?._id,
            action,
            entity,
            entityId: body?._id || req.params?.id,
            changes: body,
            ip: req.ip,
            userAgent: req.headers['user-agent']
          }).catch((e) => console.error('Audit log failed:', e.message));
        }
      });
      return originalJson(body);
    };
    next();
  };
}

/**
 * Global request logger — records every authenticated request.
 * Optional. Mount this AFTER `protect` in index.js if you want a broad trail.
 */
export function globalAudit(req, res, next) {
  res.on('finish', () => {
    if (!req.user) return;
    if (res.statusCode >= 400) return;
    const methodMap = { POST: 'CREATE', PATCH: 'UPDATE', PUT: 'UPDATE', DELETE: 'DELETE', GET: 'READ' };
    AuditLog.create({
      actor: req.user._id,
      action: methodMap[req.method] || req.method,
      entity: req.baseUrl.replace('/api/v1/', ''),
      entityId: req.params?.id,
      changes: { path: req.originalUrl, body: req.method !== 'GET' ? req.body : undefined },
      ip: req.ip,
      userAgent: req.headers['user-agent']
    }).catch(() => {});
  });
  next();
}