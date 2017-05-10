let x = 123456789;
let y = 362436069;
let z = 521288629;
let w = 88675123;

export function seed(newSeed) {
  x = 123456789;
  y = 362436069;
  z = 521288629;
  w = newSeed;
}

export function nextInt() {
  const t = x ^ (x << 11);

  x = y;
  y = z;
  z = w;
  w = (w ^ (w >>> 19)) ^ (t ^ (t >>> 8));

  return w;
}

export function nextUInt() {
  return nextInt() >>> 0;
}

export function next() {
  return nextUInt() / 4294967296;
}
