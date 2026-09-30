/**
 * Ink bloom mask (CSS Paint API). Paints two opaque, irregular ink stains
 * that grow as --ink-p goes 0 -> 1 and merge (the mask is their union):
 *   1. from (--ink-x, --ink-y), the theme toggle, shaped by --ink-seed
 *   2. a second drop that lands at (--ink-x2, --ink-y2) after --ink-d2 (a
 *      fraction of the run), with its own shape from --ink-seed2 and a splash
 * Used as the mask of ::view-transition-new(root), so the new theme soaks in
 * through it. --ink-p runs linearly; --ink-ease ("x1 y1 x2") is the soak
 * curve, evaluated here so the second drop's delay stays in real time.
 *
 * Pure function of its inputs (Chrome runs several worklet scopes and may
 * repaint any frame), so every random choice comes from the seeds.
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
const MIN_STEPS = 180; // polygon resolution around each stain
const MAX_STEPS = 1100;
const LAYERS = 7; // feather layers in the wet fringe
const CLEAR = 0.95; // union of both stains covers the viewport by here
const clamp01 = (v) => Math.max(0, Math.min(1, v));

/** cubic-bezier(x1, y1, x2, 1) evaluated at time u */
function bezier(u, x1, y1, x2) {
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  const bx = (t) => 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
  const by = (t) => 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t + t * t * t;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    if (bx(mid) < u) lo = mid;
    else hi = mid;
  }
  return by((lo + hi) / 2);
}

function makeShape(seed, isDrop) {
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
    tendrils.push({ angle: r() * TAU, width: between(0.05, 0.16), reach: between(0.12, 0.34), lag: between(0, 0.35) });
  }
  // Fine fibre noise per feather layer; outer layers are rougher so the
  // fringe frays instead of stacking in bands
  const fibre = [];
  for (let l = 0; l < LAYERS; l++) {
    const terms = [];
    const rough = 1 + l * 0.6;
    for (let j = 0; j < 5; j++) {
      terms.push({ k: 9 + Math.floor(r() * 48), amp: between(0.003, 0.012) * rough, phase: r() * TAU });
    }
    fibre.push(terms);
  }
  // Pigment granules sitting in the wet edge (polar, relative to the edge)
  const specks = [];
  const nS = 90 + Math.floor(r() * 80);
  for (let i = 0; i < nS; i++) {
    specks.push({ a: r() * TAU, off: between(-0.03, 0.09), size: between(0.5, 2.2), alpha: between(0.15, 0.7) });
  }
  // Satellite drops that bloom just outside the stain and get swallowed
  const drops = [];
  const nD = 2 + Math.floor(r() * 4);
  for (let i = 0; i < nD; i++) {
    drops.push({ a: r() * TAU, dist: between(1.02, 1.2), size: between(0.03, 0.08), at: between(0.2, 0.65) });
  }

  // Landing splash for a falling drop: a small blot that pops in, a few fat
  // beads close by, and fine spray thrown outward (absolute px sizes).
  const splash = [];
  let r0 = 7;
  let weight = 1;
  if (isDrop) {
    r0 = between(16, 30);
    weight = between(0.8, 1);
    const nBeads = 2 + Math.floor(r() * 3);
    for (let i = 0; i < nBeads; i++) {
      splash.push({ a: r() * TAU, dist: between(1.15, 1.8), size: between(3.5, 8), stretch: between(1, 1.5) });
    }
    const nSpray = 10 + Math.floor(r() * 10);
    for (let i = 0; i < nSpray; i++) {
      splash.push({ a: r() * TAU, dist: between(1.7, 4.6), size: between(1.2, 4.2), stretch: between(1.5, 2.8) });
    }
  }

  return { harmonics, tendrils, fibre, specks, drops, splash, r0, weight, wobbleSpeed: between(0.8, 1.6) };
}

function radiusAt(shape, theta, p, layer) {
  let f = 1;
  for (const h of shape.harmonics) {
    f += h.amp * Math.sin(h.k * theta + h.phase + h.drift * p * shape.wobbleSpeed);
  }
  for (const t of shape.tendrils) {
    let d = Math.abs(theta - t.angle) % TAU;
    if (d > Math.PI) d = TAU - d;
    const grow = clamp01((p - t.lag) / (1 - t.lag));
    f += t.reach * grow * Math.exp(-(d * d) / (2 * t.width * t.width)) * (1 - 0.5 * p);
  }
  const terms = shape.fibre[layer] || shape.fibre[0];
  for (const n of terms) f += n.amp * Math.sin(n.k * theta + n.phase + layer);
  return f;
}

/** Soft ease-out-back for the splash pop (0..1, slight overshoot) */
function pop(t) {
  const c = 1.4;
  const x = clamp01(t) - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
}

// Shapes and the coverage scale only depend on seeds + geometry, so cache
// them per worklet scope instead of rebuilding every frame.
const shapeCache = new Map();
function shapeFor(seed, isDrop) {
  const key = seed + (isDrop ? "d" : "t");
  let s = shapeCache.get(key);
  if (!s) {
    if (shapeCache.size > 16) shapeCache.clear();
    s = makeShape(seed, isDrop);
    shapeCache.set(key, s);
  }
  return s;
}

const scaleCache = new Map();
/**
 * Smallest growth scale k such that at t = CLEAR every point of the viewport
 * lies inside at least one of the two stains (checked on a grid, per
 * direction, with a small margin). Whatever the seeds, the union covers the
 * screen by CLEAR; the solid fill after that only hides the last feathering.
 */
function coverScale(stains, w, h, key) {
  let k = scaleCache.get(key);
  if (k) return k;
  const GX = 30;
  const GY = 18;
  k = 0;
  for (let i = 0; i <= GX; i++) {
    for (let j = 0; j <= GY; j++) {
      const qx = (i / GX) * w;
      const qy = (j / GY) * h;
      let need = Infinity;
      for (const s of stains) {
        if (s.pc <= 0) continue;
        const d = Math.hypot(qx - s.x, qy - s.y);
        const f = Math.max(0.35, radiusAt(s.shape, Math.atan2(qy - s.y, qx - s.x), s.pc, 0));
        need = Math.min(need, Math.max(0, d / f - s.shape.r0) / (s.shape.weight * s.pc));
      }
      if (need > k) k = need;
    }
  }
  k = k * 1.08 + 6;
  if (scaleCache.size > 16) scaleCache.clear();
  scaleCache.set(key, k);
  return k;
}

function drawStain(ctx, s, R, p) {
  const { shape, x: cx, y: cy } = s;
  // ~6px edge segments at any size, so the fringe never looks faceted
  const steps = Math.round(Math.min(MAX_STEPS, Math.max(MIN_STEPS, (R * TAU) / 6)));
  for (let l = LAYERS - 1; l >= 0; l--) {
    const spread = 1 + l * (0.008 + 0.015 * (1 - p));
    const alpha = l === 0 ? 1 : 0.28 * Math.pow(1 - l / LAYERS, 1.1);
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
    const sz = R * d.size * Math.min(1, t);
    ctx.fillStyle = `rgba(0,0,0,${0.35 + 0.5 * Math.min(1, t)})`;
    ctx.beginPath();
    ctx.ellipse(x, y, sz * 1.2, sz * 0.8, d.a, 0, TAU);
    ctx.fill();
  }

  // Granulation: specks of pigment caught in the wet edge
  const fade = 1 - clamp01((p - 0.75) / 0.25);
  if (fade > 0) {
    for (const sp of shape.specks) {
      const rr = R * radiusAt(shape, sp.a, p, 1) * (1 + sp.off);
      ctx.fillStyle = `rgba(0,0,0,${sp.alpha * fade})`;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(sp.a) * rr, cy + Math.sin(sp.a) * rr, sp.size * (1 + p), 0, TAU);
      ctx.fill();
    }
  }
}

function drawSplash(ctx, s, t) {
  const { shape, x: cx, y: cy } = s;
  if (!shape.splash.length || t <= 0) return;
  // Spray flies out in the first ~80ms of the drop's life, then sits there
  // until the growing stain swallows it
  const fly = pop(t / 0.045);
  ctx.fillStyle = "#000";
  for (const b of shape.splash) {
    const rr = shape.r0 * (0.6 + (b.dist - 0.6) * fly);
    const x = cx + Math.cos(b.a) * rr;
    const y = cy + Math.sin(b.a) * rr;
    const sz = b.size * Math.min(1, fly);
    ctx.beginPath();
    ctx.ellipse(x, y, sz * b.stretch, sz / Math.sqrt(b.stretch), b.a, 0, TAU);
    ctx.fill();
  }
}

class InkBloom {
  static get inputProperties() {
    return ["--ink-p", "--ink-x", "--ink-y", "--ink-seed", "--ink-x2", "--ink-y2", "--ink-seed2", "--ink-d2", "--ink-ease"];
  }

  paint(ctx, size, props) {
    const t = clamp01(num(props, "--ink-p", 0));
    if (t <= 0) return;
    if (t >= 1) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, size.width, size.height);
      return;
    }
    const w = size.width;
    const h = size.height;
    const easeRaw = props.get("--ink-ease");
    const e = (easeRaw ? easeRaw.toString() : "").trim().split(/\s+/).map(parseFloat);
    const [x1, y1, x2] = e.length === 3 && e.every(Number.isFinite) ? e : [0.34, 0.2, 0.46];
    const d2 = Math.min(0.3, Math.max(0, num(props, "--ink-d2", 0.1)));
    const seed1 = num(props, "--ink-seed", 1);
    const seed2 = num(props, "--ink-seed2", 2);

    const local2 = (u) => clamp01((u - d2) / (1 - d2));
    const stains = [
      { shape: shapeFor(seed1, false), x: num(props, "--ink-x", w - 40), y: num(props, "--ink-y", 40), t, pc: bezier(CLEAR, x1, y1, x2) },
      { shape: shapeFor(seed2, true), x: num(props, "--ink-x2", w * 0.15), y: num(props, "--ink-y2", h * 0.85), t: local2(t), pc: bezier(local2(CLEAR), x1, y1, x2) },
    ];
    const k = coverScale(stains, w, h, [seed1, seed2, w, h, stains[0].x, stains[0].y, stains[1].x, stains[1].y, d2, x1, y1, x2].join());

    for (const s of stains) {
      if (s.t <= 0) continue;
      const p = bezier(s.t, x1, y1, x2);
      // The landing blot pops in at full r0 straight away; growth adds on top
      const R = k * s.shape.weight * p + s.shape.r0 * pop(s.t / 0.05);
      drawStain(ctx, s, R, p);
      drawSplash(ctx, s, s.t);
    }

    // Final soak: whatever is left fills in so the swap never pops
    if (t > CLEAR - 0.02) {
      ctx.fillStyle = `rgba(0,0,0,${clamp01((t - (CLEAR - 0.02)) / (1 - CLEAR + 0.02))})`;
      ctx.fillRect(0, 0, w, h);
    }
  }
}

registerPaint("ink-bloom", InkBloom);
