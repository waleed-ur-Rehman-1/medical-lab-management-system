export function notFound(req, res) {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
}
export function errorHandler(err, _req, res, _next) {
  console.error(err);
  const status = err.status || (err.name === "ValidationError" ? 400 : 500);
  res.status(status).json({ message: err.message || "Server error" });
}
