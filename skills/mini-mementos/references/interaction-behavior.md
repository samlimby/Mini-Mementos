# Working inputs, audio, and inspection

## Shared action state

Use one action layer for pointer, keyboard, wheel, and shortcut buttons. Keep playback/menu state separate from camera state. Entering inspection, changing the page theme, or toggling front/isometric views must not reset the library, menu selection, volume, position, or active audio.

The iPod reference maps Up/Down to browse, Right/Enter to select, Left to back, W to menu, A/Space to play/pause, S to next/held seek forward, and D to previous/restart/held seek backward. These mappings reflect this user's requested controls; choose meaningful mappings for a different object.

### Keyboard keycap feedback

Maintain physical-key ownership separately from action/cap state:

- Normalize single-character keys to lowercase. Ignore modified shortcuts and editable targets.
- Add the pressed class on the first keydown, before dispatching the action.
- Hold that class until all keys mapped to the same cap have released.
- Ignore key-repeat for toggle/tap actions without prematurely releasing the visual state.
- Give quick taps an 80ms minimum visible press; long holds release immediately on keyup.
- Cancel a pending release timer when a new press starts. An older timer must never release a newer press.
- On blur, hidden tabs, page exit, or a mode switch, clear caps, owners, release timers, and pending/active held actions.

Enter/Space on a focused native button should highlight that button and let its native click run once. It must not also fire a global shortcut or incorrectly highlight the play cap. Camera arrow keys in inspection should not depress disabled player caps; A/Space may still depress the enabled play cap.

## Tap, hold, and ring gestures

S/D taps and holds share controls but have different effects. A pending hold records its owner; crossing the hold threshold starts seeking, while a short release executes exactly one track action. Opposing key releases or another pointer must not end the active owner's hold. Cancel holds during mode changes and blur so a later timer cannot skip a track.

The ring supports both trackpad scrolling and circular dragging. In menus it browses; in Now Playing it adjusts volume or seeks, with the center button switching the wheel mode. Convert input to local wheel coordinates and normalize wheel units. Clamp volume and seek bounds.

Use pointer capture and a small drag threshold. Once a pointer moves beyond the threshold, remember that it was a drag even if it returns to its start. Track the owning pointer ID, cancel on lost capture/cancellation, and clean up on blur.

### Frame view toggle

Only genuine taps on the casing or surrounding frame toggle front/isometric view. Record the press origin and exclude wheel, display items, center button, keycaps, theme, and inspection controls. Exclusion must survive retargeting of pointerup to the frame after capture.

Use the same action for a frame click and V. Repeated toggles should settle at the last requested view without restarting playback or losing selection.

## Local music

Create/resume the AudioContext in a user gesture. Reuse the context and one master volume control. Preserve a meaningful paused position and make the visible playing state reflect whether audio actually started.

Use short look-ahead scheduling against the AudioContext clock rather than producing notes directly from visual animation frames. Keep scheduled sessions cancellable, fade transitions briefly, and invalidate stale asynchronous play requests so rapid track/play changes cannot activate an old request later.

Changing track while paused should remain silent and prepare the new track at zero. Seeking should update audio and display coherently. Camera motion must never recreate an audio session.

For multiple original tracks, vary musical structure, not only their labels: melody, chords, tempo, rhythm, arrangement, swing, and timbre. Derive song counts, album grouping, scrolling lists, and skip bounds from the library. Shuffle should reach the full library and avoid the current track when alternatives exist.

The bundled example has 13 original instrumentals across three albums. That count is an example-library fact, not the required size for another object. Prefer locally generated or supplied licensed audio when offline playback is required.

## Complete 360° inspection

Inspection gets its own yaw/pitch/roll/zoom/center state and a complete rounded mesh. Display content is a read-only view of the active player, not a second player controller.

The reference supports:

- Horizontal drag for unlimited yaw turns, vertical drag for clamped tilt.
- Scroll or +/- for zoom, normalized wheel units and fixed bounds; Ctrl-pinch does not also apply wheel zoom.
- Arrows for camera steps, Shift for fine steps.
- F/B for front/back, R for the initial inspection pose.
- A/Space for the same live playback action.
- Done inspecting for a graceful return; Escape/I for an immediate exit.

These camera shortcuts can remain discoverable in accessible descriptions without adding the removed helper toolbar back to the visual presentation.

### Graceful return and interruption

Done inspecting uses the current displayed camera pose as its origin. Repeated Done clicks do not restart it. Strip complete yaw turns by choosing the nearest equivalent target:

```js
targetYaw = currentYaw + Math.atan2(
  Math.sin(isoYaw-currentYaw),
  Math.cos(isoYaw-currentYaw)
);
```

The reference uses a normalized critically damped settle over 600ms:

```js
const t = Math.max(0, Math.min(1, elapsed / 600));
const progress = (1-(1+9*t)*Math.exp(-9*t)) / (1-10*Math.exp(-9));
```

Interpolate pose values from the captured origin to the matched playable isometric pose. Prepare the hidden player view at its settled isometric transform before revealing it, especially if inspection was entered from head-on view.

A new drag, scroll, camera key, or pose shortcut cancels the pending return at its current displayed pose. Blur also cancels it. Stop every pending animation frame and clear the return flag. Dragging continues from that pose without a jump.

Only after reaching the target should the playable scene take over, player controls re-enable, inspection become hidden, and focus return to its toggle. Reduced-motion preference bypasses the return path and settles immediately.

## Verification that changes decisions

Check held keyboard states, aliases, quick re-presses, native button activation, editable typing, and cleanup. Check pending/active seeks, opposing ownership, menu restoration, library scrolling, shuffle, and paused skips.

For inspection, check multiple rotations, front/back orientation, zoom/tilt bounds, drag reversal at a limit, control availability, shortest-path return, interrupted return, landing alignment, focus, and preserved live playback.

Run the reference's Node checks for controller/scheduling regressions. Then use the browser for layout, actual keyboard/pointer events, camera surfaces, and audible output. A mocked AudioContext confirms scheduling logic, not sound quality or browser gesture permission.
