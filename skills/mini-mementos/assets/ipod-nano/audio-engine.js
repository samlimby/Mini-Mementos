/* Original, locally synthesized music. No recordings, downloads, or dependencies. */
(() => {
  'use strict';

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const tracks = [
    { title: 'Night Drive', artist: 'Small Hours', album: 'After Hours', duration: 200, bpm: 96, bars: 80, theme: 'terracotta', swing: 0.025,
      chords: [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]],
      melody: [76, null, 72, null, 71, 67, null, 69, null, 72, 76, null, 74, null, 71, null] },
    { title: 'Soft Focus', artist: 'Small Hours', album: 'Green Rooms', duration: 192, bpm: 110, bars: 88, theme: 'sage', kickStep: 11,
      chords: [[50, 53, 57, 60], [55, 59, 62, 65], [48, 52, 55, 59], [57, 60, 64, 67]],
      melody: [69, null, null, 72, null, 76, 74, null, 72, null, 69, null, 67, 64, null, null] },
    { title: 'Blue Sunday', artist: 'Small Hours', album: 'Tidal Notes', duration: 176, bpm: 120, bars: 88, theme: 'blue', arpeggio: true, melodyLevel: 0.072,
      chords: [[53, 57, 60, 64], [48, 52, 55, 60], [55, 59, 62, 67], [57, 60, 64, 67]],
      melody: [72, null, 76, 79, null, 76, 72, null, 71, null, 67, 69, null, 72, null, null] },
    { title: 'Neon Crossing', artist: 'Small Hours', album: 'After Hours', duration: 192, bpm: 100, bars: 80, theme: 'terracotta', swing: 0.035, arpeggio: true,
      chords: [[54, 57, 61, 64], [50, 54, 57, 61], [57, 61, 64, 68], [52, 56, 59, 62]],
      melody: [73, null, 76, 78, null, 73, 69, null, 68, null, 71, 73, 76, null, 73, null] },
    { title: 'Last Train', artist: 'Small Hours', album: 'After Hours', duration: 196, bpm: 88, bars: 72, theme: 'terracotta', swing: 0.045, kickStep: 10,
      chords: [[52, 55, 59, 62], [48, 52, 55, 59], [55, 59, 62, 66], [50, 54, 57, 60]],
      melody: [71, null, null, 67, 66, null, 64, null, 67, null, 71, null, 74, 71, null, null] },
    { title: 'Side Streets', artist: 'Small Hours', album: 'After Hours', duration: 185, bpm: 104, bars: 80, theme: 'terracotta', kickStep: 7,
      chords: [[55, 58, 62, 65], [51, 55, 58, 62], [58, 62, 65, 69], [53, 57, 60, 63]],
      melody: [74, 77, null, 74, null, 70, 69, null, 72, null, 74, 77, null, 81, 77, null] },
    { title: 'Open Windows', artist: 'Small Hours', album: 'Green Rooms', duration: 189, bpm: 112, bars: 88, theme: 'sage', kickStep: 11, arpeggio: true,
      chords: [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]],
      melody: [76, null, 79, 83, null, 79, 76, null, 74, null, 72, 76, null, 79, 77, null] },
    { title: 'Morning Light', artist: 'Small Hours', album: 'Green Rooms', duration: 182, bpm: 116, bars: 88, theme: 'sage', swing: 0.018, kickStep: 10,
      chords: [[62, 66, 69, 73], [59, 62, 66, 69], [55, 59, 62, 66], [57, 61, 64, 67]],
      melody: [78, 81, null, 85, 81, null, 78, null, 76, null, 73, 74, null, 78, 76, null] },
    { title: 'Quiet Corners', artist: 'Small Hours', album: 'Green Rooms', duration: 211, bpm: 82, bars: 72, theme: 'sage', swing: 0.05, kickStep: 11, melodyLevel: 0.055,
      chords: [[53, 57, 60, 64], [50, 53, 57, 60], [58, 62, 65, 69], [60, 64, 67, 70]],
      melody: [69, null, null, 72, null, 76, null, null, 77, null, 74, null, 72, null, 69, null] },
    { title: 'Glass Tide', artist: 'Small Hours', album: 'Tidal Notes', duration: 186, bpm: 124, bars: 96, theme: 'blue', arpeggio: true, melodyLevel: 0.072,
      chords: [[59, 62, 66, 69], [55, 59, 62, 66], [62, 66, 69, 73], [57, 61, 64, 67]],
      melody: [78, null, 81, 85, 83, null, 81, null, 78, 76, null, 74, 73, null, 76, null] },
    { title: 'Paper Boats', artist: 'Small Hours', album: 'Tidal Notes', duration: 188, bpm: 102, bars: 80, theme: 'blue', swing: 0.03, kickStep: 10,
      chords: [[58, 62, 65, 69], [55, 58, 62, 65], [51, 55, 58, 62], [53, 57, 60, 63]],
      melody: [77, null, 74, null, 70, 72, null, 74, 77, null, 81, null, 79, 77, null, null] },
    { title: 'Distant Shore', artist: 'Small Hours', album: 'Tidal Notes', duration: 192, bpm: 90, bars: 72, theme: 'blue', swing: 0.04, melodyLevel: 0.058,
      chords: [[56, 60, 63, 67], [53, 56, 60, 63], [49, 53, 56, 60], [51, 55, 58, 61]],
      melody: [75, null, null, 79, null, 75, 72, null, 70, null, 68, null, 72, null, 75, null] },
    { title: 'First Light', artist: 'Small Hours', album: 'Tidal Notes', duration: 180, bpm: 128, bars: 96, theme: 'blue', arpeggio: true, kickStep: 11,
      chords: [[55, 59, 62, 66], [52, 55, 59, 62], [48, 52, 55, 59], [50, 54, 57, 60]],
      melody: [79, 78, null, 74, 71, null, 74, null, 76, null, 79, 83, null, 81, 78, null] },
  ];

  let context = null;
  let master = null;
  let noiseBuffer = null;
  let session = null;
  let currentTrack = 0;
  let pausedPosition = 0;
  let volume = 0.6;
  let request = 0;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const modulo = (value, modulus) => ((value % modulus) + modulus) % modulus;
  const frequency = (note) => 440 * 2 ** ((note - 69) / 12);

  function initialize() {
    if (context) return;
    context = new AudioContextClass();
    master = context.createGain();
    master.gain.value = volume * 0.75;
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -16;
    compressor.knee.value = 16;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.012;
    compressor.release.value = 0.23;
    master.connect(compressor);
    compressor.connect(context.destination);
    noiseBuffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const noise = noiseBuffer.getChannelData(0);
    // A fixed seed keeps the sound of the instruments consistent between plays.
    let seed = 78419;
    for (let i = 0; i < noise.length; i++) {
      seed = (seed * 16807) % 2147483647;
      noise[i] = (seed / 2147483647) * 2 - 1;
    }
  }

  function register(target, source, start, end) {
    target.sources.add(source);
    source.onended = () => {
      target.sources.delete(source);
      source.disconnect();
    };
    source.start(start);
    source.stop(end);
  }

  function envelope(target, start, attack, sustain, release, level) {
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(level, 0.0002), start + attack);
    gain.gain.exponentialRampToValueAtTime(Math.max(level * 0.58, 0.0002), start + attack + sustain);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + attack + sustain + release);
    gain.connect(target.bus);
    return gain;
  }

  function tone(target, note, time, duration, level, voice = 'keys', pan = 0) {
    const attack = voice === 'pad' ? 0.18 : voice === 'bass' ? 0.015 : 0.008;
    const release = voice === 'pad' ? 0.8 : voice === 'bass' ? 0.13 : 0.36;
    const gain = envelope(target, time, attack, Math.max(0.025, duration), release, level);
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(voice === 'bass' ? 440 : voice === 'pad' ? 950 : 2800, time);
    filter.frequency.exponentialRampToValueAtTime(voice === 'bass' ? 170 : 650, time + duration + release);
    filter.Q.value = 0.35;
    const panner = context.createStereoPanner ? context.createStereoPanner() : context.createGain();
    if (panner.pan) panner.pan.value = pan;
    filter.connect(panner);
    panner.connect(gain);
    const oscillator = context.createOscillator();
    oscillator.type = voice === 'bass' ? 'sine' : 'triangle';
    oscillator.frequency.value = frequency(note);
    oscillator.connect(filter);
    const end = time + attack + duration + release + 0.04;
    register(target, oscillator, time, end);

    if (voice === 'keys') {
      const overtone = context.createOscillator();
      const harmonicGain = context.createGain();
      overtone.type = 'sine';
      overtone.frequency.value = frequency(note) * 2;
      harmonicGain.gain.setValueAtTime(0.22, time);
      harmonicGain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
      overtone.connect(harmonicGain);
      harmonicGain.connect(filter);
      register(target, overtone, time, end);
      gain.connect(target.echo);
    }
  }

  function kick(target, time, level = 0.4) {
    const oscillator = context.createOscillator();
    const gain = envelope(target, time, 0.002, 0.02, 0.27, level);
    oscillator.frequency.setValueAtTime(125, time);
    oscillator.frequency.exponentialRampToValueAtTime(45, time + 0.11);
    oscillator.frequency.exponentialRampToValueAtTime(37, time + 0.29);
    oscillator.connect(gain);
    register(target, oscillator, time, time + 0.32);
  }

  function percussion(target, time, type, level) {
    const source = context.createBufferSource();
    source.buffer = noiseBuffer;
    const filter = context.createBiquadFilter();
    filter.type = type === 'snare' ? 'bandpass' : 'highpass';
    filter.frequency.value = type === 'snare' ? 1850 : 7200;
    filter.Q.value = type === 'snare' ? 0.65 : 0.4;
    const tail = type === 'snare' ? 0.135 : type === 'open' ? 0.14 : 0.035;
    const gain = envelope(target, time, 0.001, 0.005, tail, level);
    source.connect(filter);
    filter.connect(gain);
    register(target, source, time, time + tail + 0.03);
    if (type === 'snare') tone(target, 49, time, 0.02, 0.075, 'bass');
  }

  function chordAt(track, bar) {
    return track.chords[Math.floor(bar / 2) % track.chords.length];
  }

  function playChord(target, chord, time, duration, pad = false) {
    chord.forEach((note, i) => tone(target, note + 12, time + i * 0.011, duration,
      pad ? 0.018 : 0.045, pad ? 'pad' : 'keys', (i - 1.5) * 0.27));
  }

  function step(target, absoluteStep, time) {
    const track = tracks[target.track];
    const position = modulo(absoluteStep, track.bars * 16);
    const bar = Math.floor(position / 16);
    const beat = position % 16;
    const quarter = 60 / track.bpm;
    const chord = chordAt(track, bar);
    const section = Math.floor(bar / 8) % 5;
    const sparse = section === 3;
    const swung = time + (beat % 2 ? quarter * (track.swing ?? 0.012) : 0);

    // Small changes every eight bars keep the repeating harmony alive.
    if (beat === 0 || (beat === 8 && section !== 0)) {
      playChord(target, chord, time, quarter * (beat === 0 ? 1.4 : 1.0));
    }
    if (beat === 0 && section !== 0) playChord(target, chord, time, quarter * 3.3, true);

    if (beat === 0 || beat === 8 || (beat === 14 && !sparse)) {
      const note = chord[0] - 12 + (beat === 14 ? 7 : 0);
      tone(target, note, time, quarter * (beat === 14 ? 0.35 : 1.1), 0.24, 'bass');
    }
    if (beat === 0 || (!sparse && (beat === 8 || beat === (track.kickStep ?? 6)))) kick(target, time);
    if (beat === 4 || beat === 12) percussion(target, time, 'snare', sparse ? 0.13 : 0.19);
    if (beat % 2 === 0) percussion(target, time, beat === 14 && !sparse ? 'open' : 'hat', beat % 4 ? 0.075 : 0.048);
    if (!sparse && bar % 4 === 3 && beat === 15) percussion(target, swung, 'hat', 0.033);

    const melodyIndex = (Math.floor(beat / 2) + (bar % 2) * 8) % 16;
    const melodyNote = track.melody[melodyIndex];
    if (beat % 2 === 0 && melodyNote !== null && (!sparse || beat % 4 === 0)) {
      // Alternating phrases use chord tones as answers to the principal melody.
      const note = bar % 8 >= 4 ? chord[melodyIndex % 4] + 24 : melodyNote;
      tone(target, note, time + 0.014, quarter * 0.55, track.melodyLevel ?? 0.065, 'keys', bar % 2 ? 0.23 : -0.23);
    }
    if (track.arpeggio && !sparse && beat % 4 === 3) {
      tone(target, chord[(beat >> 2) % 4] + 12, swung, quarter * 0.25, 0.036, 'keys', -0.35);
    }
  }

  function schedule(target) {
    if (session !== target) return;
    const secondsPerStep = 60 / tracks[target.track].bpm / 4;
    const horizon = context.currentTime + 0.18;
    // If a background tab wakes much later, skip stale events instead of bursting them.
    const earliest = (context.currentTime - target.anchor + target.offset) / secondsPerStep;
    target.nextStep = Math.max(target.nextStep, Math.ceil(earliest));
    while (target.anchor + target.nextStep * secondsPerStep - target.offset < horizon) {
      const time = target.anchor + target.nextStep * secondsPerStep - target.offset;
      step(target, target.nextStep, Math.max(context.currentTime + 0.001, time));
      target.nextStep += 1;
    }
  }

  function getPosition() {
    if (!session || !context) return pausedPosition;
    return session.offset + Math.max(0, context.currentTime - session.anchor);
  }

  function stopSession() {
    if (!session) return;
    const previous = session;
    pausedPosition = getPosition();
    session = null;
    clearInterval(previous.timer);
    const now = context.currentTime;
    previous.bus.gain.cancelScheduledValues(now);
    previous.bus.gain.setValueAtTime(previous.bus.gain.value, now);
    previous.bus.gain.linearRampToValueAtTime(0, now + 0.025);
    previous.sources.forEach(source => {
      try { source.stop(now + 0.03); } catch (_) { /* Source has already finished. */ }
    });
    // Disconnect the delay feedback loop after its inaudible tail has expired.
    setTimeout(() => {
      previous.bus.disconnect();
      previous.echo.disconnect();
      previous.feedback.disconnect();
      previous.echoVolume.disconnect();
    }, 70);
  }

  async function play(trackIndex = currentTrack, offsetSeconds) {
    if (!AudioContextClass) return false;
    const ticket = ++request;
    const index = clamp(Math.trunc(Number(trackIndex) || 0), 0, tracks.length - 1);
    const requestedOffset = offsetSeconds === undefined ? (index === currentTrack ? getPosition() : 0) : Number(offsetSeconds);
    stopSession();
    currentTrack = index;
    pausedPosition = modulo(Number.isFinite(requestedOffset) ? requestedOffset : 0, tracks[index].duration);
    try {
      initialize();
      if (context.state !== 'running') await context.resume();
      if (ticket !== request || context.state !== 'running') return false;
      const bus = context.createGain();
      bus.gain.value = 0.0001;
      bus.gain.linearRampToValueAtTime(1, context.currentTime + 0.035);
      bus.connect(master);
      const echo = context.createDelay(1);
      echo.delayTime.value = (60 / tracks[index].bpm) * 0.75;
      const feedback = context.createGain();
      feedback.gain.value = 0.2;
      const echoVolume = context.createGain();
      echoVolume.gain.value = 0.16;
      echo.connect(feedback);
      feedback.connect(echo);
      echo.connect(echoVolume);
      echoVolume.connect(bus);
      const secondsPerStep = 60 / tracks[index].bpm / 4;
      session = { track: index, offset: pausedPosition, anchor: context.currentTime + 0.045,
        nextStep: Math.ceil(pausedPosition / secondsPerStep), bus, echo, feedback, echoVolume, sources: new Set(), timer: null };
      if (session.nextStep % 16 !== 0) {
        playChord(session, chordAt(tracks[index], Math.floor(session.nextStep / 16)), session.anchor, 0.45, true);
      }
      const active = session;
      schedule(active);
      active.timer = setInterval(() => schedule(active), 45);
      return true;
    } catch (error) {
      stopSession();
      console.warn('Audio could not start:', error);
      return false;
    }
  }

  function pause() {
    request += 1;
    stopSession();
  }

  function setVolume(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return;
    volume = clamp(numeric, 0, 1);
    if (context && master) master.gain.setTargetAtTime(volume * 0.75, context.currentTime, 0.018);
  }

  window.NanoAudio = {
    play, pause, setVolume, getPosition,
    isPlaying: () => Boolean(session && context && context.state === 'running'),
    supported: Boolean(AudioContextClass),
    tracks: tracks.map(({ title, artist, album, duration, theme }) => ({ title, artist, album, duration, theme })),
  };
})();
