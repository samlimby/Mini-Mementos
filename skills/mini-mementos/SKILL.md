---
name: mini-mementos
description: Create or refine playable isometric objects in standalone HTML/SVG, including reference-faithful rounded hardware, tactile controls, live displays, sound, and optional 360-degree inspection. Use for interactive product figures and nostalgic desk objects; adapt the Mini Mementos preset or retain the original monochrome line-art style when requested.
metadata:
  short-description: Build playable isometric mementos
---

# Mini Mementos

Create an object the user can operate, presented as a restrained figure plate. Its controls must produce real output: a changed display, a calculation, typed text, sound, or another meaningful result.

This refines the original `iso-figure` skill with the design developed for **Fig-1 · iPod Nano (3rd Gen)**. Preserve the small SVG projection kernel and standalone delivery, while supporting curved shells, material finishes, real music, tactile keycaps, and interruptible inspection.

## Choose the right scope

- For the established memento look, read [the design preset](references/memento-design.md).
- For geometry, finishes, or camera work, read [SVG geometry](references/svg-geometry.md).
- For working controls, audio, or inspection, read [interaction behavior](references/interaction-behavior.md).
- For an iPod reproduction or a concrete example of the complete result, use [the working reference](references/ipod-reference.md) and `assets/ipod-nano/`.

Keep object-specific content in the example: a calculator does not inherit the iPod's songs, controls, engraving, or branding. Add audio or inspection when the object's purpose or the user's request calls for it. A narrow styling edit should remain a narrow edit.

## Build around the output and reference

Identify the working output and the relevant physical surfaces first. Read the supplied reference images and, when requested, the current design source. Capture proportions, corner curvature, depth, bezel, controls, ports, and rear details before choosing geometry.

Use plain SVG, CSS, and JavaScript. The default deliverable is one HTML file that works from disk and offline; embed required fonts, icons, artwork, and code. Editable source modules may live beside it, but the HTML must run independently. Keep relevant license notices with embedded assets.

A real referenced product may retain the requested silhouette and markings. Use actual supplied or appropriately licensed assets; do not substitute an unrelated decorative glyph for a recognizable mark.

## Construct in local coordinates

Draw normal rectangles, circles, text, and paths in each surface's local coordinates. A projected basis becomes one SVG `matrix()`, keeping labels, rounded corners, and hit areas aligned.

Use boxes for genuinely angular parts. Use a rounded perimeter and thickness profile for a curved casing. Generated mesh vertices are appropriate; manually skewed decorative polygons are not a substitute for consistent geometry.

Keep opaque fills and deliberate painter's order. Use `vector-effect="non-scaling-stroke"` on technical outlines. In a rotatable view, cull rear-facing surfaces and sort visible surfaces by camera depth.

## Present the object quietly

The memento preset uses Roboto Mono, a light gray page, a white rounded plate, Radix Gray text and icons, compact captions, and tactile shortcut buttons beneath the figure. Keep physical finishes stable across light and dark page themes.

Use the supplied figure label and product name exactly, including capitalization. The completed example uses `Fig-1` and `iPod Nano (3rd Gen)`. Use a configurable label for another figure.

Show useful controls without reinstating removed decorative copy. This preset has no brand eyebrow, lower-left slogan, separate playback readout, promotional footer, dashed inner outline, or front/back/reset toolbar. Put playback state on the device's display. Surface additional controls only when the user requests them or they are necessary to operate the result.

The example header places `Made by Sam Limby` on the left and the theme control on the right, aligned on one row with matching 11px/16px Roboto Mono text. Keep the author configurable for another project. The theme control has a 16px icon and a reserved label slot so Light/Dark does not move the icon. Optional inspection appears as **3D view**, changing to **Done inspecting** while active. Shortcut arrows use the supplied icon family rather than text glyph substitutes.

For the original technical line-art style, retain the same geometry and interaction principles but use flat monochrome surfaces and optional functional corner captions. Colored physical materials and subtle highlights are part of the memento preset.

## Keep inputs and state coherent

Pointer, keyboard, trackpad, on-device controls, and external keycaps call the same actions. Separate player state from camera pose; visual rerenders and inspection must preserve playback, selection, volume, and position.

Keyboard keycaps depress immediately, stay down while held, and release cleanly. Short taps remain visible for about 80ms. Track aliases and ownership so releasing one input cannot release another held input. Clear held states and pending timers on blur, hidden tabs, page exit, and mode changes.

Use native buttons for external controls. Ignore global shortcuts during modified commands or editable typing. Let native Enter/Space activation operate a focused button once. Keep accessible names, focus indication, state announcements, and inspection focus/visibility in sync.

Trackpad and drag interactions must follow the pointer without interpolated lag. Map input into the transformed surface's local coordinates. Avoid firing frame clicks after wheel or screen gestures.

## Camera and motion

Clicking the casing or surrounding plate toggles front and isometric views when this behavior is part of the design. Exclude controls and real drags.

Optional inspection uses a complete front, rear, edge, and port model. Support multiple yaw turns and zoom limits. On **Done inspecting**, take the shortest rotation to the exact playable isometric pose, then hand over without a visual jump. New input can interrupt the return from its displayed pose.

Match the working reference's restrained timings: 480ms front/isometric transition, 160ms view fade, and 600ms critically damped inspection return. These are preset values, not a requirement for every object. Reduced motion uses immediate camera changes and color-only press feedback.

## Reuse and delivery

For an iPod, copy the reference into the user's output directory and adapt it. For a different object, reuse the relevant projection, presentation, and input patterns rather than leaving iPod logic in the result.

After editing the reference's audio or geometry source, synchronize its embedded copies:

```sh
python3 <skill-directory>/scripts/sync_modules.py <project-directory>
python3 <skill-directory>/scripts/sync_modules.py <project-directory> --check
```

Honor a requested preview port; otherwise use an available local port. When a project directory is renamed, update the server's document root. Do not assume a renamed working directory updates an already-running server.

Verify in the available browser with real pointer and keyboard input. Check the working output, pressed states, aligned labels, unclipped content, curved silhouette at grazing angles, rear/port orientation, and an interruption during inspection return. For audio, verify that a user gesture produces sound; controller mocks do not prove audible output.

Use meaningful behavioral checks for stateful controls. The reference includes interaction and audio scheduling checks that need only Node.js. Keep controller tests distinct from visual and sound verification.

Deliver the runnable HTML, any relevant editable modules, and a concise project README. Show the result at the requested local URL and provide a verified screenshot when the environment supports it.

## Design-source alignment

If asked to match Paper or another design source, read its current structure and computed values using available tools. Transfer actual spacing, typography, tokens, dimensions, and SVG paths; use screenshots for review, not for guessing measurements. Preserve live functionality when importing a static layout.

Create or update an external design file only within the user's requested scope. A reference link alone is a source to read, not a request to overwrite it.
