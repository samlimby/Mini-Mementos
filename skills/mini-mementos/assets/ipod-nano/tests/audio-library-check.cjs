// Run with: node tests/audio-library-check.cjs
// Exercise real scheduling code at different sections of every track. The mock
// records Web Audio parameters and catches invalid notes, offsets and envelopes.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
let clock = 0, starts = 0, frequencies = [], timerID = 0;
const intervals = new Map();
const finite = value => assert(Number.isFinite(value), `Invalid audio parameter: ${value}`);
const parameter = () => ({
  _value: 0,
  get value() { return this._value; },
  set value(value) { finite(value); this._value = value; },
  setValueAtTime(value, time) { finite(value); finite(time); },
  exponentialRampToValueAtTime(value, time) { finite(value); finite(time); assert(value > 0); },
  linearRampToValueAtTime(value, time) { finite(value); finite(time); },
  setTargetAtTime(value, time, constant) { finite(value); finite(time); finite(constant); },
  cancelScheduledValues: finite,
});
const node = () => ({ connect() {}, disconnect() {},
  gain: parameter(), frequency: parameter(), Q: parameter(), pan: parameter(), delayTime: parameter(),
  threshold: parameter(), knee: parameter(), ratio: parameter(), attack: parameter(), release: parameter(),
  start(time) { finite(time); assert(time >= clock); starts++; },
  stop: finite,
});
class AudioContext {
  state = 'running'; sampleRate = 8000; destination = node();
  get currentTime() { return clock; }
  createGain = node; createDynamicsCompressor = node; createBiquadFilter = node;
  createStereoPanner = node; createDelay = node; createBufferSource = node;
  createBuffer(channels, length) { return { getChannelData: () => new Float32Array(length) }; }
  createOscillator() {
    const oscillator = node();
    const start = oscillator.start;
    oscillator.start = time => { frequencies.push(oscillator.frequency.value); start(time); };
    return oscillator;
  }
}
const window = { AudioContext };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'audio-engine.js'), 'utf8'), {
  window, console,
  setInterval(fn) { const id = ++timerID; intervals.set(id, fn); return id; },
  clearInterval: id => intervals.delete(id),
  setTimeout(fn) { fn(); },
});
const audio = window.NanoAudio;
(async () => {
  const phrases = new Set();
  for (const [index, track] of audio.tracks.entries()) {
    let phrase;
    for (const offset of [0, 24, 64, track.duration - .5]) {
      frequencies = []; const before = starts;
      assert.equal(await audio.play(index, offset), true, track.title);
      for (let step = 0; step < 32; step++) {
        clock += .125; for (const schedule of intervals.values()) schedule();
      }
      assert(starts > before + 30, `${track.title} must produce sustained sound`);
      assert.equal(intervals.size, 1, 'skipping must leave one active scheduler');
      assert(audio.getPosition() > offset + 3);
      if (offset === 0) phrase = frequencies.join(',');
      audio.pause(); assert.equal(intervals.size, 0);
      const paused = audio.getPosition(); clock += 1;
      assert.equal(audio.getPosition(), paused, 'pause must freeze playback');
    }
    phrases.add(phrase);
    console.log(`PASS ${track.title}: intro, middle, later section and end seek`);
  }
  assert.equal(phrases.size, audio.tracks.length, 'every song must have its own audible phrase');
  console.log(`${audio.tracks.length}/${audio.tracks.length} audio scheduling checks passed`);
})().catch(error => { console.error(error); process.exitCode = 1; });
