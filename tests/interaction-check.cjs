// Run with: node tests/interaction-check.cjs
// Exercises the installed event handlers in index.html, with deterministic time
// and audio. This checks interaction behavior, not browser rendering or sound.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert(scripts.length, 'index.html must contain its interaction script');
const source = scripts.at(-1)[1];
const audioSource = fs.readFileSync(path.join(__dirname, '..', 'audio-engine.js'), 'utf8');
const libraryWindow = {};
vm.runInNewContext(audioSource, { window: libraryWindow });
const library = JSON.parse(JSON.stringify(libraryWindow.NanoAudio.tracks));
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };

function harness({ reducedMotion = false, library: installedLibrary, random = Math.random } = {}) {
  let now = 100000, timerID = 0;
  const timers = new Map();
  const addTimer = (fn, delay, interval) => {
    const id = ++timerID;
    timers.set(id, { fn, at: now + Math.max(0, Number(delay) || 0), interval });
    return id;
  };
  const classes = () => {
    const values = new Set();
    return { add: name => values.add(name), remove: name => values.delete(name),
      contains: name => values.has(name), toggle(name, force) {
        const on = force ?? !values.has(name); on ? values.add(name) : values.delete(name); return on;
      } };
  };
  const elements = new Map();
  const actionElements = new Map();
  class Element {
    constructor(id, tagName = 'DIV') {
      this.id = id; this.tagName = tagName; this.dataset = {}; this.style = {};
      this.classList = classes(); this.listeners = new Map(); this.attributes = {};
      this.innerHTML = ''; this.textContent = ''; this.captures = new Set(); this.parentElement = null;
    }
    addEventListener(type, fn) {
      const listeners = this.listeners.get(type) || [];
      listeners.push(fn); this.listeners.set(type, listeners);
    }
    dispatch(type, event) { for (const fn of this.listeners.get(type) || []) fn(event); }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    querySelector(selector) {
      const match = selector.match(/^\[data-action="(.+)"\]$/);
      if (match) {
        if (!actionElements.has(match[1])) actionElements.set(match[1], new Element(match[1], 'G'));
        return actionElements.get(match[1]);
      }
      if (selector === 'span') return get(`${this.id}-span`);
      return null;
    }
    querySelectorAll(selector) {
      return selector === '.down' ? [...actionElements.values()].filter(el => el.classList.contains('down')) : [];
    }
    closest(selector) {
      const selectors = selector.split(',').map(value => value.trim());
      for (let el = this; el; el = el.parentElement) {
        if (selectors.some(value => {
          if (value.startsWith('#')) return el.id === value.slice(1);
          const attr = value.match(/^\[data-([a-z-]+)\]$/);
          if (attr) return Object.hasOwn(el.dataset, attr[1].replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()));
          return el.tagName.toLowerCase() === value.toLowerCase();
        })) return el;
      }
      return null;
    }
    focus() { this.wasFocused = true; }
    getBoundingClientRect() { return { x: 0, y: 0, width: 700, height: 460, top: 0, left: 0, right: 700, bottom: 460 }; }
    setPointerCapture(id) { this.captures.add(id); }
    hasPointerCapture(id) { return this.captures.has(id); }
    releasePointerCapture(id) { this.captures.delete(id); }
  }
  function get(id) {
    if (!elements.has(id)) elements.set(id, new Element(id));
    return elements.get(id);
  }
  // The fixture records ancestor relationships used by closest(); it does not
  // emulate layout. Camera events below call the actual plate handlers.
  const child = (id, parent, tagName = 'G') => {
    const el = get(id); el.parentElement = get(parent); el.tagName = tagName; return el;
  };
  child('stage', 'plate', 'SVG'); child('device', 'stage');
  child('wheel-plane', 'device'); child('wheel-area', 'wheel-plane');
  child('screen', 'device'); child('center-button', 'device');
  child('fixture-button', 'plate', 'BUTTON');
  child('inspect-view', 'plate'); child('inspection-stage', 'inspect-view', 'SVG');
  for (const id of ['inspect-toggle']) child(id, 'plate', 'BUTTON');
  const buttons = ['up', 'down', 'back', 'select', 'menu', 'play', 'next', 'previous'].map(action => {
    const button = new Element(`button-${action}`, 'BUTTON'); button.dataset.action = action; return button;
  });
  const document = Object.assign(new Element('document'), { getElementById: get, documentElement: { dataset: { theme: 'dark' } },
    querySelectorAll: selector => selector === 'button[data-action]' ? buttons : [], title: '', hidden: false });
  const window = new Element('window');
  const motionPreference = { matches: reducedMotion, media: '(prefers-reduced-motion: reduce)',
    addEventListener() {}, removeEventListener() {} };
  window.matchMedia = () => motionPreference;
  const calls = [];
  let audioPlaying = false, audioPosition = 0, audioAnchor = now;
  const audio = {
    supported: true,
    tracks: installedLibrary || [
      { title: 'First', artist: 'Demo', album: 'One', duration: 200 },
      { title: 'Second', artist: 'Demo', album: 'Two', duration: 192 },
      { title: 'Third', artist: 'Demo', album: 'Three', duration: 176 },
    ],
    getPosition: () => audioPosition + (audioPlaying ? (now - audioAnchor) / 1000 : 0),
    async play(track, offset) {
      calls.push({ method: 'play', track, offset });
      audioPosition = offset; audioAnchor = now; audioPlaying = true; return true;
    },
    pause() {
      audioPosition = audio.getPosition(); audioPlaying = false;
      calls.push({ method: 'pause', position: audioPosition });
    },
    isPlaying: () => audioPlaying,
    setVolume: value => calls.push({ method: 'volume', value }),
  };
  window.NanoAudio = audio;
  const renderCalls = [], rendererCreates = [];
  const NanoInspector = { create(svg, options) {
    rendererCreates.push({ svg, options });
    return { render(camera) {
      const view = Object.fromEntries(['yaw', 'pitch', 'roll', 'zoom', 'centerX', 'centerY'].map(key => [key, camera[key]]));
      renderCalls.push(view);
      Object.assign(svg.dataset, Object.fromEntries(Object.entries(view).map(([key, value]) => [key, String(value)])));
    } };
  } };
  window.NanoInspector = NanoInspector;
  const requestAnimationFrame = fn => {
    const id = addTimer(() => fn(now), 16, 0); timers.get(id).kind = 'frame'; return id;
  };
  const cancelAnimationFrame = id => timers.delete(id);
  Object.assign(window, { requestAnimationFrame, cancelAnimationFrame, performance: { now: () => now } });
  class ClockDate extends Date { static now() { return now; } }
  const context = vm.createContext({ document, window, NanoAudio: audio, NanoInspector, console, Date: ClockDate,
    Math: Object.assign(Object.create(Math), { random }),
    performance: window.performance, requestAnimationFrame, cancelAnimationFrame,
    setTimeout: (fn, delay) => addTimer(fn, delay, 0),
    setInterval: (fn, delay) => addTimer(fn, delay, delay),
    clearTimeout: id => timers.delete(id), clearInterval: id => timers.delete(id) });
  vm.runInContext(source, context, { filename: 'index.html:interaction-script' });
  const state = () => JSON.parse(vm.runInContext('JSON.stringify(state)', context));
  const dispatchKey = (type, key, options = {}) => {
    const event = { key, target: get('body'), repeat: false, metaKey: false, ctrlKey: false, altKey: false,
      prevented: false, preventDefault() { this.prevented = true; }, ...options };
    window.dispatch(type, event); return event;
  };
  const tick = async milliseconds => {
    const end = now + milliseconds;
    for (;;) {
      const next = [...timers.entries()].filter(([, timer]) => timer.at <= end)
        .sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
      if (!next) break;
      const [id, timer] = next; now = timer.at;
      if (timer.interval) timer.at += timer.interval; else timers.delete(id);
      timer.fn(); await flush();
    }
    now = end; await flush();
  };
  const tap = async key => { dispatchKey('keydown', key); dispatchKey('keyup', key); await flush(); };
  const wheel = async deltaY => {
    get('stage').dispatch('wheel', { target: get('device'), ctrlKey: false, deltaY, deltaX: 0, deltaMode: 0,
      preventDefault() {} }); await flush();
  };
  const pointer = (type, target = 'plate', options = {}) => {
    const event = { target: typeof target === 'string' ? get(target) : target,
      button: 0, pointerId: 1, clientX: 100, clientY: 100, preventDefault() {}, ...options };
    get('plate').dispatch(type, event); return event;
  };
  const frameClick = target => { pointer('pointerdown', target); pointer('pointerup', target); };
  const inspectPointer = (type, options = {}) => {
    const event = { target: get('inspection-stage'), button: 0, pointerId: 1, clientX: 100, clientY: 100,
      prevented: false, preventDefault() { this.prevented = true; }, ...options };
    get('inspection-stage').dispatch(type, event); return event;
  };
  const inspectWheel = (deltaY, options = {}) => {
    const event = { target: get('inspection-stage'), deltaY, deltaX: 0, deltaMode: 0, ctrlKey: false,
      prevented: false, preventDefault() { this.prevented = true; }, ...options };
    get('inspection-stage').dispatch('wheel', event); return event;
  };
  return { state, tap, tick, wheel, keyDown: (key, options) => dispatchKey('keydown', key, options),
    keyUp: (key, options) => dispatchKey('keyup', key, options), window, document, calls, get, child, pointer, frameClick,
    inspectPointer, inspectWheel, renderCalls, rendererCreates, buttons,
    pendingFrames: () => [...timers.values()].filter(timer => timer.kind === 'frame').length,
    click: id => get(id).dispatch('click', {}),
    read: expression => vm.runInContext(expression, context) };
}

const cases = [];
const test = (name, fn) => cases.push({ name, fn });

const keycap = (h, action) => h.buttons.find(button => button.dataset.action === action);
const depressed = (h, action) => keycap(h, action).classList.contains('is-pressed');

test('every displayed keyboard shortcut depresses immediately, stays held through repeat and releases', async () => {
  for (const [key, action] of [['ArrowUp','up'],['ArrowDown','down'],['ArrowLeft','back'],['ArrowRight','select'],
    ['W','menu'],['s','play'],['d','next'],['a','previous']]) {
    const h = harness(); h.keyDown(key);
    assert(depressed(h, action), key);
    assert.equal(h.buttons.filter(button => button.classList.contains('is-pressed')).length, 1);
    await h.tick(100); h.keyDown(key, { repeat: true });
    assert(depressed(h, action), `${key} repeat must not release the keycap`);
    await h.tick(100); h.keyUp(key);
    assert.equal(depressed(h, action), false, `${key} held release must be immediate`);
  }
});

test('quick keycap taps remain perceptible and rapid taps cannot be released by an older timer', async () => {
  const h = harness(); await h.tap('ArrowDown');
  assert(depressed(h, 'down'));
  await h.tick(40); await h.tap('ArrowDown');
  await h.tick(40); assert(depressed(h, 'down'), 'first release timer must be canceled');
  await h.tick(39); assert(depressed(h, 'down'));
  await h.tick(1); assert.equal(depressed(h, 'down'), false);
  assert.equal(h.state().selected, 2, 'visual feedback must not duplicate the action');
});

test('shortcut aliases share the correct keycap without releasing another held alias', async () => {
  for (const [key, action] of [['Enter','select'],['Escape','menu'],['Backspace','back'],[' ','play']]) {
    const h = harness(); h.keyDown(key); assert(depressed(h, action));
    await h.tick(100); h.keyUp(key); assert.equal(depressed(h, action), false);
  }
  const h = harness(); h.keyDown('s'); h.keyDown(' '); await h.tick(100);
  h.keyUp('S'); assert(depressed(h, 'play'), 'Space still owns the play keycap');
  h.keyUp(' '); assert.equal(depressed(h, 'play'), false);
});

test('native keyboard activation highlights the focused keycap without running a global shortcut', async () => {
  const h = harness(), menu = keycap(h, 'menu');
  h.keyDown(' ', { target: menu });
  assert(depressed(h, 'menu')); assert.equal(depressed(h, 'play'), false);
  assert.equal(h.calls.filter(call => call.method === 'play').length, 0);
  await h.tick(100); h.keyUp(' ', { target: menu });
  assert.equal(depressed(h, 'menu'), false);
});

test('editing and modified commands never depress keycaps or trigger player shortcuts', async () => {
  for (const options of [{ metaKey: true },{ ctrlKey: true },{ altKey: true },
    { target: { tagName: 'INPUT' } },{ target: { tagName: 'TEXTAREA' } },
    { target: { tagName: 'DIV', isContentEditable: true } }]) {
    const h = harness(); h.keyDown('s', options);
    assert(h.buttons.every(button => !button.classList.contains('is-pressed')));
    assert.equal(h.calls.filter(call => call.method === 'play').length, 0);
  }
});

test('blur, hidden tabs and mode switches clear held keycaps, pending flashes and seek holds', async () => {
  for (const leave of [h => h.window.dispatch('blur', {}),h => h.window.dispatch('pagehide', {}),
    h => { h.document.hidden = true; h.document.dispatch('visibilitychange', {}); },
    h => h.click('inspect-toggle')]) {
    const h = harness(); h.keyDown('d'); await h.tap('ArrowDown'); leave(h);
    assert(h.buttons.every(button => !button.classList.contains('is-pressed')));
    await h.tick(700);
    assert(h.buttons.every(button => !button.classList.contains('is-pressed')));
    assert.equal(h.read('pressedKeycaps.size'), 0);
    assert.equal(h.read('pressedKeys.size'), 0);
    assert.equal(h.read('state.hold'), null);
    assert.equal(h.state().track, 0);
  }
  const h = harness(); h.click('inspect-toggle'); h.keyDown('ArrowUp');
  assert.equal(depressed(h, 'up'), false, 'camera keys do not depress disabled player controls');
  h.keyDown('s'); assert(depressed(h, 'play'), 'play remains available during inspection');
  await h.tick(100); h.keyUp('s'); assert.equal(depressed(h, 'play'), false);
});

test('the standalone file includes the complete 13-song audio library', () => {
  assert.equal(library.length, 13);
  assert.equal(new Set(library.map(t => t.title)).size, 13);
  assert.equal(new Set(library.map(t => t.album)).size, 3);
  assert(library.every(t => t.duration > 150 && t.theme && t.artist));
  const embedded = html.split('/* AUDIO_ENGINE_START */')[1].split('/* AUDIO_ENGINE_END */')[0].trim();
  assert.equal(embedded, audioSource.trim(), 'offline HTML must contain the updated engine');
});

test('all songs stay visible while scrolling and their displayed rows select the correct track', async () => {
  const h = harness({ library });
  await h.tap('ArrowRight');
  for (let i = 0; i < 3; i++) await h.tap('ArrowDown');
  await h.tap('Enter');
  for (let i = 0; i < library.length; i++) {
    assert.equal(h.state().selected, i);
    const screen = h.get('screen').innerHTML;
    assert(screen.includes(`data-index="${i}"`));
    assert(screen.includes(library[i].title));
    assert.equal([...screen.matchAll(/data-index="/g)].length, 8);
    await h.tap('Enter');
    assert.equal(h.calls.filter(c => c.method === 'play').at(-1).track, i);
    assert(h.get('screen').innerHTML.includes(`${i + 1} of 13`));
    await h.tap('ArrowLeft');
    assert.equal(h.state().page, 'songs');
    assert.equal(h.state().selected, i);
    if (i < library.length - 1) await h.tap('ArrowDown');
  }
  assert.deepEqual([...h.get('screen').innerHTML.matchAll(/data-index="(\d+)"/g)].map(m => Number(m[1])), [5, 6, 7, 8, 9, 10, 11, 12]);
  await h.tap('ArrowDown'); assert.equal(h.state().selected, 12);
  for (let i = 0; i < 12; i++) await h.tap('ArrowUp');
  assert(h.get('screen').innerHTML.includes('data-index="0"'));
});

test('Albums groups the expanded library and each album retains its artwork', async () => {
  for (const [albumIndex, album] of [...new Set(library.map(t => t.album))].entries()) {
    const h = harness({ library }); await h.tap('ArrowRight');
    await h.tap('ArrowDown'); await h.tap('ArrowDown'); await h.tap('Enter');
    assert.equal(h.read('currentMenu().items.length'), 3);
    for (let i = 0; i < albumIndex; i++) await h.tap('ArrowDown');
    await h.tap('Enter');
    const indices = library.flatMap((t, i) => t.album === album ? [i] : []);
    assert.equal(h.read('currentMenu().items.length'), indices.length);
    for (let i = 1; i < indices.length; i++) await h.tap('ArrowDown');
    await h.tap('Enter'); assert.equal(h.state().track, indices.at(-1));
    assert(h.get('screen').innerHTML.includes(album.toUpperCase()));
    await h.tap('ArrowLeft'); assert.equal(h.state().page, `album:${albumIndex}`);
    await h.tap('ArrowLeft'); assert.equal(h.state().selected, albumIndex);
  }
});

test('shuffle can select every other song and continues across the full library on next', async () => {
  for (let i = 1; i < library.length; i++) {
    let sample = (i - .5) / (library.length - 1);
    const h = harness({ library, random: () => sample });
    for (let j = 0; j < 6; j++) await h.tap('ArrowDown');
    await h.tap('Enter'); assert.equal(h.state().track, i);
    assert.equal(h.state().shuffle, true); assert.equal(h.state().playing, true);
    sample = .999999; await h.tap('d');
    assert.equal(h.state().track, (i + 12) % 13);
    assert.equal(h.state().playing, true);
  }
});

test('sequential skips wrap 13 songs while paused and About reports the full count', async () => {
  const h = harness({ library });
  for (let i = 1; i <= 13; i++) { await h.tap('d'); assert.equal(h.state().track, i % 13); }
  assert.equal(h.state().playing, false);
  assert.equal(h.calls.filter(c => c.method === 'play').length, 0);
  for (let i = 0; i < 5; i++) await h.tap('ArrowDown');
  await h.tap('Enter');
  for (let i = 0; i < 3; i++) await h.tap('ArrowDown');
  await h.tap('Enter');
  assert(h.get('screen').innerHTML.includes('Songs<tspan x="216" text-anchor="end">13</tspan>'));
});

test('D tap skips once; D hold seeks repeatedly and release stops seeking', async () => {
  const h = harness();
  h.keyDown('d'); await h.tick(419);
  assert.equal(h.state().track, 0, 'tap must not skip before release');
  h.keyUp('d'); await flush();
  assert.equal(h.state().track, 1);
  h.keyDown('d'); await h.tick(420);
  assert.equal(h.state().position, 5);
  assert.equal(h.state().track, 1, 'hold must seek the current track');
  await h.tick(480); assert.equal(h.state().position, 15);
  h.keyUp('d'); await h.tick(1000);
  assert.equal(h.state().position, 15, 'release must cancel seek interval');
  assert.equal(h.state().track, 1, 'hold release must not also skip');
  assert.equal(h.state().playing, false, 'seeking while paused must stay paused');
});

test('A hold rewinds; a tap restarts or chooses the previous track', async () => {
  const h = harness();
  h.keyDown('d'); await h.tick(900); h.keyUp('d');
  assert.equal(h.state().position, 15);
  h.keyDown('a'); await h.tick(660); h.keyUp('a');
  assert.equal(h.state().position, 5);
  assert.equal(h.state().track, 0);
  await h.tap('a'); assert.equal(h.state().position, 0);
  assert.equal(h.state().track, 0, 'A after three seconds restarts current track');
  await h.tap('a'); assert.equal(h.state().track, 2, 'A at track start wraps to previous');
});

test('releasing an opposing key cannot release the active hold', async () => {
  const h = harness();
  h.keyDown('d'); h.keyDown('a'); h.keyUp('a');
  assert.equal(h.state().track, 0);
  assert.equal(h.state().hold.owner, 'key:d');
  await h.tick(420); assert.equal(h.state().position, 5);
  h.keyUp('d'); await h.tick(480);
  assert.equal(h.state().position, 5);
  assert.equal(h.state().hold, null);
  assert.equal(h.state().track, 0);
});

test('pause preserves position; paused next stays silent and resumes new track at zero', async () => {
  const h = harness();
  await h.tap('s'); assert.equal(h.state().playing, true);
  await h.tick(1250); await h.tap('s');
  assert.equal(h.state().playing, false); assert.equal(h.state().position, 1.25);
  await h.tick(1000); assert.equal(h.state().position, 1.25);
  await h.tap('s');
  assert.equal(h.calls.filter(call => call.method === 'play').at(-1).offset, 1.25);
  await h.tap('s');
  const playCount = h.calls.filter(call => call.method === 'play').length;
  await h.tap('d');
  assert.equal(h.state().track, 1); assert.equal(h.state().position, 0);
  assert.equal(h.state().playing, false);
  assert.equal(h.calls.filter(call => call.method === 'play').length, playCount);
  await h.tap('s');
  const call = h.calls.filter(call => call.method === 'play').at(-1);
  assert.deepEqual(call, { method: 'play', track: 1, offset: 0 });
  assert.equal(h.state().playing, true);
});

test('nested menus and back preserve each parent selection', async () => {
  const h = harness();
  await h.tap('ArrowRight'); assert.equal(h.state().page, 'music');
  for (let i = 0; i < 3; i++) await h.tap('ArrowDown');
  await h.tap('Enter'); assert.equal(h.state().page, 'songs');
  await h.tap('ArrowDown'); await h.tap('ArrowDown');
  await h.tap('ArrowLeft');
  assert.equal(h.state().page, 'music'); assert.equal(h.state().selected, 3);
  await h.tap('w');
  assert.equal(h.state().page, 'home'); assert.equal(h.state().selected, 0);
  await h.tap('w'); assert.equal(h.state().page, 'home');
  assert.equal(h.state().stack.length, 0);
});

test('trackpad and arrows clamp volume to zero and one', async () => {
  const h = harness();
  await h.tap('s'); await h.tap('s');
  for (let i = 0; i < 6; i++) await h.wheel(144);
  assert.equal(h.state().volume, 1);
  for (let i = 0; i < 6; i++) await h.wheel(-144);
  assert.equal(h.state().volume, 0);
  await h.tap('ArrowUp'); assert.equal(h.state().volume, 0);
  for (let i = 0; i < 40; i++) await h.tap('ArrowDown');
  assert.equal(h.state().volume, 1);
  assert(h.calls.filter(call => call.method === 'volume').every(call => call.value >= 0 && call.value <= 1));
});

test('blur cancels a pending tap and an active seek', async () => {
  const h = harness();
  h.keyDown('d'); h.window.dispatch('blur', {}); await h.tick(700);
  assert.equal(h.state().track, 0); assert.equal(h.state().position, 0);
  h.keyDown('d'); await h.tick(420); h.window.dispatch('blur', {});
  await h.tick(1000); assert.equal(h.state().position, 5);
  assert.equal(h.state().hold, null);
});

test('frame and chassis clicks toggle both camera views and accessible state', async () => {
  const h = harness();
  assert.equal(Boolean(h.state().facing), false);
  h.frameClick('plate');
  assert.equal(h.state().facing, true);
  assert.equal(h.get('plate').dataset.view, 'front');
  assert.equal(h.get('device').style.transform, h.read('frontTransform'));
  assert.match(h.get('announcement').textContent, /Front/);
  h.frameClick('device');
  assert.equal(h.state().facing, false);
  assert.equal(h.get('plate').dataset.view, 'isometric');
  assert.equal(h.get('device').style.transform, 'matrix(1,0,0,1,0,0)');
  assert.match(h.get('announcement').textContent, /Isometric/);
});

test('control-origin gestures stay excluded even when release is retargeted to the backdrop', async () => {
  const h = harness();
  const targets = [
    h.child('ring-glyph', 'wheel-area', 'PATH'),
    h.child('center-glyph', 'center-button', 'CIRCLE'),
    h.child('screen-row-label', 'screen', 'TEXT'),
    h.child('button-label', 'fixture-button', 'SPAN'),
    h.child('link', 'plate', 'A'),
  ];
  for (const target of targets) {
    h.pointer('pointerdown', target);
    h.pointer('pointerup', 'stage');
    assert.equal(Boolean(h.state().facing), false, `${target.id} must not trigger the camera`);
    assert.equal(h.read('framePress'), null, 'the excluded gesture must be cleared');
  }
  // Buttons stay excluded; the V shortcut reaches the actual key handler.
  h.frameClick('fixture-button');
  assert.equal(Boolean(h.state().facing), false);
  await h.tap('v');
  assert.equal(h.state().facing, true);
  assert.equal(h.get('plate').dataset.view, 'front');
  await h.tap('V');
  assert.equal(h.state().facing, false);
  assert.equal(h.get('plate').dataset.view, 'isometric');
});

test('frame drags never toggle, including movement away and back to the start', async () => {
  const h = harness();
  h.pointer('pointerdown');
  h.pointer('pointermove', 'stage', { clientX: 140 });
  h.pointer('pointerup');
  assert.equal(Boolean(h.state().facing), false);
  h.pointer('pointerdown');
  h.pointer('pointerup', 'stage', { clientX: 110 });
  assert.equal(Boolean(h.state().facing), false, 'large release displacement must be rejected without a move event');
  h.pointer('pointerdown', 'plate', { button: 2 });
  h.pointer('pointerup', 'plate', { button: 2 });
  assert.equal(Boolean(h.state().facing), false, 'secondary button must not toggle');
});

test('frame gestures respect pointer ownership and clear on cancellation or blur', async () => {
  const h = harness();
  h.pointer('pointerdown', 'plate', { pointerId: 7 });
  h.pointer('pointerup', 'plate', { pointerId: 8 });
  assert.equal(Boolean(h.state().facing), false);
  h.pointer('pointerup', 'plate', { pointerId: 7 });
  assert.equal(h.state().facing, true, 'the original pointer may finish its gesture');
  h.pointer('pointerdown'); h.pointer('pointercancel'); h.pointer('pointerup');
  assert.equal(h.state().facing, true); assert.equal(h.read('framePress'), null);
  h.pointer('pointerdown'); h.window.dispatch('blur', {}); h.pointer('pointerup');
  assert.equal(h.state().facing, true); assert.equal(h.read('framePress'), null);
});

test('rapid camera toggles preserve playback and settle on the last requested view', async () => {
  const h = harness();
  await h.tap('s'); await h.tick(1000);
  const before = h.state();
  const audioCalls = h.calls.filter(call => call.method === 'play' || call.method === 'pause').length;
  for (let i = 0; i < 9; i++) h.frameClick(i % 2 ? 'device' : 'plate');
  assert.equal(h.state().facing, true);
  assert.equal(h.get('device').style.transform, h.read('frontTransform'));
  assert.equal(h.state().playing, true); assert.equal(h.state().track, before.track);
  assert.equal(h.state().page, before.page); assert.equal(h.state().position, before.position);
  assert.equal(h.calls.filter(call => call.method === 'play' || call.method === 'pause').length, audioCalls);
  await h.tick(500);
  assert.equal(h.state().position, before.position + .5, 'audio time must continue across the camera change');
  h.frameClick('plate'); assert.equal(h.state().facing, false);
});

test('front camera yields equal-length orthogonal face axes and the intended centre', async () => {
  const h = harness();
  const values = h.read('frontTransform').match(/matrix\(([^)]+)\)/)[1].split(',').map(Number);
  assert.equal(values.length, 6); assert(values.every(Number.isFinite));
  const [a, b, c, d, tx, ty] = values;
  const transformVector = ([x, y]) => [a * x + c * y, b * x + d * y];
  const xAxis = transformVector(h.read('D(1,0,0)'));
  const yAxis = transformVector(h.read('D(0,1,0)'));
  const near = (actual, expected, label) => assert(Math.abs(actual - expected) < 1e-9, `${label}: ${actual} != ${expected}`);
  near(xAxis[1], 0, 'horizontal face axis'); near(yAxis[0], 0, 'vertical face axis');
  near(xAxis[0], 1, 'horizontal scale'); near(yAxis[1], 1, 'vertical scale');
  near(Math.hypot(...xAxis), Math.hypot(...yAxis), 'equal axis lengths');
  near(xAxis[0] * yAxis[0] + xAxis[1] * yAxis[1], 0, 'orthogonal axes');
  const [x, y] = transformVector(h.read('faceCentre'));
  near(x + tx, 450, 'face centre x'); near(y + ty, 265, 'face centre y');
});

test('inspection toggle preserves live playback and menu state while updating access and control state', async () => {
  const h = harness();
  await h.tap('s'); await h.tick(1000); await h.tap('w');
  const before = h.state();
  const audioCalls = h.calls.filter(call => call.method === 'play' || call.method === 'pause').length;
  h.click('inspect-toggle');
  assert.equal(h.state().inspect, true);
  assert.equal(h.get('plate').dataset.inspecting, 'true');
  assert.equal(h.get('inspect-toggle').attributes['aria-pressed'], 'true');
  assert.equal(h.get('inspect-view').attributes['aria-hidden'], 'false');
  assert.equal(h.get('stage').attributes['tabindex'], '-1');
  assert.equal(h.get('inspection-stage').attributes['tabindex'], '0');
  assert.equal(h.get('inspection-stage').wasFocused, true);
  for (const button of h.buttons) assert.equal(button.disabled, button.dataset.action !== 'play');
  for (const key of ['page', 'selected', 'track', 'volume', 'position', 'playing', 'facing']) assert.equal(h.state()[key], before[key], key);
  assert.equal(h.rendererCreates.length, 1);
  assert.equal(typeof h.rendererCreates[0].options.getFront, 'function');
  assert(h.renderCalls.length > 0);
  await h.tick(500);
  assert.equal(h.state().position, before.position + .5);
  h.click('inspect-toggle');
  assert.equal(h.state().inspect, true, 'Done keeps inspection mounted while the camera returns');
  await h.tick(700);
  assert.equal(h.state().inspect, false);
  assert.equal(h.get('plate').dataset.inspecting, 'false');
  assert.equal(h.get('inspect-toggle').attributes['aria-pressed'], 'false');
  assert.equal(h.get('stage').attributes['tabindex'], '0');
  assert.equal(h.get('inspection-stage').attributes['tabindex'], '-1');
  assert.equal(h.get('inspect-toggle').wasFocused, true);
  assert(h.buttons.every(button => !button.disabled));
  assert.equal(h.state().page, before.page);
  assert.equal(h.calls.filter(call => call.method === 'play' || call.method === 'pause').length, audioCalls);
  h.click('inspect-toggle'); assert.equal(h.rendererCreates.length, 1, 're-entering reuses the renderer');
});

test('inspection keyboard shortcuts rotate the camera and exit without menu navigation', async () => {
  const h = harness();
  await h.tap('ArrowRight'); assert.equal(h.state().page, 'music');
  await h.tap('i'); assert.equal(h.state().inspect, true);
  const initial = h.renderCalls.at(-1);
  await h.tap('ArrowRight'); assert(h.renderCalls.at(-1).yaw > initial.yaw);
  await h.tap('ArrowDown'); assert(h.renderCalls.at(-1).pitch > initial.pitch);
  assert.equal(h.state().page, 'music'); assert.equal(h.state().selected, 0);
  await h.tap('F'); assert.equal(h.renderCalls.at(-1).yaw, 0); assert.equal(h.renderCalls.at(-1).pitch, 0);
  await h.tap('b'); assert.equal(h.renderCalls.at(-1).yaw, Math.PI);
  await h.tap('+'); assert(h.renderCalls.at(-1).zoom > 1);
  await h.tap('r'); assert.deepEqual(h.renderCalls.at(-1), initial);
  h.keyDown('f'); assert.equal(h.renderCalls.at(-1).yaw, 0);
  h.keyDown('b'); assert.equal(h.renderCalls.at(-1).yaw, Math.PI);
  h.keyDown('r'); assert.deepEqual(h.renderCalls.at(-1), initial);
  await h.tap('Escape'); assert.equal(h.state().inspect, false); assert.equal(h.state().page, 'music');
  await h.tap('I'); assert.equal(h.state().inspect, true);
  await h.tap('i'); assert.equal(h.state().inspect, false); assert.equal(h.state().page, 'music');
});

test('inspection blocks normal control handlers but S and the play button still toggle audio in place', async () => {
  const h = harness();
  await h.tap('ArrowRight'); await h.tap('i');
  const before = h.state();
  for (const key of ['w', 'd', 'a', 'v', 'Enter', 'Backspace']) await h.tap(key);
  h.keyDown('d'); await h.tick(700); h.keyUp('d');
  for (const button of h.buttons.filter(button => button.dataset.action !== 'play')) {
    // Even direct dispatch (bypassing native disabled behavior) must be guarded.
    button.dispatch('click', {});
  }
  await h.wheel(144); h.frameClick('device');
  for (const key of ['page', 'selected', 'track', 'volume', 'position', 'playing', 'facing']) assert.equal(h.state()[key], before[key], key);
  assert.equal(h.state().hold, null);
  await h.tap('s'); assert.equal(h.state().playing, true); assert.equal(h.state().page, before.page);
  h.buttons.find(button => button.dataset.action === 'play').dispatch('click', {}); await flush();
  assert.equal(h.state().playing, false); assert.equal(h.state().page, before.page);
  assert.equal(h.state().inspect, true);
});

test('inspection dragging supports multiple turns and responds immediately when reversing at pitch limits', async () => {
  const h = harness(); h.click('inspect-toggle');
  h.inspectPointer('pointerdown', { pointerId: 7 });
  assert.equal(h.get('inspection-stage').hasPointerCapture(7), true);
  h.inspectPointer('pointermove', { pointerId: 7, clientX: 1500, clientY: 100 });
  assert(h.renderCalls.at(-1).yaw > 2 * Math.PI, 'yaw must remain unbounded past a full turn');
  const limit = 85 * Math.PI / 180;
  h.inspectPointer('pointermove', { pointerId: 7, clientX: 1500, clientY: 10000 });
  assert.equal(h.renderCalls.at(-1).pitch, limit);
  h.inspectPointer('pointermove', { pointerId: 7, clientX: 1500, clientY: 9990 });
  assert(h.renderCalls.at(-1).pitch < limit, 'reversing just ten pixels must leave the upper limit');
  h.inspectPointer('pointermove', { pointerId: 7, clientX: 1500, clientY: -10000 });
  assert.equal(h.renderCalls.at(-1).pitch, -limit);
  h.inspectPointer('pointermove', { pointerId: 7, clientX: 1500, clientY: -9990 });
  assert(h.renderCalls.at(-1).pitch > -limit, 'reversing just ten pixels must leave the lower limit');
  const view = { ...h.renderCalls.at(-1) };
  h.inspectPointer('pointerdown', { pointerId: 8 });
  h.inspectPointer('pointermove', { pointerId: 8, clientX: 9000 });
  h.inspectPointer('pointerup', { pointerId: 8 });
  assert.deepEqual(h.renderCalls.at(-1), view);
  assert.equal(h.get('inspection-stage').hasPointerCapture(7), true);
  h.inspectPointer('pointerup', { pointerId: 7 });
  assert.equal(h.get('inspection-stage').hasPointerCapture(7), false);
  assert.equal(h.get('inspection-stage').classList.contains('dragging'), false);
});

test('inspection zoom clamps, normalizes wheel units, and ignores ctrl-pinch', async () => {
  const h = harness(); h.click('inspect-toggle');
  assert.equal(h.inspectWheel(100000).prevented, true); assert.equal(h.renderCalls.at(-1).zoom, .7);
  h.inspectWheel(-100000); assert.equal(h.renderCalls.at(-1).zoom, 1.6);
  h.keyDown('r');
  const initial = { ...h.renderCalls.at(-1) };
  assert.equal(h.inspectWheel(10000, { ctrlKey: true }).prevented, false);
  assert.deepEqual(h.renderCalls.at(-1), initial);
  h.inspectWheel(10, { deltaMode: 1 }); const lineZoom = h.renderCalls.at(-1).zoom;
  h.keyDown('r'); h.inspectWheel(160);
  assert.equal(h.renderCalls.at(-1).zoom, lineZoom);
  h.keyDown('r'); h.inspectWheel(1, { deltaMode: 2 }); const pageZoom = h.renderCalls.at(-1).zoom;
  h.keyDown('r'); h.inspectWheel(200);
  assert.equal(h.renderCalls.at(-1).zoom, pageZoom);
  assert.equal(h.state().volume, .48, 'inspection zoom must never affect audio volume');
  await h.tap('Escape');
  assert.equal(h.inspectWheel(-100).prevented, false, 'hidden inspection must not capture scroll');
});

test('inspection cancellation, lost capture, blur, pose reset and exit all stop dragging', async () => {
  const h = harness(); h.click('inspect-toggle');
  for (const cleanup of [
    () => h.inspectPointer('pointercancel', { pointerId: 7 }),
    () => h.inspectPointer('lostpointercapture', { pointerId: 7 }),
    () => h.window.dispatch('blur', {}),
    () => h.keyDown('r'),
  ]) {
    h.inspectPointer('pointerdown', { pointerId: 7 });
    assert.equal(h.get('inspection-stage').hasPointerCapture(7), true);
    cleanup();
    assert.equal(h.get('inspection-stage').hasPointerCapture(7), false);
    assert.equal(h.read('inspection.drag'), null);
    const view = { ...h.renderCalls.at(-1) };
    h.inspectPointer('pointermove', { pointerId: 7, clientX: 800 });
    assert.deepEqual(h.renderCalls.at(-1), view);
  }
  h.inspectPointer('pointerdown', { pointerId: 7 }); await h.tap('Escape');
  assert.equal(h.get('inspection-stage').hasPointerCapture(7), false);
  assert.equal(h.read('inspection.drag'), null);
  assert.equal(h.state().inspect, false);
});

test('entering inspection cancels pending and active seek holds without a later track skip', async () => {
  const h = harness();
  h.keyDown('d'); await h.tick(200); h.click('inspect-toggle');
  await h.tick(1000); h.keyUp('d');
  assert.equal(h.state().position, 0); assert.equal(h.state().track, 0); assert.equal(h.state().hold, null);
  await h.tap('Escape');
  h.keyDown('d'); await h.tick(420); assert.equal(h.state().position, 5);
  await h.tap('i'); await h.tick(1000); h.keyUp('d');
  assert.equal(h.state().position, 5); assert.equal(h.state().track, 0); assert.equal(h.state().hold, null);
  await h.tap('Escape'); await h.tick(1000); assert.equal(h.state().position, 5);
});

test('Done returns by the shortest yaw after multiple positive or negative turns and leaves no animation frame', async () => {
  for (const turns of [3, -3]) {
    const h = harness(); h.click('inspect-toggle');
    h.inspectPointer('pointerdown');
    h.inspectPointer('pointermove', { clientX: 100 + turns * 700, clientY: 200 });
    h.inspectPointer('pointerup');
    const from = { ...h.renderCalls.at(-1) };
    const iso = JSON.parse(h.read('JSON.stringify(inspectionIso)'));
    const firstFrame = h.renderCalls.length;
    h.click('inspect-toggle');
    assert.equal(h.state().inspect, true);
    assert.equal(h.get('plate').dataset.returning, 'true');
    assert.equal(h.pendingFrames(), 1);
    await h.tick(160);
    const middle = h.renderCalls.at(-1);
    assert.notEqual(middle.yaw, from.yaw, 'return must render intermediate camera poses');
    assert(Math.abs(middle.yaw - from.yaw) < Math.PI, 'intermediate travel must not include full turns');
    assert.equal(h.state().inspect, true);
    await h.tick(540);
    assert.equal(h.state().inspect, false);
    const landed = h.renderCalls.at(-1);
    assert(Math.abs(landed.yaw - from.yaw) <= Math.PI, 'nearest equivalent yaw must be chosen');
    assert(Math.abs(Math.sin(landed.yaw) - Math.sin(iso.yaw)) < 1e-10);
    assert(Math.abs(Math.cos(landed.yaw) - Math.cos(iso.yaw)) < 1e-10);
    for (const key of ['pitch', 'roll', 'zoom', 'centerX', 'centerY']) assert.equal(landed[key], iso[key], key);
    const low = Math.min(from.yaw, landed.yaw), high = Math.max(from.yaw, landed.yaw);
    assert(h.renderCalls.slice(firstFrame).every(pose => pose.yaw >= low - 1e-10 && pose.yaw <= high + 1e-10), 'return must not overshoot');
    assert.equal(h.pendingFrames(), 0);
    assert.equal(h.read('inspectionReturn'), null);
    assert.equal(h.get('plate').dataset.returning, 'false');
    const count = h.renderCalls.length; await h.tick(1000);
    assert.equal(h.renderCalls.length, count, 'completed return must not keep rendering');
  }
});

test('isometric landing pose projects back to the playable figure without a camera jump', async () => {
  const h = harness(); h.click('inspect-toggle'); h.keyDown('b'); h.click('inspect-toggle'); await h.tick(700);
  const pose = h.renderCalls.at(-1);
  // Compose ordinary 3D rotation matrices independently of the renderer stub.
  // The inspector uses a centred shell whose z range is -10..10.
  const multiply = (a, b) => a.map(row => b[0].map((_, column) => row.reduce((sum, value, i) => sum + value * b[i][column], 0)));
  const c = Math.cos, s = Math.sin;
  const yaw = [[c(pose.yaw), 0, s(pose.yaw)], [0, 1, 0], [-s(pose.yaw), 0, c(pose.yaw)]];
  const pitch = [[1, 0, 0], [0, c(pose.pitch), -s(pose.pitch)], [0, s(pose.pitch), c(pose.pitch)]];
  const roll = [[c(pose.roll), -s(pose.roll), 0], [s(pose.roll), c(pose.roll), 0], [0, 0, 1]];
  const rotation = multiply(roll, multiply(pitch, yaw));
  for (const point of [[0, 0, 0], [292, 390, 20], [146, 296, 20], [22, 22, 20], [270, 212, 20]]) {
    const [x, y, z] = point;
    const vector = [[x - 146], [y - 195], [z - 10]];
    const projected = multiply(rotation, vector);
    const actual = [pose.centerX + projected[0][0] * .96 * pose.zoom, pose.centerY + projected[1][0] * .96 * pose.zoom];
    const expected = h.read(`P(${x},${y},${z})`);
    assert(Math.abs(actual[0] - expected[0]) < 1e-9 && Math.abs(actual[1] - expected[1]) < 1e-9,
      `camera handoff misaligns ${point}: ${actual} != ${expected}`);
  }
});

test('repeated Done clicks do not restart the return and a front-view entry still lands isometric', async () => {
  const h = harness(); await h.tap('v'); assert.equal(h.state().facing, true);
  h.click('inspect-toggle'); h.keyDown('b'); h.click('inspect-toggle');
  const started = h.read('inspectionReturn.started');
  await h.tick(192);
  for (let i = 0; i < 5; i++) h.click('inspect-toggle');
  assert.equal(h.read('inspectionReturn.started'), started);
  assert.equal(h.pendingFrames(), 1, 'only one frame chain may be scheduled');
  assert.equal(h.state().inspect, true);
  await h.tick(420);
  assert.equal(h.state().inspect, false, 'second Done must not postpone completion');
  assert.equal(h.state().facing, false);
  assert.equal(h.get('plate').dataset.view, 'isometric');
  assert.equal(h.get('device').style.transform, 'matrix(1,0,0,1,0,0)');
  assert.equal(h.pendingFrames(), 0);
});

test('dragging interrupts the return at its displayed pose and cancels every pending frame', async () => {
  const h = harness(); h.click('inspect-toggle'); h.keyDown('b'); h.click('inspect-toggle');
  await h.tick(160); const displayed = { ...h.renderCalls.at(-1) };
  h.inspectPointer('pointerdown', { pointerId: 7 });
  assert.equal(h.pendingFrames(), 0); assert.equal(h.read('inspectionReturn'), null);
  for (const [key, value] of Object.entries(displayed)) assert.equal(h.read(`inspection.${key}`), value, key);
  h.inspectPointer('pointermove', { pointerId: 7, clientX: 170 });
  const dragged = { ...h.renderCalls.at(-1) };
  assert(dragged.yaw > displayed.yaw);
  for (const key of ['pitch', 'roll', 'zoom', 'centerX', 'centerY']) assert.equal(dragged[key], displayed[key]);
  h.inspectPointer('pointerup', { pointerId: 7 }); await h.tick(1000);
  assert.equal(h.state().inspect, true);
  assert.deepEqual(h.renderCalls.at(-1), dragged);
  assert.equal(h.pendingFrames(), 0);
});

test('wheel, camera keys, pose shortcuts and blur cancel a return without restoring player controls', async () => {
  for (const interrupt of [h => h.inspectWheel(20), h => h.tap('ArrowLeft'), h => h.tap('+'),
    h => h.keyDown('f'), h => h.keyDown('r'), h => h.window.dispatch('blur', {})]) {
    const h = harness(); h.click('inspect-toggle'); h.keyDown('b'); h.click('inspect-toggle'); await h.tick(96);
    await interrupt(h);
    assert.equal(h.pendingFrames(), 0); assert.equal(h.read('inspectionReturn'), null);
    assert.equal(h.state().inspect, true);
    assert(h.buttons.filter(button => button.dataset.action !== 'play').every(button => button.disabled));
    const pose = { ...h.renderCalls.at(-1) }; await h.tick(1000);
    assert.deepEqual(h.renderCalls.at(-1), pose);
  }
});

test('Escape, I and reduced motion return immediately and cancel any in-flight animation', async () => {
  for (const key of ['Escape', 'i']) {
    const h = harness(); await h.tap('v'); h.click('inspect-toggle'); h.click('inspect-toggle'); await h.tick(96);
    await h.tap(key);
    assert.equal(h.state().inspect, false); assert.equal(h.state().facing, false);
    assert.equal(h.get('plate').dataset.view, 'isometric');
    assert.equal(h.get('device').style.transform, 'matrix(1,0,0,1,0,0)');
    assert.equal(h.pendingFrames(), 0); assert.equal(h.read('inspectionReturn'), null);
  }
  const h = harness({ reducedMotion: true }); await h.tap('v');
  h.click('inspect-toggle'); h.keyDown('b');
  const count = h.renderCalls.length; h.click('inspect-toggle');
  assert.equal(h.state().inspect, false); assert.equal(h.state().facing, false);
  assert.equal(h.pendingFrames(), 0); assert.equal(h.renderCalls.length, count);
  assert.equal(h.get('device').style.transform, 'matrix(1,0,0,1,0,0)');
});

test('return animation preserves menu, volume and uninterrupted live audio until controls are restored', async () => {
  const h = harness(); await h.tap('s'); await h.tick(1000); await h.tap('w');
  const before = h.state();
  const audioCalls = h.calls.filter(call => call.method === 'play' || call.method === 'pause').length;
  h.click('inspect-toggle'); h.keyDown('b'); h.click('inspect-toggle');
  await h.tick(250);
  assert.equal(h.state().inspect, true);
  assert(h.buttons.filter(button => button.dataset.action !== 'play').every(button => button.disabled));
  assert.equal(h.state().position, before.position + .25);
  await h.tick(500);
  assert.equal(h.state().inspect, false); assert(h.buttons.every(button => !button.disabled));
  for (const key of ['page', 'selected', 'track', 'volume', 'playing']) assert.equal(h.state()[key], before[key], key);
  assert.equal(h.state().position, before.position + .75);
  assert.equal(h.calls.filter(call => call.method === 'play' || call.method === 'pause').length, audioCalls);
  assert.equal(h.pendingFrames(), 0);
});

(async () => {
  let failed = 0;
  for (const { name, fn } of cases) {
    try { await fn(); console.log(`PASS ${name}`); }
    catch (error) { failed++; console.error(`FAIL ${name}\n${error.stack}`); }
  }
  console.log(`${cases.length - failed}/${cases.length} interaction checks passed`);
  process.exitCode = failed ? 1 : 0;
})();
