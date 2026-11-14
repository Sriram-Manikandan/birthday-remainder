// Server-side error handling: forward rejected async route work to Express's error handler.
// JavaScript — Closures: the returned function retains "fn" until a request arrives.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
