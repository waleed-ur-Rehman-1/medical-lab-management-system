// Reject requests with suspicious patterns + trim inputs
export function securityMiddleware(req, res, next) {
  // Remove MongoDB operators from body/query (prevents NoSQL injection)
  const stripOps = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) delete obj[key];
      else if (typeof obj[key] === 'object') stripOps(obj[key]);
    }
    return obj;
  };

  if (req.body) stripOps(req.body);
  if (req.query) stripOps(req.query);
  if (req.params) stripOps(req.params);
  next();
}

// Hide stack traces in production
export function safeErrorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' && status === 500
    ? 'Internal server error'
    : err.message;
  if (status === 500) console.error(`[${req.method} ${req.url}]`, err);
  res.status(status).json({ message });
}