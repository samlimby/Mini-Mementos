# SVG geometry and finishes

## Surface projection

For simple isometric objects, use the original kernel:

```js
const C = Math.cos(Math.PI / 6), S = Math.sin(Math.PI / 6);
const OX = 465, OY = 300;
const P = (x, y, z) => [(x-y)*C + OX, (x+y)*S - z + OY];
const D = (x, y, z) => [(x-y)*C, (x+y)*S - z];
const plane = (O, U, V) => {
  const o=P(...O), u=D(...U), v=D(...V);
  return `matrix(${u[0]} ${u[1]} ${v[0]} ${v[1]} ${o[0]} ${o[1]})`;
};
const TOP = (x,y,z) => plane([x,y,z],[1,0,0],[0,1,0]);
const FRONT = (x,y,z) => plane([x,y,z],[1,0,0],[0,0,-1]);
const SIDE = (x,y,z) => plane([x,y,z],[0,-1,0],[0,0,-1]);
```

Axes: +x runs down-right, +y down-left, and +z up. Draw labels and controls in the corresponding surface-local group. Clip display contents to the glass outline.

Projected coordinates should come from the same geometric model as the visual surface. For input, transform the pointer through the inverse screen CTM or equivalent inverse surface basis; page coordinates and SVG coordinates are not interchangeable.

## A curved casing is a continuous shell

Rounding only the front rectangle while leaving rectangular side slabs produces the blocky result rejected during this project. Use shared perimeter rings and a thickness profile so the silhouette stays rounded at the corner and at grazing angles.

The iPod example uses a 292 × 390 local front with a 32-unit radius. Its front is at z=10 and its rear at z=-10. Its curved edge uses 16 subdivisions per quarter-circle and these inset/z bands:

```js
const profile = [
  [0,10], [0,7.5], [.1,4.5], [.35,-4],
  [1,-7], [2.2,-9], [4,-10]
];
```

Connect corresponding perimeter samples, compute normals, and blend normals between rings for lighting. Fine sampling and consistent boundaries give definition without coarse faceting or corner cracks.

For a freely rotating orthographic camera:

1. Center the physical model before yaw/pitch/roll.
2. Derive every projected point and surface basis from the same rotation.
3. Cull surfaces whose rotated outward normal points away from the viewer.
4. Sort visible surfaces by projected depth; include ports and overlays at their physical surface depth.
5. Update geometry only when pose or relevant display content changes. Avoid rebuilding unchanged face content or reordering an unchanged painter's sequence.

The example renderer prefixes gradient/filter/clip IDs when cloning the front into inspection. Duplicate SVG IDs otherwise make the second scene resolve paints against the wrong definitions. Remove copied interactive tab stops from the passive inspection mesh.

## Materials and clarity

The illustration keeps a technical outline but permits material-specific gradients on the physical object. Avoid adding atmospheric decoration or gradients to the surrounding UI.

For the green nano, stable mint colors span `#568d72`, `#80b896`, `#a2d2b2`, and `#78ac8c`; seams use `#476e53` and fine highlights `#e0f2e2`. The wheel is near-white with subtle ivory shading.

Use a broad warm-steel reflection on the back, narrow bright rolled edges, a defined seam, a recessed bezel, and port rims seated in the metal. The rear steel spans `#828779`, `#bdc1b0`, and `#d7dace`. Lighting changes with the camera; physical material colors do not change with the page theme.

Separate structural outlines, fine seams, bezel lips, and port interiors. Preserve the hairline style with `vector-effect="non-scaling-stroke"` on outlines. Material relief may use a deliberately scaling detail where required by the reference.

## Front and rear orientation

Render a real rear surface with its own readable local basis. A transparent duplicate of the front cannot represent the back. In the example, the rear basis starts at [292,0,-10] and uses local axes [-1,0,0] and [0,1,0], keeping the engraving readable.

Place ports once in physical coordinates. Check their order from both front and rear views against the supplied photograph. For this nano reference, rear view shows headphone left, dock center, hold switch right. Do not independently mirror the rear graphics while leaving the ports in an inconsistent orientation.

The finished back uses a correctly shaped Apple mark, the iPod wordmark, an outlined 8GB badge, fine print, regulatory marks, and a rolled lower chrome lip. It replaced an incorrect music-note logo. The reference's exact path and placement are in `assets/ipod-nano/inspector-geometry.js`; preserve their source notices when reusing them.

For a new object, choose the real rear details from its reference. Serial numbers and compliance text in the nano example are visual reference content, not values to copy into another product.

## Camera handoff

The inspection landing camera must project the front surface onto the exact plane used by the playable isometric view. Match rotation, zoom, and screen center; merely choosing similar yaw/pitch leaves a jump when the scene switches.

Validate both head-on and grazing views, one full rotation, rear text orientation, and the exact landing pose. Use projected extrema to fit the scene with roughly 8–15% margins rather than compensating with arbitrary cropping.
