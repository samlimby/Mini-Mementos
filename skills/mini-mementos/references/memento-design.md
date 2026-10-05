# Memento presentation preset

Use this preset to reproduce the design developed in isometric-mementos. These are the final example's values, not global constraints for all illustrations. If the current Paper design has changed, its exported values take precedence for a requested alignment.

## Page and plate

| Element | Value |
| --- | --- |
| Page | Light gray `#f3f3f3`; dark `#0c0d0e` |
| Plate | White `#ffffff`; dark `#141516` |
| Plate border | 1px `#dfe5dc`; dark `#252729` |
| Main width | Maximum 960px, centered |
| Page padding | 42px 28px 26px |
| Plate corners | 12px |
| Plate padding | 32px 32px 12px |
| Caption | Flex row, space-between, wrap, 12px gap |
| Figure label | Roboto Mono Medium 500, 12px/16px, .045em tracking |
| Product caption | Roboto Mono Regular 400, 10px/12px, .15em tracking |
| Header credit | `Made by Sam Limby`, left aligned; match theme text at 11px/16px Regular, .04em tracking, Gray 11 |
| Theme | Right aligned on the same centered row as the credit, 16px icon, 8px gap, 36px label slot |
| 3D view | Bottom right inside plate; 16px icon, 8px gap, 11px/16px text |
| Controls | Three columns in ratios 1.05:1:1.2, 28px gaps, padding 26px 5px 24px |

Keep product-caption case literal using `text-transform:none`. Do not globally uppercase `iPod Nano (3rd Gen)`. The figure label is exactly `Fig-1`, including the hyphen.

The reference's caption, scene, and inspection toolbar have `width:calc(100% + 2px)` to reproduce the imported Paper plate's explicit inner widths. Treat that as an existing-layout adjustment, not a pattern to add to unrelated designs.

At 700px and below: page padding 20px 12px, plate padding 24px 17px 12px, two control columns with 22px gaps and the wheel instructions spanning both. At 520px and below: one column.

Keep the presentation sparse. Retain the figure label, product caption, quiet author credit, theme control, useful shortcut groups, wheel instructions, and optional 3D control. The earlier promotional branding eyebrow was removed; the later requested author credit is intentional. Omit decorative slogans, separate status strip, nostalgic footer/play CTA, dotted inner boundary, and inspection helper toolbar.

## Typography and neutral colors

Embed actual Roboto Mono Regular 400 and Medium 500 when offline delivery is required; use their supplied OFL notice. Prevent synthetic font weights. The iPod LCD and engraved hardware use their own reference-appropriate sans-serif styles.

Surrounding text and icons use Radix Gray. The physical object's text uses the fixed light Gray scale, so a dark page does not recolor the LCD, wheel labels, or engraving.

| Step | Light | Dark |
| --- | --- | --- |
| 1 | #fcfcfc | #111111 |
| 2 | #f9f9f9 | #191919 |
| 3 | #f0f0f0 | #222222 |
| 4 | #e8e8e8 | #2a2a2a |
| 5 | #e0e0e0 | #313131 |
| 6 | #d9d9d9 | #3a3a3a |
| 7 | #cecece | #484848 |
| 8 | #bbbbbb | #606060 |
| 9 | #8d8d8d | #6e6e6e |
| 10 | #838383 | #7b7b7b |
| 11 | #646464 | #b4b4b4 |
| 12 | #202020 | #eeeeee |

Use step 11 for captions, labels, and icons, and step 12 for emphasized/live surrounding UI. The LCD's blue selection and colored artwork remain physical display content.

## Shortcut groups and keycaps

Section headings are 8px/10px Regular with .16em tracking and a 12px lower gap. Text labels are 10px/20px Regular. Key letters are 10px/12px Medium.

Keycaps follow the LarsUI tooltip shortcut reference: 25px wide, 24px high, 4px corner radius, padding 2px 3px, 1px borders with a 3px lower border. They are real buttons with accessible labels, not inert `kbd` decorations.

| State | Light face / border | Dark face / border |
| --- | --- | --- |
| Normal | Gray 5 / Gray 8 | Gray 4 / Gray 7 |
| Hover | Gray 4 / Gray 8 | Gray 5 / Gray 7 |
| Pressed | Gray 6 / Gray 8 | Gray 3 / Gray 7 |

Text/icons stay Gray 11. Pressed appearance uses a 1px bottom border and 4px top padding inside the same fixed height; neighboring content stays stationary. Define pressed styling after hover styling so hover cannot hide it. Under reduced motion, preserve the normal border/padding and change only the face color.

Explore uses two rows: Up/Down + browse; Left/Right + back / select. Use an 8px gap between items and 8px row spacing. Arrow SVGs are 12px × 12px using the Central Icons paths in the reference.

Playback uses two rows: W + menu, S + play / pause; A + rewind, D + forward. The first pair in each row occupies a non-shrinking **88px slot**, followed by an **8px row gap**. Every key-to-label gap is **8px**; the D/forward pair is also 88px wide. This aligns W/A, menu/rewind, S/D, and play/forward without text-length-dependent offsets.

Wheel copy has two lines, 10px with a 1.85 line-height:

> Two-finger scroll over the player\
> or click and drag around the ring.

Do not restore the removed Enter/hold/volume helper notes just because the implementation supports those shortcuts.

## Icon choices

Use available licensed Central Icons for surrounding UI, plus the exact user-provided theme and 3D SVGs saved in the example. Use `currentColor` for their fill/stroke so the Gray theme applies. Keep the theme and 3D icons 16px, and keycap arrows 12px. Do not put a license key in source, output, docs, or the skill.

The final theme glyph is a solid half-filled contrast circle with even-odd fill. The 3D glyph is the supplied three-axis cube mark. Preserve these shapes rather than substituting lookalike text characters.
