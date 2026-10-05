# Finished iPod reference

`assets/ipod-nano/` contains the runnable Fig-1 example and its editable modules, icons, and behavioral checks. It is a snapshot of the finished isometric-mementos design, including the latest playback spacing, title, theme glyph, and keyboard keycap feedback.

## Reuse

Copy the asset directory's contents into the user's chosen output directory. Open `index.html` directly, or serve that directory:

```sh
python3 -m http.server 3500 --bind 127.0.0.1 --directory <output-directory>
```

Use port 3500 when it is requested for this project. Do not stop a server owned by another project to claim that port.

The HTML embeds Roboto Mono Regular/Medium, all display art and icons, the audio engine, the renderer, and controller code. It has no external runtime dependencies.

Edit `index.html` for presentation, menus, input, and camera transitions. Edit `audio-engine.js` for music and `inspector-geometry.js` for the rounded model. After a module change, use the skill's `scripts/sync_modules.py` to synchronize its marked embedded block.

Run:

```sh
node tests/interaction-check.cjs
node tests/audio-library-check.cjs
```

The interaction checks exercise actual registered controller handlers with deterministic time and mocked DOM/audio. The audio checks exercise real scheduling code with a mocked AudioContext. Browser visual and audible checks remain necessary after relevant changes.

## Visual result

- Green third-generation nano proportions, continuous rounded shell, finely shaded metal edges, ivory wheel, and dark recessed bezel.
- Original-style split menu LCD, blue selection, album art, and a working Now Playing display.
- Head-on and isometric views, plus a complete inspection model with front, sides, bottom ports, and warm chrome back.
- Reference-faithful Apple/iPod engraving, 8GB badge, fine print, regulatory marks, and lower rolled lip. The rear photograph's visible port order is headphone, dock, hold from left to right.
- Light/dark neutral presentation, Roboto Mono captions, Radix Gray text/icons, licensed Central arrow glyphs, supplied theme/3D glyphs, and LarsUI-style keycaps.
- Exact labels `Fig-1`, `iPod Nano (3rd Gen)`, `3D view`, and `Done inspecting`.

## Library

All tracks are original local synth arrangements by Small Hours:

| Album | Tracks |
| --- | --- |
| After Hours | Night Drive; Neon Crossing; Last Train; Side Streets |
| Green Rooms | Soft Focus; Open Windows; Morning Light; Quiet Corners |
| Tidal Notes | Blue Sunday; Glass Tide; Paper Boats; Distant Shore; First Light |

The full list has 13 songs; Music → Songs scrolls through it, Albums groups it, shuffle reaches all alternatives, and About reports the derived count.

## Provenance

The original skill and projection style came from [MrBongoC/ai-iso-skill](https://github.com/MrBongoC/ai-iso-skill), with the [pocket calculator](https://mrbongoc.github.io/ai-iso-skill/examples/pocket-calculator.html) as the initial presentation reference.

The design was refined in [the Paper file](https://app.paper.design/file/01M1B9X56GSA24DFVFMX4P205S/p-H-0). Use its current exported values for future Paper-alignment requests rather than treating this snapshot as newer evidence.

The original upstream MIT notice and Roboto Mono OFL are embedded in `index.html`. The Apple silhouette carries its Simple Icons CC0 attribution in `inspector-geometry.js`. Central Icons are licensed assets; their license key is deliberately absent. Reusing this private reference does not make those icons MIT-licensed or grant permission to redistribute them publicly.
