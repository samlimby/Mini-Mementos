# Mini Mementos

A repostory containing isometric, interactive models of devices/objects that hold a special place in my heart.

All of the models here are standalone HTML file. With them using SVG, CSS, JavaScript, and the Web Audio API, with no build step or runtime dependencies. Fonts, icons, artwork, geometry, and audio code are embedded for offline use.

## iPod Nano (3rd Gen) controls

| Input | Action |
| --- | --- |
| ↑ / ↓ | Browse menus |
| → / Enter | Select |
| ← | Go back |
| W | Menu / back |
| A | Restart or previous track; hold to rewind |
| S / Space | Play or pause |
| D | Next track; hold to fast-forward |
| Trackpad scroll over the player | Browse menus, adjust volume, or seek |
| Drag around the click-wheel ring | Browse menus, adjust volume, or seek |
| Centre button in Now Playing | Switch between volume and seeking |
| Click the casing or surrounding frame / V | Toggle front and isometric views |

The on-page keycaps also work as buttons. Matching keyboard input visually depresses each keycap while held; quick taps remain visible briefly. Leaving the tab clears pressed states.

## Inspect the model

Choose **3D view** or press **I** to inspect the rounded casing, ports, and engraved chrome back. Music continues during inspection.

| Input | Action |
| --- | --- |
| Drag horizontally / vertically | Rotate / tilt |
| Scroll / + / − | Zoom |
| Arrow keys | Rotate; hold Shift for finer steps |
| F / B | Face the front / back toward you |
| R | Reset the inspection angle and zoom |
| S / Space | Play or pause |
| Done inspecting | Smoothly return to the isometric player |
| Escape / I | Return immediately |

Dragging during the return interrupts it at the current angle. Reduced-motion preferences use immediate view changes and color-only keycap feedback.

## Music library

The player includes **13 original electronic instrumentals** by **Small Hours**, grouped into **After Hours**, **Green Rooms**, and **Tidal Notes**. Each track has its own melody, chord progression, and arrangement, synthesized locally rather than streamed.

Browse **Music → Songs** or **Music → Albums**. Shuffle uses the full library. Photos shows the original album artwork; Videos and Podcasts display empty-library states.

## Design and credits

- Figure style and projection kernel adapted from [MrBongoC/ai-iso-skill](https://github.com/MrBongoC/ai-iso-skill), particularly the [pocket calculator](https://mrbongoc.github.io/ai-iso-skill/examples/pocket-calculator.html). The upstream MIT notice is preserved in `index.html` and `licenses/ai-iso-skill-MIT.txt`.
- Roboto Mono Regular and Medium are embedded under the SIL Open Font License, included in `index.html`.
- Interface text and icons use the [Radix UI Gray palette](https://github.com/radix-ui/colors), with light and dark page themes.
- Icon assets include licensed Central Icons and user-provided SVGs.

## Reusable skill

The refined [Mini Mementos skill](skills/mini-mementos/SKILL.md) captures this project's memento presentation, rounded material geometry, tactile inputs, music, and interruptible 360° inspection. Its working iPod reference and behavior checks live in the skill's `assets/ipod-nano/` directory.

Invoke it as `$mini-mementos` in Codex, or use the `mini-mementos` installation in Claude. The skill keeps general guidance separate from the iPod-specific example, so other objects can reuse the style without inheriting its controls or songs.
