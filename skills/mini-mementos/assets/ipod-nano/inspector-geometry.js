/* Rounded iPod inspection geometry. Plain SVG; no animation loop or dependencies. */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  let sequence = 0;
  const createNode = (tag, attributes = {}) => {
    const node = document.createElementNS(NS, tag);
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
    return node;
  };
  const precise = value => Number(value.toFixed(4));
  const vector = (a, b) => a.map((v, i) => v - b[i]);
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const normalized = a => { const length = Math.hypot(...a); return a.map(v => v / length); };
  const centre = vertices => vertices[0].map((_, axis) => vertices.reduce((sum, point) => sum + point[axis], 0) / vertices.length);

  function create(svg, { getFront, getDefs }) {
    const prefix = `nano-inspect-${++sequence}-`;
    const paint = name => `url(#${prefix}${name})`;
    const rewrite = markup => markup
      .replace(/\bid="([^"]+)"/g, (_, id) => `id="${prefix}${id}"`)
      .replace(/url\(#([^\)]+)\)/g, (_, id) => `url(#${prefix}${id})`)
      .replace(/\b(?:href|xlink:href)="#([^"]+)"/g, (_, id) => `href="#${prefix}${id}"`);
    const defs = createNode('defs');
    defs.innerHTML = rewrite(getDefs());
    // Broad, warm reflections through the steel, with narrow highlights where
    // the rear shell rolls over. The engraving is etched light into the metal.
    const rearPaint = (name, attributes, stops) => {
      const gradient = createNode('linearGradient', { id: `${prefix}${name}`, ...attributes });
      for (const [offset, color] of stops) gradient.append(createNode('stop', { offset, 'stop-color': `var(${color})` }));
      defs.append(gradient);
    };
    rearPaint('rear-metal', { x1: '0', y1: '0', x2: '1', y2: '.08' }, [
      ['0', '--rear-steel-low'], ['.04', '--chrome-high'], ['.095', '--rear-steel-mid'],
      ['.34', '--rear-steel-high'], ['.58', '--rear-steel-mid'], ['.86', '--rear-steel-high'],
      ['.95', '--chrome-high'], ['1', '--rear-steel-low'],
    ]);
    rearPaint('rear-rim', { x1: '0', y1: '0', x2: '1', y2: '0' }, [
      ['0', '--chrome-high'], ['.04', '--rear-steel-low'], ['.08', '--chrome-high'],
      ['.23', '--rear-steel-mid'], ['.77', '--rear-steel-high'],
      ['.92', '--chrome-high'], ['.96', '--rear-steel-low'], ['1', '--chrome-high'],
    ]);
    rearPaint('rear-lip', { x1: '0', y1: '0', x2: '0', y2: '1' }, [
      ['0', '--rear-steel-low'], ['.2', '--chrome-high'], ['.42', '--rear-steel-mid'],
      ['.62', '--rear-steel-low'], ['.85', '--chrome-high'], ['1', '--rear-steel-mid'],
    ]);
    const engravingRelief = createNode('filter', { id: `${prefix}engraving-relief`, x: '-5%', y: '-5%', width: '110%', height: '110%', 'color-interpolation-filters': 'sRGB' });
    engravingRelief.append(createNode('feDropShadow', { dx: '.25', dy: '.35', stdDeviation: '.12', 'flood-color': 'var(--engraving-shadow)', 'flood-opacity': '.45' }));
    defs.append(engravingRelief);
    const mesh = createNode('g', { 'pointer-events': 'none', 'data-inspector-mesh': '' });
    svg.append(defs, mesh);
    const faces = [];
    let frontMarkup = null;
    let priorOrder = '';
    const addFace = (node, normal, origin, apply) => {
      const face = { node, normal, origin, apply, id: faces.length };
      mesh.append(node);
      faces.push(face);
      return face;
    };
    const outline = { 'stroke-width': '1', 'vector-effect': 'non-scaling-stroke', 'stroke-linejoin': 'round' };
    const front = createNode('g', { 'data-surface': 'front' });
    front.append(createNode('rect', { x: 0, y: 0, width: 292, height: 390, rx: 32, fill: paint('mint-metal'), stroke: 'var(--metal-edge)', ...outline }));
    front.append(createNode('rect', { x: 2.4, y: 2.4, width: 287.2, height: 385.2, rx: 29.6, fill: 'none', stroke: 'var(--metal-rim)', opacity: '.85', ...outline, 'stroke-width': '.65' }));
    const frontDetails = createNode('g');
    front.append(frontDetails);

    const back = createNode('g', { 'data-surface': 'back' });
    back.innerHTML = `<rect x="4" y="4" width="284" height="382" rx="28" fill="${paint('rear-metal')}" stroke="var(--rear-steel-low)" stroke-width=".7" vector-effect="non-scaling-stroke"/>
      <rect x="6.4" y="6.4" width="279.2" height="377.2" rx="26" fill="none" stroke="${paint('rear-rim')}" stroke-width="3.8"/>
      <rect x="9" y="9" width="274" height="372" rx="23" fill="none" stroke="var(--chrome-high)" stroke-width=".45" opacity=".6" vector-effect="non-scaling-stroke"/>
      <path class="rear-rolled-lip" d="M8 351C11 367 20 375 37 373Q146 366 255 373C272 375 281 367 284 351L284 358C282 377 272 384 255 384H37C20 384 10 377 8 358Z" fill="${paint('rear-lip')}"/>
      <path d="M11 354C15 369 23 371 38 370Q146 364 254 370C269 371 277 369 281 354" fill="none" stroke="var(--rear-steel-low)" stroke-width=".8" opacity=".75"/>
      <g class="rear-engraving" fill="var(--engraving-ink)" stroke="none" font-family="Helvetica Neue, Arial, sans-serif" text-anchor="middle" filter="${paint('engraving-relief')}">
        <!-- Apple silhouette: Simple Icons v11.15.0 (CC0), icons/apple.svg. -->
        <path class="rear-apple-logo" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" transform="translate(116.5 103) scale(2.4 1.85)" opacity=".84"/>
        <text x="146" y="193" font-size="37" font-weight="400" letter-spacing="-.8" opacity=".86">iPod</text>
        <g opacity=".74">
          <rect x="122" y="248" width="48" height="20" rx="4" fill="none" stroke="var(--engraving-ink)" stroke-width=".55"/>
          <text x="146" y="262.5" font-size="13" letter-spacing=".7">8GB</text>
        </g>
        <g class="rear-fine-print" opacity=".82" font-size="5.25" letter-spacing=".25">
          <text x="146" y="284">Serial No: 7M738PVCY37</text>
          <text x="146" y="291.5">Designed by Apple in California Assembled in China</text>
          <text x="146" y="299">Model No: A1236 EMC No: 2174 Rated 5.30V ⎓ 1A Max</text>
        </g>
        <g class="rear-regulatory" transform="translate(76 309)" fill="none" stroke="var(--engraving-ink)" stroke-width=".65" stroke-linecap="round" stroke-linejoin="round" opacity=".7">
          <!-- Etched FCC, crossed wheelie bin, CE, VCCI and compliance symbol. -->
          <path d="M0 15V1H7V3H2V6H6V8H2V15Z"/>
          <path d="M19 3A7 7 0 1019 13M18 5A4.5 4.5 0 1018 11M26 3A7 7 0 1026 13M25 5A4.5 4.5 0 1025 11"/>
          <g transform="translate(33)"><path d="M3 4H15L14 13H5ZM2 3H16M6 3V1H12V3M8 13V15M4 15H15M0 0L18 16M18 0L0 16"/><circle cx="6" cy="15" r=".8"/><circle cx="13" cy="15" r=".8"/></g>
          <path d="M67 1A7 7 0 1067 15M82 1A7 7 0 1082 15M75 8H81"/>
          <g transform="translate(91)"><rect width="27" height="16" rx="2"/><path d="M3 4L6 12L9 4M16 5A4 4 0 1016 11M23 5A4 4 0 1023 11M25 4V12"/></g>
          <g transform="translate(128)"><circle cx="8" cy="8" r="7.5"/><path d="M3 7L7 11L13 3M7 11V4"/></g>
        </g>
      </g>`;
    // Rear local +x points toward physical -x: the rear inscriptions read correctly.
    addFace(back, [0, 0, -1], [146, 195, -10], (project, basis) => {
      back.setAttribute('transform', basis([292, 0, -10], [-1, 0, 0], [0, 1, 0]));
    });
    addFace(front, [0, 0, 1], [146, 195, 10], (project, basis) => {
      front.setAttribute('transform', basis([0, 0, 10], [1, 0, 0], [0, 1, 0]));
    });

    // Closely spaced perimeter samples and a rounded thickness profile keep
    // grazing views smooth. Shared vertex normals blend the metal across bands.
    const cornerSteps = 16;
    const perimeter = (inset, z) => {
      const radius = 32 - inset;
      const points = [];
      const corners = [[260, 32, -90], [260, 358, 0], [32, 358, 90], [32, 32, 180]];
      for (const [cx, cy, start] of corners) {
        for (let step = 0; step <= cornerSteps; step++) {
          const angle = (start + step * 90 / cornerSteps) * Math.PI / 180;
          points.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle), z]);
        }
      }
      return points;
    };
    const profile = [[0, 10], [0, 7.5], [.1, 4.5], [.35, -4], [1, -7], [2.2, -9], [4, -10]];
    const rings = profile.map(([inset, z]) => perimeter(inset, z));
    const bandNormals = profile.slice(0, -1).map(([inset, z], band) => {
      const [nextInset, nextZ] = profile[band + 1];
      return normalized([z - nextZ, -(nextInset - inset)]);
    });
    const ringNormals = profile.map((_, ring) => {
      if (ring === 0) return normalized([1, .35]);
      if (ring === profile.length - 1) return normalized([.55, -.85]);
      return normalized(bandNormals[ring - 1].map((value, axis) => value + bandNormals[ring][axis]));
    });
    for (let band = 0; band < rings.length - 1; band++) {
      for (let index = 0; index < rings[band].length; index++) {
        const next = (index + 1) % rings[band].length;
        const vertices = [rings[band][index], rings[band + 1][index], rings[band + 1][next], rings[band][next]];
        const normal = normalized(cross(vector(vertices[1], vertices[0]), vector(vertices[2], vertices[0])));
        const gradient = createNode('linearGradient', { id: `${prefix}edge-${band}-${index}`, gradientUnits: 'userSpaceOnUse' });
        const upperStop = createNode('stop', { offset: 0 });
        const lowerStop = createNode('stop', { offset: 1 });
        gradient.append(upperStop, lowerStop); defs.append(gradient);
        const node = createNode('g', { 'data-surface': 'edge' });
        const surface = createNode('path', { fill: paint(`edge-${band}-${index}`), stroke: paint(`edge-${band}-${index}`), 'stroke-width': '.25', 'vector-effect': 'non-scaling-stroke' });
        node.append(surface);
        const seam = band === 0 ? createNode('path', { fill: 'none', stroke: 'var(--metal-edge)', 'stroke-width': '.5', opacity: '.65', 'vector-effect': 'non-scaling-stroke' }) : null;
        if (seam) node.append(seam);
        const radial = normalized([normal[0], normal[1], 0]);
        const vertexNormal = ring => [radial[0] * ringNormals[ring][0], radial[1] * ringNormals[ring][0], ringNormals[ring][1]];
        addFace(node, normal, centre(vertices), (project, basis, rotate) => {
          surface.setAttribute('d', `M${vertices.map(point => project(point).slice(0, 2).map(precise).join(' ')).join('L')}Z`);
          if (seam) seam.setAttribute('d', `M${[vertices[1], vertices[2]].map(point => project(point).slice(0, 2).map(precise).join(' ')).join('L')}`);
          const upper = project(centre([vertices[0], vertices[3]]));
          const lower = project(centre([vertices[1], vertices[2]]));
          gradient.setAttribute('x1', precise(upper[0])); gradient.setAttribute('y1', precise(upper[1]));
          gradient.setAttribute('x2', precise(lower[0])); gradient.setAttribute('y2', precise(lower[1]));
          const shade = ring => {
            const [nx, ny, nz] = rotate(vertexNormal(ring));
            const diffuse = -.42 * nx - .32 * ny + .7 * nz;
            const reflection = Math.pow(Math.max(0, -.35 * nx - .18 * ny + .82 * nz), 8);
            return `hsl(135 3% ${precise(Math.max(48, Math.min(94, 68 + diffuse * 22 + reflection * 14)))}%)`;
          };
          upperStop.setAttribute('stop-color', shade(band));
          lowerStop.setAttribute('stop-color', shade(band + 1));
        });
      }
    }

    // Match the bottom shell's taper so the port rims sit in the metal rather
    // than floating beyond the silhouette when viewed almost head-on.
    const ports = createNode('g', { 'data-surface': 'ports' });
    ports.innerHTML = `<g transform="translate(292 0) scale(-1 1)"><ellipse cx="48" cy="0" rx="6.4" ry="5.7" fill="var(--chrome-low)" stroke="var(--chrome-high)" stroke-width=".8" vector-effect="non-scaling-stroke"/>
      <ellipse cx="48" cy="0" rx="4.8" ry="4.5" fill="var(--port-ink)" stroke="var(--chrome-mid)" stroke-width=".65" vector-effect="non-scaling-stroke"/>
      <ellipse cx="48" cy="0" rx="3.3" ry="3.1" fill="var(--glass)"/>
      <rect x="106" y="-4.6" width="79" height="9.2" rx="2" fill="var(--chrome-low)" stroke="var(--chrome-high)" stroke-width=".8" vector-effect="non-scaling-stroke"/>
      <rect x="107.3" y="-3.4" width="76.4" height="6.8" rx="1.2" fill="var(--port-ink)"/>
      <path d="M112-1H179M114 1H177" fill="none" stroke="var(--chrome-mid)" stroke-width=".75" vector-effect="non-scaling-stroke"/>
      <path d="M118 .5v1.8m3-1.8v1.8m3-1.8v1.8m3-1.8v1.8m3-1.8v1.8m3-1.8v1.8m3-1.8v1.8m3-1.8v1.8m3-1.8v1.8m3-1.8v1.8m3-1.8v1.8m3-1.8v1.8m3-1.8v1.8m3-1.8v1.8m3-1.8v1.8m3-1.8v1.8m3-1.8v1.8m3-1.8v1.8m3-1.8v1.8" fill="none" stroke="var(--connector-pin)" stroke-width=".45"/>
      <rect x="230" y="-3.7" width="25" height="7.4" rx="3.7" fill="var(--port-ink)" stroke="var(--chrome-high)" stroke-width=".8" vector-effect="non-scaling-stroke"/>
      <rect x="248" y="-3" width="5.8" height="6" rx="2.4" fill="var(--hold-orange)"/>
      <rect x="231" y="-3" width="17" height="6" rx="2.4" fill="var(--chrome-mid)"/>
      <path d="M236-1.8v3.6m3-3.6v3.6m3-3.6v3.6" fill="none" stroke="var(--chrome-low)" stroke-width=".55" vector-effect="non-scaling-stroke"/></g>`;
    addFace(ports, normalized([0, 1, -.04]), [146, 389.7, 0], (project, basis) => {
      ports.setAttribute('transform', basis([0, 389.7, 0], [1, 0, 0], [0, -.04, -1]));
    }).detail = true;

    function updateFront() {
      const markup = getFront();
      if (markup === frontMarkup) return;
      frontMarkup = markup;
      frontDetails.innerHTML = rewrite(markup);
      for (const [selector, gradient] of [['.screen-bezel', 'bezel-metal'], ['.wheel-base', 'wheel-ivory'], ['.center .face', 'centre-metal']]) {
        frontDetails.querySelectorAll(selector).forEach(node => { node.style.fill = paint(gradient); });
      }
      // Controls are a view of the live player; inspection itself owns pointer input.
      frontDetails.querySelectorAll('[tabindex]').forEach(node => node.removeAttribute('tabindex'));
    }

    function render({ yaw = 0, pitch = 0, roll = 0, zoom = 1, centerX = 450, centerY = 265 } = {}) {
      updateFront();
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const cr = Math.cos(roll), sr = Math.sin(roll);
      const rotate = ([x, y, z]) => {
        const rx = cy * x + sy * z, rz = -sy * x + cy * z;
        const ry = cp * y - sp * rz;
        // Screen-space roll follows yaw/pitch; it changes no face's visibility.
        return [cr * rx - sr * ry, sr * rx + cr * ry, sp * y + cp * rz];
      };
      // 0.96 fits the upright 390-unit body within the 460-unit viewport.
      const scale = .96 * zoom;
      const project = ([x, y, z]) => {
        const [rx, ry, rz] = rotate([x - 146, y - 195, z]);
        return [centerX + rx * scale, centerY + ry * scale, rz];
      };
      const basis = (origin, u, v) => {
        const o = project(origin), a = rotate(u), b = rotate(v);
        return `matrix(${[a[0] * scale, a[1] * scale, b[0] * scale, b[1] * scale, o[0], o[1]].map(precise).join(' ')})`;
      };
      const frontNormal = rotate([0, 0, 1]);
      svg.dataset.side = Math.abs(frontNormal[2]) < .09 ? 'edge' : frontNormal[2] > 0 ? 'front' : 'back';
      svg.dataset.yaw = String(precise(yaw));
      svg.dataset.pitch = String(precise(pitch));
      svg.dataset.roll = String(precise(roll));
      svg.dataset.zoom = String(precise(zoom));
      svg.dataset.centerX = String(precise(centerX));
      svg.dataset.centerY = String(precise(centerY));
      const visible = [];
      for (const face of faces) {
        const normal = rotate(face.normal);
        const shown = normal[2] > .0001;
        face.node.style.display = shown ? '' : 'none';
        if (!shown) continue;
        face.apply(project, basis, rotate);
        face.depth = project(face.origin)[2] + (face.detail ? .3 : 0);
        visible.push(face);
      }
      visible.sort((a, b) => a.depth - b.depth);
      const order = visible.map(face => face.id).join(',');
      if (order !== priorOrder) {
        visible.forEach(face => mesh.append(face.node));
        priorOrder = order;
      }
      return { side: svg.dataset.side, yaw, pitch, roll, zoom, centerX, centerY, visibleFaces: visible.length };
    }
    return { render, destroy() { defs.remove(); mesh.remove(); } };
  }
  window.NanoInspector = { create };
})();
