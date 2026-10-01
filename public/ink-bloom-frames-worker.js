/**
 * Bakes an ink bloom into frames, off the main thread and ahead of the click.
 *
 * It runs the paint worklet's own drawing code (importScripts below), once
 * per frame and per drop, and hands back one small PNG per drop per frame,
 * cropped to the ink it holds. The transition then only flips mask images,
 * which is cheap, instead of repainting a full-screen worklet mask on every
 * frame.
 *
 * Resolution is per image: while a drop is small (the splash and the first
 * seep) it is drawn at full device resolution; as the stain grows the pixel
 * count is capped, which is invisible on a soft, wide ink edge.
 */
importScripts("/ink-bloom-worklet.js");

/** Records the few canvas calls the ink code uses, and their bounds. */
class Recorder {
  constructor() {
    this.ops = [];
    this.styles = [];
    this.minX = Infinity;
    this.minY = Infinity;
    this.maxX = -Infinity;
    this.maxY = -Infinity;
  }
  ext(x, y, r) {
    if (x - r < this.minX) this.minX = x - r;
    if (y - r < this.minY) this.minY = y - r;
    if (x + r > this.maxX) this.maxX = x + r;
    if (y + r > this.maxY) this.maxY = y + r;
  }
  set fillStyle(v) {
    this.styles.push(v);
    this.ops.push(0, this.styles.length - 1);
  }
  get fillStyle() {
    return this.styles[this.styles.length - 1];
  }
  beginPath() {
    this.ops.push(1);
  }
  moveTo(x, y) {
    this.ops.push(2, x, y);
    this.ext(x, y, 0);
  }
  lineTo(x, y) {
    this.ops.push(3, x, y);
    this.ext(x, y, 0);
  }
  closePath() {
    this.ops.push(4);
  }
  fill() {
    this.ops.push(5);
  }
  arc(x, y, r, a0, a1) {
    this.ops.push(6, x, y, r, a0, a1);
    this.ext(x, y, r);
  }
  fillRect(x, y, w, h) {
    this.ops.push(7, x, y, w, h);
    this.ext(x, y, 0);
    this.ext(x + w, y + h, 0);
  }
  replay(ctx) {
    const o = this.ops;
    for (let i = 0; i < o.length; ) {
      switch (o[i]) {
        case 0: ctx.fillStyle = this.styles[o[i + 1]]; i += 2; break;
        case 1: ctx.beginPath(); i += 1; break;
        case 2: ctx.moveTo(o[i + 1], o[i + 2]); i += 3; break;
        case 3: ctx.lineTo(o[i + 1], o[i + 2]); i += 3; break;
        case 4: ctx.closePath(); i += 1; break;
        case 5: ctx.fill(); i += 1; break;
        case 6: ctx.arc(o[i + 1], o[i + 2], o[i + 3], o[i + 4], o[i + 5]); i += 6; break;
        case 7: ctx.fillRect(o[i + 1], o[i + 2], o[i + 3], o[i + 4]); i += 5; break;
        default: return;
      }
    }
  }
}

self.onmessage = async (ev) => {
  const { id, params, w, h, dpr, frames, budget, margin } = ev.data;
  try {
    const get = (name, fallback) => {
      const n = parseFloat(params[name]);
      return Number.isFinite(n) ? n : fallback;
    };
    const B = bloomSetup(get, params["--ink-ease"] || "", w, h);
    const out = [];
    for (let i = 0; i < frames; i++) {
      const t = i / (frames - 1);
      const layers = [];
      for (const s of B.stains) {
        const rec = new Recorder();
        if (t > 0 && t < 1) drawDrop(rec, B, s, t);
        // Crop to the ink, padded for anti-aliasing, and to the viewport plus
        // a margin (so a slightly moved toggle can still be offset into place)
        const x0 = Math.max(-margin, Math.floor(rec.minX - 2));
        const y0 = Math.max(-margin, Math.floor(rec.minY - 2));
        const x1 = Math.min(w + margin, Math.ceil(rec.maxX + 2));
        const y1 = Math.min(h + margin, Math.ceil(rec.maxY + 2));
        if (!rec.ops.length || x1 <= x0 || y1 <= y0) {
          layers.push(null);
          continue;
        }
        const bw = x1 - x0;
        const bh = y1 - y0;
        const scale = Math.min(dpr, Math.sqrt(budget / (bw * bh)));
        const cw = Math.max(1, Math.round(bw * scale));
        const ch = Math.max(1, Math.round(bh * scale));
        const canvas = new OffscreenCanvas(cw, ch);
        // A plain CPU canvas: far quicker than a GPU one for many small
        // fills that are read straight back out as a PNG
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.setTransform(cw / bw, 0, 0, ch / bh, -x0 * (cw / bw), -y0 * (ch / bh));
        rec.replay(ctx);
        const blob = await canvas.convertToBlob({ type: "image/png" });
        layers.push({ blob, x: x0, y: y0, w: bw, h: bh });
      }
      out.push({ layers, soak: soakAlpha(t) });
    }
    self.postMessage({ id, frames: out });
  } catch (err) {
    self.postMessage({ id, error: String(err && err.message ? err.message : err) });
  }
};
