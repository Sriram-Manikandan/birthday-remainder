// Run with:  npm run concepts      (inside /server)
// Read the code, guess the output, then run it!

// ---------- 1. HOISTING ----------
console.log("--- Hoisting ---");
console.log(oldWay);          // undefined (var is hoisted, value is not)
var oldWay = "I am var";
sayHi();                      // works! function declarations are fully hoisted
function sayHi() { console.log("Hi from a hoisted function"); }
try { console.log(newWay); } catch (e) { console.log("let/const error:", e.message); }
let newWay = "I am let";      // let/const are in the "temporal dead zone" until this line

// ---------- 2. CLOSURES ----------
console.log("--- Closures ---");
function makeCounter() {
  let count = 0;                       // private variable
  return () => ++count;                // inner function remembers "count"
}
const counterA = makeCounter();
const counterB = makeCounter();
console.log(counterA(), counterA(), counterB()); // 1 2 1  (each has its own count)

// ---------- 3. EVENT LOOP ----------
console.log("--- Event loop ---");
console.log("1: sync start");
setTimeout(() => console.log("4: setTimeout (macrotask, runs last)"), 0);
Promise.resolve().then(() => console.log("3: promise (microtask, runs before timers)"));
console.log("2: sync end");
// Order: 1, 2, 3, 4 -> sync code first, then microtasks, then timers.

// ---------- 4. CALLBACKS vs PROMISES vs ASYNC/AWAIT ----------
function waitCallback(ms, done) { setTimeout(() => done("callback done"), ms); }
function waitPromise(ms) { return new Promise((resolve) => setTimeout(() => resolve("promise done"), ms)); }

// Callback style: nesting grows ("callback hell")
waitCallback(100, (msg1) => {
  console.log(msg1);
  waitCallback(100, (msg2) => console.log("nested", msg2));
});

// Promise style: chain with .then
waitPromise(300).then((msg) => { console.log(msg); return waitPromise(100); })
  .then((msg) => console.log("chained", msg));

// async/await: reads top-to-bottom like normal code
async function run() {
  const msg = await waitPromise(700);
  console.log("await:", msg);
}
run();
