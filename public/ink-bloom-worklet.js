/**
 * Ink bloom mask (CSS Paint API). Paints an opaque, irregular ink stain that
 * grows from (--ink-x, --ink-y) as --ink-p goes 0 -> 1. Used as the mask of
 * ::view-transition-new(root), so the new theme soaks in through it.
 *
 * Pure function of its inputs (Chrome runs several worklet scopes and may
 * repaint any frame), so every random choice comes from --ink-seed.
 */
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function num(props, name, fallback) {
  const v = props.get(name);
  const n = parseFloat(v && v.toString());
  return Number.isFinite(n) ? n : fallback;
}

const TAU = Math.PI * 2;
const MIN_STEPS = 240; // polygon resolution around the stain
const MAX_STEPS = 1600;
const LAYERS = 9; // feather layers in the wet fringe

function makeShape(seed) {
  const r = rng(seed);
  const between = (a, b) => a + (b - a) * r();

  // Low-frequency lobes give the overall blot silhouette
  const harmonics = [];
  for (let k = 2; k <= 7; k++) {
    harmonics.push({ k, amp: between(0.05, 0.16) / Math.pow(k, 0.72), phase: r() * TAU, drift: between(-0.6, 0.6) });
  }
  // Fingers of ink that run ahead along paper fibres
  const tendrils = [];
  const nT = 3 + Math.floor(r() * 5);
  for (let i = 0; i < nT; i++) {
    tendrils.push({
      angle: r() * TAU,
      width: between(0.05, 0.16),
      reach: between(0.12, 0.34),
      lag: between(0, 0.35), // starts later than the body
    });
  }
  // Fine fibre noise per feather layer
  const fibre = [];
  for (let l = 0; l < LAYERS; l++) {
    const terms = [];
    // Outer layers get rougher, so the fringe frays instead of stacking in bands
    const rough = 1 + l * 0.55;
    for (let j = 0; j < 6; j++) {
      terms.push({ k: 9 + Math.floor(r() * 48), amp: between(0.003, 0.012) * rough, phase: r() * TAU });
    }
    fibre.push(terms);
  }
  // Pigment granules sitting in the wet edge (polar, relative to the edge)
  const specks = [];
  const nS = 160 + Math.floor(r() * 120);
  for (let i = 0; i < nS; i++) {
    specks.push({ a: r() * TAU, off: between(-0.03, 0.09), size: between(0.5, 2.2), alpha: between(0.15, 0.7) });
  }
  // Satellite drops that bloom just outside the main stain and get swallowed
  const drops = [];
  const nD = 2 + Math.floor(r() * 4);
  for (let i = 0; i < nD; i++) {
    drops.push({ a: r() * TAU, dist: between(1.02, 1.2), size: between(0.03, 0.08), at: between(0.2, 0.65) });
  }
  return { harmonics, tendrils, fibre, specks, drops, wobbleSpeed: between(0.8, 1.6) };
}

function radiusAt(shape, theta, p, layer) {
  let f = 1;
  for (const h of shape.harmonics) {
    f += h.amp * Math.sin(h.k * theta + h.phase + h.drift * p * shape.wobbleSpeed);
  }
  for (const t of shape.tendrils) {
    let d = Math.abs(theta - t.angle) % TAU;
    if (d > Math.PI) d = TAU - d;
    const grow = Math.max(0, Math.min(1, (p - t.lag) / (1 - t.lag)));
    f += t.reach * grow * Math.exp(-(d * d) / (2 * t.width * t.width)) * (1 - 0.5 * p);
  }
  const terms = shape.fibre[layer] || shape.fibre[0];
  for (const n of terms) f += n.amp * Math.sin(n.k * theta + n.phase + layer);
  return f;
}

class InkBloom {
  static get inputProperties() {
    return ["--ink-p", "--ink-x", "--ink-y", "--ink-seed"];
  }

  paint(ctx, size, props) {
    const p = Math.max(0, Math.min(1, num(props, "--ink-p", 0)));
    const cx = num(props, "--ink-x", size.width / 2);
    const cy = num(props, "--ink-y", 0);
    const seed = num(props, "--ink-seed", 1);
    if (p <= 0) return;
    if (p >= 1) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, size.width, size.height);
      return;
    }

    const shape = makeShape(seed);
    const far = Math.max(
      Math.hypot(cx, cy),
      Math.hypot(size.width - cx, cy),
      Math.hypot(cx, size.height - cy),
      Math.hypot(size.width - cx, size.height - cy),
    );
    // Scale so the thinnest part of this particular blot clears the farthest
    // corner at p = CLEAR, whatever the seed. Keeps coverage bounded while the
    // growth is spread across the whole animation.
    const CLEAR = 0.94;
    let minF = Infinity;
    for (let i = 0; i < 96; i++) {
      minF = Math.min(minF, radiusAt(shape, (i / 96) * TAU, CLEAR, 0));
    }
    const R = (far * p) / (CLEAR * Math.max(0.45, minF)) + 6;

    // Feathered edge: outer layers are wider and fainter, like pigment
    // bleeding into damp paper. The innermost layer is fully opaque.
    // ~5px edge segments at any size, so the fringe never looks faceted
    const steps = Math.round(Math.min(MAX_STEPS, Math.max(MIN_STEPS, (R * TAU) / 5)));
    for (let l = LAYERS - 1; l >= 0; l--) {
      const spread = 1 + l * (0.007 + 0.013 * (1 - p));
      const alpha = l === 0 ? 1 : 0.26 * Math.pow(1 - l / LAYERS, 1.1);
      ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const th = (i / steps) * TAU;
        const rr = R * spread * radiusAt(shape, th, p, l);
        const x = cx + Math.cos(th) * rr;
        const y = cy + Math.sin(th) * rr;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    }

    // Satellite drops: appear, swell, and merge into the stain
    for (const d of shape.drops) {
      const t = (p - d.at) / 0.35;
      if (t <= 0 || t >= 1.4) continue;
      const rr = R * radiusAt(shape, d.a, p, 0) * d.dist;
      const x = cx + Math.cos(d.a) * rr;
      const y = cy + Math.sin(d.a) * rr;
      const s = R * d.size * Math.min(1, t);
      ctx.fillStyle = `rgba(0,0,0,${0.35 + 0.5 * Math.min(1, t)})`;
      ctx.beginPath();
      ctx.ellipse(x, y, s * 1.2, s * 0.8, d.a, 0, TAU);
      ctx.fill();
    }

    // Granulation: specks of pigment caught in the wet edge
    const fade = 1 - Math.max(0, (p - 0.75) / 0.25);
    for (const sp of shape.specks) {
      const edge = R * radiusAt(shape, sp.a, p, 1);
      const rr = edge * (1 + sp.off);
      const x = cx + Math.cos(sp.a) * rr;
      const y = cy + Math.sin(sp.a) * rr;
      ctx.fillStyle = `rgba(0,0,0,${sp.alpha * fade})`;
      ctx.beginPath();
      ctx.arc(x, y, sp.size * (1 + p), 0, TAU);
      ctx.fill();
    }

    // Final soak: whatever is left fills in so the swap never pops
    if (p > 0.93) {
      ctx.fillStyle = `rgba(0,0,0,${Math.min(1, (p - 0.93) / 0.07)})`;
      ctx.fillRect(0, 0, size.width, size.height);
    }
  }
}

registerPaint("ink-bloom", InkBloom);
