// Draws the demo cast: eight illustrated GTA-style portraits, each one a
// distinct character drawn from code (skin, hair, clothes, accessories and a
// sunset backdrop). No photo of a real person and no borrowed artwork: every
// pixel comes from these shapes, so the portraits are the app's own work and
// are identical on every run.

/** One cast member: role, name and the look the portrait is drawn from. */
export const DEMO_CAST = [
  { role: 'THE BOSS', name: 'VIC', skin: '#e8b58a', hair: 'slick', hairColor: '#17121c', top: '#1f2430', topStyle: 'suit', accessory: 'shades', extra: 'chain', bg: ['#3b0f66', '#ff5e3a'] },
  { role: 'THE DRIVER', name: 'MARCUS', skin: '#8d5524', hair: 'cap', hairColor: '#c1272d', top: '#c1272d', topStyle: 'jacket', accessory: 'shades', extra: 'none', bg: ['#003b46', '#ff7a18'] },
  { role: 'THE MECHANIC', name: 'DIEGO', skin: '#c98d5f', hair: 'bandana', hairColor: '#ff7a18', top: '#2e4a6b', topStyle: 'overalls', accessory: 'none', extra: 'mustache', bg: ['#ffb347', '#ff2e88'] },
  { role: 'THE CAPTAIN', name: 'CARLOS', skin: '#f2c9a0', hair: 'cap', hairColor: '#f5f0e6', top: '#16233f', topStyle: 'uniform', accessory: 'none', extra: 'beard', bg: ['#1b2a6b', '#7b2ff7'] },
  { role: 'THE RIDER', name: 'ROXY', skin: '#f6d7b0', hair: 'helmet', hairColor: '#ff2e88', top: '#3a0d2e', topStyle: 'leather', accessory: 'visor', extra: 'none', bg: ['#ff2e88', '#5b00c4'] },
  { role: 'THE FIXER', name: 'NINA', skin: '#e8b58a', hair: 'bob', hairColor: '#14101a', top: '#5b2a86', topStyle: 'blazer', accessory: 'glasses', extra: 'earring', bg: ['#5b00c4', '#00b4a2'] },
  { role: 'THE LOOKOUT', name: 'JADE', skin: '#6f4423', hair: 'hood', hairColor: '#0f766e', top: '#0f766e', topStyle: 'hoodie', accessory: 'shades', extra: 'none', bg: ['#0b3d2e', '#ffb347'] },
  { role: 'THE INSIDER', name: 'LUCIA', skin: '#d9a066', hair: 'curly', hairColor: '#241612', top: '#8a5a2b', topStyle: 'blazer', accessory: 'none', extra: 'earring', bg: ['#ff7a18', '#c2185b'] },
];

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amount));
  const b = Math.max(0, Math.min(255, (n & 255) + amount));
  return `rgb(${r},${g},${b})`;
}

function drawSkyline(ctx, w, h, color) {
  ctx.fillStyle = color;
  const base = h * 0.86;
  const blocks = [[0.02, 0.10, 0.16], [0.16, 0.16, 0.12], [0.30, 0.07, 0.20], [0.52, 0.13, 0.13], [0.67, 0.09, 0.18], [0.87, 0.14, 0.11]];
  for (const [x, bh, bw] of blocks) {
    ctx.fillRect(w * x, base - h * bh, w * bw, h * bh + h * 0.14);
  }
  ctx.fillStyle = 'rgba(255, 214, 106, 0.85)';
  for (let i = 0; i < 26; i++) {
    const x = w * (0.03 + ((i * 37) % 94) / 100);
    const y = base - h * (0.02 + ((i * 53) % 13) / 100);
    ctx.fillRect(x, y, 3, 4);
  }
}

function drawHair(ctx, spec, cx, cy, rx, ry) {
  ctx.fillStyle = spec.hairColor;
  const top = cy - ry;
  if (spec.hair === 'slick') {
    ctx.beginPath();
    ctx.ellipse(cx, top + ry * 0.28, rx * 1.02, ry * 0.62, 0, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + rx * 0.35, top + ry * 0.12, rx * 0.55, ry * 0.22, -0.25, Math.PI, 0);
    ctx.fill();
  } else if (spec.hair === 'cap') {
    ctx.beginPath();
    ctx.ellipse(cx, top + ry * 0.42, rx * 1.06, ry * 0.6, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - rx * 1.08, top + ry * 0.32, rx * 2.16, ry * 0.16);
    ctx.beginPath();
    ctx.ellipse(cx, top + ry * 0.42, rx * 1.06, ry * 0.2, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(cx - 2, top - ry * 0.12, 4, ry * 0.5);
  } else if (spec.hair === 'bandana') {
    ctx.beginPath();
    ctx.ellipse(cx, top + ry * 0.4, rx * 1.04, ry * 0.55, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath();
    ctx.arc(cx + rx * 0.95, top + ry * 0.55, rx * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx - rx * 0.95, top + ry * 0.55, rx * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else if (spec.hair === 'helmet') {
    ctx.beginPath();
    ctx.ellipse(cx, top + ry * 0.5, rx * 1.18, ry * 0.95, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(cx - rx * 0.7, top + ry * 0.05, rx * 1.4, ry * 0.1);
  } else if (spec.hair === 'bob') {
    ctx.beginPath();
    ctx.ellipse(cx, top + ry * 0.55, rx * 1.12, ry * 0.95, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - rx * 1.12, top + ry * 0.4, rx * 0.42, ry * 1.15);
    ctx.fillRect(cx + rx * 0.7, top + ry * 0.4, rx * 0.42, ry * 1.15);
  } else if (spec.hair === 'hood') {
    ctx.beginPath();
    ctx.ellipse(cx, top + ry * 0.62, rx * 1.3, ry * 1.1, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = spec.skin;
    ctx.beginPath();
    ctx.ellipse(cx, cy - ry * 0.08, rx * 0.86, ry * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (spec.hair === 'curly') {
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * (1 + i / 8);
      const x = cx + Math.cos(a) * rx * 0.95;
      const y = top + ry * 0.55 + Math.sin(a) * ry * 0.55;
      ctx.beginPath();
      ctx.arc(x, y, rx * 0.34, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.ellipse(cx, top + ry * 0.42, rx * 1.0, ry * 0.55, 0, Math.PI, 0);
    ctx.fill();
  }
}

function drawFace(ctx, spec, cx, cy, rx, ry) {
  const eyeY = cy - ry * 0.08;
  const eyeX = rx * 0.42;
  if (spec.accessory === 'shades' || spec.accessory === 'visor') {
    ctx.fillStyle = '#0d0d12';
    ctx.beginPath();
    ctx.roundRect(cx - eyeX - rx * 0.34, eyeY - ry * 0.16, rx * 0.68, ry * 0.34, ry * 0.12);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(cx + eyeX - rx * 0.34, eyeY - ry * 0.16, rx * 0.68, ry * 0.34, ry * 0.12);
    ctx.fill();
    ctx.fillRect(cx - rx * 0.1, eyeY - ry * 0.04, rx * 0.2, ry * 0.07);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(cx - eyeX - rx * 0.26, eyeY - ry * 0.12, rx * 0.2, ry * 0.08);
    ctx.fillRect(cx + eyeX - rx * 0.26, eyeY - ry * 0.12, rx * 0.2, ry * 0.08);
  } else if (spec.accessory === 'glasses') {
    ctx.strokeStyle = '#14101a';
    ctx.lineWidth = Math.max(2, rx * 0.05);
    ctx.beginPath();
    ctx.arc(cx - eyeX, eyeY, rx * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + eyeX, eyeY, rx * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - eyeX + rx * 0.3, eyeY);
    ctx.lineTo(cx + eyeX - rx * 0.3, eyeY);
    ctx.stroke();
    ctx.fillStyle = '#241a20';
    ellipse(ctx, cx - eyeX, eyeY, rx * 0.05, ry * 0.05);
    ellipse(ctx, cx + eyeX, eyeY, rx * 0.05, ry * 0.05);
  } else {
    ctx.fillStyle = '#241a20';
    ellipse(ctx, cx - eyeX, eyeY, rx * 0.07, ry * 0.07);
    ellipse(ctx, cx + eyeX, eyeY, rx * 0.07, ry * 0.07);
    ctx.strokeStyle = '#241a20';
    ctx.lineWidth = Math.max(2, rx * 0.05);
    ctx.beginPath();
    ctx.moveTo(cx - rx * 0.12, cy + ry * 0.32);
    ctx.quadraticCurveTo(cx, cy + ry * 0.48, cx + rx * 0.12, cy + ry * 0.32);
    ctx.stroke();
  }
  if (spec.accessory !== 'shades' && spec.accessory !== 'visor') {
    ctx.strokeStyle = shade(spec.skin, -70);
    ctx.lineWidth = Math.max(2, rx * 0.04);
    ctx.beginPath();
    ctx.moveTo(cx, cy + ry * 0.12);
    ctx.lineTo(cx - rx * 0.06, cy + ry * 0.3);
    ctx.stroke();
  }
  if (spec.extra === 'mustache') {
    ctx.fillStyle = spec.hairColor === '#ff7a18' ? '#241612' : spec.hairColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + ry * 0.42, rx * 0.34, ry * 0.12, 0, 0, Math.PI);
    ctx.fill();
  }
  if (spec.extra === 'beard') {
    ctx.fillStyle = '#d8d2c4';
    ctx.beginPath();
    ctx.ellipse(cx, cy + ry * 0.55, rx * 0.82, ry * 0.55, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = spec.skin;
    ctx.beginPath();
    ctx.ellipse(cx, cy + ry * 0.42, rx * 0.5, ry * 0.3, 0, 0, Math.PI);
    ctx.fill();
  }
  if (spec.extra === 'earring') {
    ctx.fillStyle = '#ffd23f';
    ellipse(ctx, cx - rx * 0.98, cy + ry * 0.35, rx * 0.07, ry * 0.07);
  }
}

function drawTop(ctx, spec, w, h, cx, neckY) {
  ctx.fillStyle = spec.top;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.16, neckY + h * 0.02);
  ctx.lineTo(cx - w * 0.46, h);
  ctx.lineTo(cx + w * 0.46, h);
  ctx.lineTo(cx + w * 0.16, neckY + h * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.16, neckY + h * 0.02);
  ctx.lineTo(cx - w * 0.30, h);
  ctx.lineTo(cx - w * 0.20, h);
  ctx.lineTo(cx - w * 0.08, neckY + h * 0.02);
  ctx.closePath();
  ctx.fill();
  if (spec.topStyle === 'suit' || spec.topStyle === 'uniform') {
    ctx.fillStyle = '#f5f0e6';
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.05, neckY + h * 0.02);
    ctx.lineTo(cx, neckY + h * 0.12);
    ctx.lineTo(cx + w * 0.05, neckY + h * 0.02);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = spec.topStyle === 'uniform' ? '#ffd23f' : '#c1272d';
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.016, neckY + h * 0.1);
    ctx.lineTo(cx + w * 0.016, neckY + h * 0.1);
    ctx.lineTo(cx + w * 0.03, neckY + h * 0.2);
    ctx.lineTo(cx, neckY + h * 0.26);
    ctx.lineTo(cx - w * 0.03, neckY + h * 0.2);
    ctx.closePath();
    ctx.fill();
  }
  if (spec.topStyle === 'overalls') {
    ctx.fillStyle = '#f2e6c9';
    ctx.fillRect(cx - w * 0.13, neckY + h * 0.03, w * 0.26, h * 0.05);
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(cx - w * 0.13, neckY + h * 0.03, w * 0.05, h * 0.16);
    ctx.fillRect(cx + w * 0.08, neckY + h * 0.03, w * 0.05, h * 0.16);
  }
  if (spec.extra === 'chain') {
    ctx.strokeStyle = '#ffd23f';
    ctx.lineWidth = Math.max(3, w * 0.012);
    ctx.beginPath();
    ctx.arc(cx, neckY + h * 0.01, w * 0.15, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = '#ffd23f';
    ellipse(ctx, cx, neckY + h * 0.01 + w * 0.15, w * 0.02, w * 0.02);
  }
  if (spec.topStyle === 'hoodie') {
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = Math.max(2, w * 0.008);
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.05, neckY + h * 0.04);
    ctx.lineTo(cx - w * 0.05, neckY + h * 0.16);
    ctx.moveTo(cx + w * 0.05, neckY + h * 0.04);
    ctx.lineTo(cx + w * 0.05, neckY + h * 0.16);
    ctx.stroke();
  }
}

/** Draws one cast member's portrait onto `ctx` at the given size. */
export function drawPortrait(ctx, w, h, spec) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, spec.bg[0]);
  sky.addColorStop(1, spec.bg[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(255, 214, 106, 0.9)';
  ellipse(ctx, w * 0.78, h * 0.2, w * 0.13, h * 0.1);
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fillRect(0, h * 0.30, w, h * 0.02);
  ctx.fillRect(0, h * 0.36, w, h * 0.012);
  drawSkyline(ctx, w, h, 'rgba(20, 8, 32, 0.55)');
  const cx = w / 2;
  const cy = h * 0.42;
  const rx = w * 0.21;
  const ry = h * 0.155;
  const neckY = cy + ry * 0.86;
  drawTop(ctx, spec, w, h, cx, neckY);
  ctx.fillStyle = shade(spec.skin, -25);
  ctx.fillRect(cx - rx * 0.28, neckY - ry * 0.18, rx * 0.56, ry * 0.5);
  ctx.fillStyle = spec.skin;
  ellipse(ctx, cx - rx * 0.98, cy + ry * 0.05, rx * 0.14, ry * 0.18);
  ellipse(ctx, cx + rx * 0.98, cy + ry * 0.05, rx * 0.14, ry * 0.18);
  ellipse(ctx, cx, cy, rx, ry);
  drawHair(ctx, spec, cx, cy, rx, ry);
  drawFace(ctx, spec, cx, cy, rx, ry);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = Math.max(2, w * 0.006);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 0.96, ry * 0.96, 0, -Math.PI * 0.75, -Math.PI * 0.15);
  ctx.stroke();
}

/** Returns a fresh canvas holding the portrait for cast member `index`. */
export function makePortraitCanvas(index, w = 360, h = 450) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  drawPortrait(canvas.getContext('2d'), w, h, DEMO_CAST[index]);
  return canvas;
}
