// JavaScript — Closures: the request handler retains its label and count between calls.
function logger(label) {
  let count = 0;
  return function (req, res, next) {
    count++;
    console.log(`[${label}] #${count} ${req.method} ${req.originalUrl}`);
    next(); // pass the request on to the next middleware
  };
}

module.exports = logger;
