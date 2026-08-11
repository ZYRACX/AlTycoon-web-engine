export class SystemClock {
  now() {
    return Date.now();
  }
}
export class MockClock {
  constructor(initial = 0) {
    this.time = initial;
  }
  now() {
    return this.time;
  }
  advance(milliseconds) {
    this.time += milliseconds;
    return this.time;
  }
  set(time) {
    this.time = time;
  }
}
export class SeededRandomSource {
  constructor(seed = 1) {
    this.seed = seed >>> 0;
  }
  random() {
    this.seed = (1664525 * this.seed + 1013904223) >>> 0;
    return this.seed / 2 ** 32;
  }
  randomInt(min, max) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }
  weightedChoice(choices) {
    const total = choices.reduce((n, x) => n + x.weight, 0);
    let roll = this.random() * total;
    return choices.find((x) => (roll -= x.weight) <= 0)?.value;
  }
}
