// Wraps an async route so any error goes to the error handler (no try/catch everywhere).
// Another closure: the returned function remembers "fn".
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
