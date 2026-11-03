// CLOSURE: the inner function "remembers" label and count
// even after logger() has finished running.
function logger(label) {
  let count = 0;
  return function (req, res, next) {
    count++;
    console.log(`[${label}] #${count} ${req.method} ${req.originalUrl}`);
    next(); // pass the request on to the next middleware
  };
}

module.exports = logger;
