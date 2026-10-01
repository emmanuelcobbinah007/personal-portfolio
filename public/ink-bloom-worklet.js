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
 * Chrome draws this live only as a fallback: normally the same drawing code
 * runs ahead of time in a worker (ink-bloom-frames-worker.js), which bakes
 * the frames into small images that the transition just flips through.
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

  // Landing splash, shared by both drops (the toggle one is smaller):
  // an irregular core that pops in with a squash, clustered tapering streaks
  // with beads at their tips, and detached droplets further out on the rays.
  const sc = isDrop ? 1 : 0.55;
  const r0 = between(15, 25) * sc;
  const weight = isDrop ? between(0.8, 1) : 1;
  const core = {
    wob: [3, 4, 5, 7, 9].map((k) => ({ k, amp: between(0.03, 0.1) / Math.sqrt(k / 3), phase: r() * TAU })),
    squashAxis: r() * TAU,
    popMs: between(60, 100),
  };
  const rays = [];
  const nClusters = 3 + Math.floor(r() * 3);
  const clusterBase = r() * TAU;
  for (let c = 0; c < nClusters; c++) {
    // Clusters spread round the core with uneven gaps between them
    const ca = clusterBase + (c / nClusters) * TAU + between(-0.5, 0.5);
    const n = 1 + Math.floor(r() * 4);
    for (let i = 0; i < n; i++) {
      const len = r0 * between(0.7, 2.6) * (i === 0 ? 1 : between(0.5, 1));
      const base = r0 * between(0.1, 0.22);
      const droplets = [];
      const nDrop = Math.floor(r() * 3.2);
      let dist = 1;
      let size = base * between(0.5, 0.8);
      for (let j = 0; j < nDrop; j++) {
        dist += between(0.18, 0.5);
        size *= between(0.5, 0.8);
        droplets.push({ dist, size: Math.max(0.7, size), wob: r() * TAU });
      }
      rays.push({
        a: ca + between(-0.32, 0.32),
        len,
        base,
        bend: between(-0.18, 0.18),
        bead: base * between(0.55, 1),
        wob: r() * TAU,
        droplets,
        speed: between(0.8, 1.15), // longer streaks can arrive a touch later
      });
    }
  }
  // Crown: many short, fine spikes all round the core rim
  const nCrown = 10 + Math.floor(r() * 12);
  for (let i = 0; i < nCrown; i++) {
    const base = r0 * between(0.05, 0.11);
    rays.push({
      a: r() * TAU,
      len: r0 * between(0.2, 0.65),
      base,
      bend: between(-0.1, 0.1),
      bead: base * between(0.6, 1.1),
      wob: r() * TAU,
      droplets: [],
      speed: between(1.1, 1.5),
    });
  }
  // A few loose flecks off-ray
  const flecks = [];
  const nF = 5 + Math.floor(r() * 8);
  for (let i = 0; i < nF; i++) {
    flecks.push({ a: r() * TAU, dist: between(1.6, 3.8), size: between(0.7, 2) * sc, wob: r() * TAU });
  }
  const shootMs = between(80, 140);
  const holdMs = between(50, 110);

  return {
    harmonics,
    tendrils,
    fibre,
    specks,
    drops,
    core,
    rays,
    flecks,
    r0,
    weight,
    shootMs,
    holdMs,
    wobbleSpeed: between(0.8, 1.6),
  };
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

const easeOut = (t) => 1 - Math.pow(1 - clamp01(t), 3);

/** Small wobbly blot (never a perfect oval), feathered with a faint halo */
function blot(ctx, x, y, r, rot, stretch, wob, alpha) {
  if (r < 0.3) return;
  for (let pass = 0; pass < 2; pass++) {
    const rr = pass === 0 ? r * 1.35 + 0.8 : r;
    ctx.fillStyle = `rgba(0,0,0,${pass === 0 ? alpha * 0.28 : alpha})`;
    ctx.beginPath();
    const n = 14;
    for (let i = 0; i <= n; i++) {
      const th = (i / n) * TAU;
      const f = 1 + 0.16 * Math.sin(3 * th + wob) + 0.09 * Math.sin(5 * th + wob * 2.3);
      const lx = Math.cos(th) * rr * f * stretch;
      const ly = Math.sin(th) * rr * f / Math.sqrt(stretch);
      const px = x + lx * Math.cos(rot) - ly * Math.sin(rot);
      const py = y + lx * Math.sin(rot) + ly * Math.cos(rot);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
}

/**
 * The impact: core blot, streaks, beads and droplets. `ms` is time since the
 * drop landed. Everything stays put after the spray settles; the growing
 * stain (feathered edge) absorbs it gradually as it passes.
 */
function drawSplash(ctx, s, ms) {
  const { shape, x: cx, y: cy } = s;
  if (ms <= 0) return;
  const r0 = shape.r0;

  // Core: pops in with a damped squash along a random axis, then soaks a bit
  const c = shape.core;
  const k = ms / c.popMs;
  const grow = pop(k) * (1 + 0.12 * clamp01((ms - c.popMs) / 400));
  const sq = 0.28 * Math.cos(Math.PI * k) * Math.exp(-k * 1.3);
  const sx = 1 + sq;
  const sy = 1 - sq * 0.7;
  const ca = Math.cos(c.squashAxis);
  const sa = Math.sin(c.squashAxis);
  for (let pass = 0; pass < 3; pass++) {
    const spread = [1.12, 1.05, 1][pass];
    ctx.fillStyle = `rgba(0,0,0,${[0.18, 0.35, 1][pass]})`;
    ctx.beginPath();
    const n = 72;
    for (let i = 0; i <= n; i++) {
      const th = (i / n) * TAU;
      let f = 1;
      for (const w of c.wob) f += w.amp * Math.sin(w.k * th + w.phase + pass * 0.7);
      const rr = r0 * grow * f * spread;
      const lx = Math.cos(th) * rr * sx;
      const ly = Math.sin(th) * rr * sy;
      const px = cx + lx * ca - ly * sa;
      const py = cy + lx * sa + ly * ca;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Crown: tapering streaks shot out from the core edge
  const shoot = ms / shape.shootMs;
  if (shoot <= 0) return;
  for (const ray of shape.rays) {
    const e = easeOut(shoot * ray.speed);
    if (e <= 0) continue;
    const ux = Math.cos(ray.a);
    const uy = Math.sin(ray.a);
    const start = r0 * 0.55;
    const len = ray.len * e;
    const at = (t) => {
      const ang = ray.a + ray.bend * t * t;
      const d = start + (r0 * 0.45 + len) * t;
      return [cx + Math.cos(ang) * d, cy + Math.sin(ang) * d, ang];
    };
    const segs = 12;
    for (let pass = 0; pass < 2; pass++) {
      const wmul = pass === 0 ? 1.45 : 1;
      ctx.fillStyle = `rgba(0,0,0,${pass === 0 ? 0.22 : 1})`;
      ctx.beginPath();
      const left = [];
      const right = [];
      for (let i = 0; i <= segs; i++) {
        const t = i / segs;
        const [px, py, ang] = at(t);
        // thick at the base, thin at the tip, with a slight pinch before the bead
        const wdt = (ray.base * Math.pow(1 - t, 1.15) + ray.base * 0.1) * wmul * (0.9 + 0.1 * Math.sin(t * 9 + ray.wob));
        const nx = -Math.sin(ang);
        const ny = Math.cos(ang);
        left.push([px + nx * wdt, py + ny * wdt]);
        right.push([px - nx * wdt, py - ny * wdt]);
      }
      left.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
      ctx.closePath();
      ctx.fill();
    }
    const [tx, ty] = at(1);
    blot(ctx, tx, ty, ray.bead * Math.min(1, e * 1.4), ray.a, 1.15, ray.wob, 1);
    // Detached droplets further out along the same ray, shrinking
    for (const d of ray.droplets) {
      const dd = (start + r0 * 0.45 + ray.len) * (1 + (d.dist - 1) * 1.1) * e;
      blot(ctx, cx + ux * dd, cy + uy * dd, d.size * Math.min(1, e * 1.2), ray.a, 1.3, d.wob, 1);
    }
  }
  for (const f of shape.flecks) {
    const e = easeOut(shoot * 0.9);
    const dd = r0 * f.dist * e;
    blot(ctx, cx + Math.cos(f.a) * dd, cy + Math.sin(f.a) * dd, f.size * Math.min(1, e * 1.5), f.a, 1.2, f.wob, 0.9);
  }
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
        need = Math.min(need, Math.max(0, d / f - s.shape.r0 * 0.8) / (s.shape.weight * s.pc));
      }
      if (need > k) k = need;
    }
  }
  k = k * 1.08 + 6;
  if (scaleCache.size > 16) scaleCache.clear();
  scaleCache.set(key, k);
  return k;
}

function drawStain(ctx, s, R, p, bleedPhase) {
  const { shape, x: cx, y: cy } = s;
  // ~6px edge segments at any size, so the fringe never looks faceted
  const steps = Math.round(Math.min(MAX_STEPS, Math.max(MIN_STEPS, (R * TAU) / 6)));
  // Early on the stain wicks outward along the splash streaks first, so it
  // takes them over from the base out rather than as a round blob
  let bleed = null;
  // (fades out once the stain is big enough that it no longer matters)
  bleedPhase *= clamp01(1 - (R - 300) / 300);
  if (bleedPhase > 0 && shape.rays.length) {
    bleed = new Float32Array(steps + 1);
    for (const ray of shape.rays) {
      const reach = (shape.r0 * 0.45 + ray.len) * 0.9 * bleedPhase;
      const sigma = Math.max(0.05, (ray.base * 1.8) / (shape.r0 + ray.len));
      for (let i = 0; i <= steps; i++) {
        let d = Math.abs((i / steps) * TAU - ray.a) % TAU;
        if (d > Math.PI) d = TAU - d;
        if (d < sigma * 4) bleed[i] += reach * Math.exp(-(d * d) / (2 * sigma * sigma));
      }
    }
  }
  for (let l = LAYERS - 1; l >= 0; l--) {
    const spread = 1 + l * (0.008 + 0.015 * (1 - p));
    const alpha = l === 0 ? 1 : 0.28 * Math.pow(1 - l / LAYERS, 1.1);
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const th = (i / steps) * TAU;
      const rr = (R * radiusAt(shape, th, p, l) + (bleed ? bleed[i] : 0)) * spread;
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
    blot(ctx, x, y, sz, d.a, 1.3, d.a * 3.1, 0.35 + 0.5 * Math.min(1, t));
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

/**
 * Everything one bloom needs that does not change frame to frame: the two
 * stains (shape, landing point, landing time), the soak curve and the growth
 * scale. `get(name, fallback)` reads a numeric input; `ease` is "x1 y1 x2".
 * Shared by the paint worklet below and the frame renderer worker
 * (ink-bloom-frames-worker.js), so both draw exactly the same ink.
 */
function bloomSetup(get, easeRaw, w, h) {
  const e = (easeRaw || "").trim().split(/\s+/).map(parseFloat);
  const [x1, y1, x2] = e.length === 3 && e.every(Number.isFinite) ? e : [0.34, 0.2, 0.46];
  const d2 = Math.min(0.3, Math.max(0, get("--ink-d2", 0.1)));
  const seed1 = get("--ink-seed", 1);
  const seed2 = get("--ink-seed2", 2);
  const dur = Math.max(600, get("--ink-dur", 2000));
  const B = { w, h, dur, x1, y1, x2, k: 0, stains: null };
  B.stains = [
    { shape: shapeFor(seed1, false), x: get("--ink-x", w - 40), y: get("--ink-y", 40), land: 0 },
    { shape: shapeFor(seed2, true), x: get("--ink-x2", w * 0.15), y: get("--ink-y2", h * 0.85), land: d2 * dur },
  ];
  for (const s of B.stains) s.pc = bezier(growthAt(B, s, CLEAR * dur), x1, y1, x2);
  B.k = coverScale(B.stains, w, h, [seed1, seed2, w, h, B.stains[0].x, B.stains[0].y, B.stains[1].x, B.stains[1].y, d2, dur, x1, y1, x2].join());
  return B;
}

// Each drop: lands at `land` ms, splashes, holds, then its stain grows over
// the rest of the run. Growth time `tg` drives the soak curve.
function growthAt(B, s, ms) {
  const start = s.shape.shootMs + s.shape.holdMs;
  return clamp01((ms - s.land - start) / (B.dur - s.land - start));
}

/** One drop (stain + splash) at run progress t (0..1, linear time). */
function drawDrop(ctx, B, s, t) {
  const ms = t * B.dur;
  const since = ms - s.land;
  if (since <= 0) return;
  const tg = growthAt(B, s, ms);
  if (tg > 0) {
    // Soft start: the stain seeps out of the core slowly for the first
    // ~quarter of its growth, so it eats the streaks and droplets one by one
    // instead of swallowing the splash whole. Coverage is unaffected
    // (the ramp is done long before CLEAR).
    const seep = Math.pow(clamp01(tg / 0.26), 1.8);
    const p = bezier(tg, B.x1, B.y1, B.x2) * (0.12 + 0.88 * seep);
    const R = B.k * s.shape.weight * p + s.shape.r0 * 0.8 * clamp01(tg * 8);
    drawStain(ctx, s, R, p, clamp01(tg / 0.24));
  }
  drawSplash(ctx, s, since);
}

/** Final soak: whatever is left fills in so the swap never pops. */
function soakAlpha(t) {
  return t > CLEAR - 0.02 ? clamp01((t - (CLEAR - 0.02)) / (1 - CLEAR + 0.02)) : 0;
}

class InkBloom {
  static get inputProperties() {
    return ["--ink-p", "--ink-x", "--ink-y", "--ink-seed", "--ink-x2", "--ink-y2", "--ink-seed2", "--ink-d2", "--ink-ease", "--ink-dur"];
  }

  paint(ctx, size, props) {
    const t = clamp01(num(props, "--ink-p", 0));
    if (t <= 0) return;
    if (t >= 1) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, size.width, size.height);
      return;
    }
    const easeRaw = props.get("--ink-ease");
    const B = bloomSetup((n, f) => num(props, n, f), easeRaw ? easeRaw.toString() : "", size.width, size.height);
    for (const s of B.stains) drawDrop(ctx, B, s, t);
    const a = soakAlpha(t);
    if (a > 0) {
      ctx.fillStyle = `rgba(0,0,0,${a})`;
      ctx.fillRect(0, 0, size.width, size.height);
    }
  }
}

// Also loaded with importScripts() by the frame renderer worker, where there
// is no registerPaint.
if (typeof registerPaint === "function") registerPaint("ink-bloom", InkBloom);
