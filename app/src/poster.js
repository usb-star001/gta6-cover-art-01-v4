// Renders the poster: the photo panels, the giant striped title, the neon
// script subtitle, the tagline ribbon, the top bar, the billing block, the
// seal and the barcode. Everything is drawn with canvas shapes and text, so
// the same state always produces the same pixels.

export const GRADES = {
  sunset: { name: 'Sunset Gold', sky: ['#2a0e4a', '#c2185b', '#ff7a18'], sun: '#ffd76a', stripes: ['#ff2e88', '#ff7a18', '#ffd23f'], ribbon: '#ff2e88', ribbonText: '#ffffff', seal: '#ffd23f', sealText: '#7a3b00', titleEdge: '#1a0b2e', subtitle: '#ffe9a8', tint: 'rgba(255, 94, 58, 0.10)' },
  neon: { name: 'Neon Night', sky: ['#0b0033', '#3b0f66', '#ff2e88'], sun: '#00f0ff', stripes: ['#00f0ff', '#a100ff', '#ff2e88'], ribbon: '#00f0ff', ribbonText: '#0b0033', seal: '#00f0ff', sealText: '#00333d', titleEdge: '#0b0033', subtitle: '#aef7ff', tint: 'rgba(0, 240, 255, 0.08)' },
  tropic: { name: 'Tropic Teal', sky: ['#003b46', '#00796b', '#ffd23f'], sun: '#fff3b0', stripes: ['#00e5a0', '#ffd23f', '#ff7a18'], ribbon: '#00b4a2', ribbonText: '#ffffff', seal: '#ffd23f', sealText: '#1d4a00', titleEdge: '#00312e', subtitle: '#d8fff4', tint: 'rgba(0, 180, 162, 0.10)' },
  ultra: { name: 'Ultraviolet', sky: ['#12002e', '#5b00c4', '#ff00a8'], sun: '#e0aaff', stripes: ['#b517ff', '#ff00a8', '#ffffff'], ribbon: '#b517ff', ribbonText: '#ffffff', seal: '#e0aaff', sealText: '#3d0066', titleEdge: '#12002e', subtitle: '#f3d9ff', tint: 'rgba(181, 23, 255, 0.10)' },
  retro: { name: 'Retro Print', sky: ['#f4e3c2', '#ff9e5e', '#d94f30'], sun: '#ff5e3a', stripes: ['#d94f30', '#ff7a18', '#7a2e0e'], ribbon: '#d94f30', ribbonText: '#ffe9c9', seal: '#ffd23f', sealText: '#5b2a00', titleEdge: '#3d1408', subtitle: '#7a2e0e', tint: 'rgba(217, 79, 48, 0.08)' },
};

export const LAYOUTS = {
  mosaic: { name: 'Cast Mosaic' },
  strips: { name: 'Diagonal Strips' },
  grid: { name: 'Six Grid' },
  stack: { name: 'Vertical Stack' },
};

export const RATIOS = {
  '1:1': { name: '1:1 Square', w: 1080, h: 1080, label: '1080 x 1080' },
  '4:5': { name: '4:5 Portrait', w: 1080, h: 1350, label: '1080 x 1350' },
  '16:9': { name: '16:9 Wide', w: 1920, h: 1080, label: '1920 x 1080' },
};

function fitFont(ctx, text, maxWidth, startSize, family, weight = '900') {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && size > 10) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

function drawStar(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawPalm(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.06;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.1, y - s * 0.55, x + s * 0.3, y - s * 0.8);
  ctx.stroke();
  ctx.lineWidth = s * 0.045;
  for (let i = 0; i < 6; i++) {
    const a = Math.PI * (0.95 + i * 0.16);
    ctx.beginPath();
    ctx.moveTo(x + s * 0.3, y - s * 0.8);
    ctx.quadraticCurveTo(
      x + s * 0.3 + Math.cos(a) * s * 0.45,
      y - s * 0.8 + Math.sin(a) * s * 0.3,
      x + s * 0.3 + Math.cos(a) * s * 0.62,
      y - s * 0.8 + Math.sin(a) * s * 0.55,
    );
    ctx.stroke();
  }
}

function drawPanelImage(ctx, slot, x, y, w, h) {
  const img = slot.image;
  if (!img) {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#3b2a55');
    g.addColorStop(1, '#1c1030');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = Math.max(2, w * 0.012);
    ctx.setLineDash([w * 0.06, w * 0.04]);
    ctx.strokeRect(x + w * 0.06, y + h * 0.06, w * 0.88, h * 0.88);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = `700 ${Math.max(14, w * 0.09)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('+ ADD PHOTO', x + w / 2, y + h / 2);
    return;
  }
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const base = Math.max(w / iw, h / ih) * (slot.zoom || 1);
  const pw = iw * base;
  const ph = ih * base;
  const px = x + (w - pw) / 2 + (slot.panX || 0) * w;
  const py = y + (h - ph) / 2 + (slot.panY || 0) * h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (slot.flip) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(img, px - x, py, pw, ph);
  } else {
    ctx.drawImage(img, px, py, pw, ph);
  }
  ctx.restore();
}

function panelRects(layout, W, H) {
  const u = (x, y, w, h) => ({ x: x * W, y: y * H, w: w * W, h: h * H });
  if (layout === 'mosaic') {
    // Two panel bands with a clear title band between them (the winning
    // posters' layout): the title, subtitle and ribbon cross no role label.
    return [
      u(0.02, 0.09, 0.225, 0.26), u(0.255, 0.09, 0.225, 0.26),
      u(0.49, 0.09, 0.225, 0.26), u(0.725, 0.09, 0.225, 0.26),
      u(0.02, 0.66, 0.225, 0.18), u(0.255, 0.66, 0.225, 0.18),
      u(0.49, 0.66, 0.225, 0.18), u(0.725, 0.66, 0.225, 0.18),
    ];
  }
  if (layout === 'grid') {
    return [
      u(0.02, 0.09, 0.315, 0.24), u(0.345, 0.09, 0.31, 0.24), u(0.67, 0.09, 0.31, 0.24),
      u(0.02, 0.35, 0.315, 0.24), u(0.345, 0.35, 0.31, 0.24), u(0.67, 0.35, 0.31, 0.24),
      u(0.02, 0.61, 0.48, 0.19), u(0.51, 0.61, 0.47, 0.19),
    ];
  }
  if (layout === 'stack') {
    const rects = [];
    for (let c = 0; c < 2; c++) {
      for (let r = 0; r < 4; r++) {
        rects.push(u(0.02 + c * 0.495, 0.09 + r * 0.18, 0.475, 0.17));
      }
    }
    return rects;
  }
  const rects = [];
  for (let i = 0; i < 8; i++) {
    rects.push(u(0.015 + i * 0.1225, i % 2 === 0 ? 0.09 : 0.13, 0.1125, 0.67));
  }
  return rects;
}

function drawRoleLabel(ctx, slot, rect, W) {
  const fs = Math.max(11, rect.w * 0.105);
  ctx.save();
  ctx.translate(rect.x + rect.w * 0.06, rect.y + rect.h - fs * 1.1);
  ctx.rotate(-0.06);
  ctx.font = `800 ${fs}px system-ui, sans-serif`;
  const label = slot.role || 'CREW';
  const tw = ctx.measureText(label).width;
  ctx.fillStyle = 'rgba(10, 4, 24, 0.92)';
  ctx.fillRect(-fs * 0.35, -fs * 1.05, tw + fs * 0.7, fs * 1.5);
  ctx.fillStyle = '#ffd23f';
  ctx.fillRect(-fs * 0.35, -fs * 1.05, fs * 0.16, fs * 1.5);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, -fs * 0.1, -fs * 0.28);
  ctx.restore();
}

function drawStripedTitle(ctx, text, W, y, grade, style) {
  const maxW = W * 0.96;
  const family = `'Arial Black', 'Helvetica Neue', Impact, system-ui, sans-serif`;
  let size = W * 0.115;
  ctx.font = `900 ${size}px ${family}`;
  while (ctx.measureText(text).width > maxW && size > 20) {
    size -= 4;
    ctx.font = `900 ${size}px ${family}`;
  }
  const cx = W / 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  const depth = size * 0.09;
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = size * 0.16;
  ctx.shadowOffsetY = size * 0.05;
  ctx.strokeStyle = grade.titleEdge;
  ctx.lineWidth = size * 0.16;
  for (let d = 3; d >= 1; d--) {
    ctx.strokeText(text, cx + depth * d * 0.4, y + depth * d * 0.4);
  }
  ctx.strokeText(text, cx, y);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  if (style === 'outline') {
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillText(text, cx, y);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = size * 0.03;
    ctx.strokeText(text, cx, y);
  } else if (style === 'neon') {
    ctx.shadowColor = grade.stripes[0];
    ctx.shadowBlur = size * 0.22;
    ctx.fillStyle = grade.stripes[0];
    ctx.fillText(text, cx, y);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, cx, y - size * 0.05);
    ctx.globalAlpha = 1;
  } else {
    const band = ctx.createLinearGradient(0, y - size * 0.5, 0, y + size * 0.5);
    band.addColorStop(0, grade.stripes[0]);
    band.addColorStop(0.34, grade.stripes[0]);
    band.addColorStop(0.34, grade.stripes[1]);
    band.addColorStop(0.67, grade.stripes[1]);
    band.addColorStop(0.67, grade.stripes[2]);
    band.addColorStop(1, grade.stripes[2]);
    ctx.fillStyle = band;
    ctx.fillText(text, cx, y);
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fillRect(cx - ctx.measureText(text).width / 2, y - size * 0.42, ctx.measureText(text).width, size * 0.1);
  }
  return size;
}

function drawBarcode(ctx, x, y, w, h) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - w * 0.05, y - h * 0.12, w * 1.1, h * 1.24);
  ctx.fillStyle = '#111111';
  const digits = '8902102026';
  let bx = x;
  for (let i = 0; i < digits.length; i++) {
    const d = Number(digits[i]);
    const bw = w * (0.02 + (d % 4) * 0.018);
    ctx.fillRect(bx, y, bw, h);
    bx += bw + w * 0.028;
  }
  ctx.fillStyle = '#111111';
  ctx.font = `700 ${h * 0.22}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('8 90210 2026', x + w / 2, y + h * 1.12);
}

function drawSeal(ctx, x, y, r, grade, text) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.18);
  ctx.fillStyle = grade.seal;
  ctx.beginPath();
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI * 2) / 24;
    const rr = i % 2 === 0 ? r : r * 0.88;
    const px = Math.cos(a) * rr;
    const py = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = grade.sealText;
  ctx.lineWidth = Math.max(2, r * 0.05);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = grade.sealText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  drawStar(ctx, 0, -r * 0.42, r * 0.16, grade.sealText);
  const fs = fitFont(ctx, text, r * 1.35, r * 0.34, `system-ui, sans-serif`, '900');
  ctx.font = `900 ${fs}px system-ui, sans-serif`;
  const words = text.split(' ');
  if (words.length > 1 && ctx.measureText(text).width > r * 1.35) {
    ctx.fillText(words[0], 0, -fs * 0.55);
    ctx.fillText(words.slice(1).join(' '), 0, fs * 0.55);
  } else {
    ctx.fillText(text, 0, 0);
  }
  ctx.restore();
}

/** Draws the full poster for `state` onto `canvas` (sized by the caller). */
export function renderPoster(canvas, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const grade = GRADES[state.grade] || GRADES.sunset;
  const ratio = state.ratio || '4:5';
  const tall = ratio !== '16:9';

  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(0.55, grade.sky[1]);
  sky.addColorStop(1, grade.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = grade.sun;
  ctx.beginPath();
  ctx.arc(W * 0.5, H * 0.47, W * 0.085, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.beginPath();
  ctx.arc(W * 0.5, H * 0.47, W * 0.115, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = grade.sun;
  ctx.beginPath();
  ctx.arc(W * 0.5, H * 0.47, W * 0.085, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(16, 6, 30, 0.5)';
  const base = H * 0.86;
  const blocks = [[0, 0.09, 0.11], [0.12, 0.15, 0.09], [0.23, 0.07, 0.14], [0.39, 0.12, 0.10], [0.51, 0.08, 0.13], [0.66, 0.14, 0.09], [0.77, 0.09, 0.12], [0.90, 0.12, 0.10]];
  for (const [x, bh, bw] of blocks) ctx.fillRect(W * x, base - H * bh, W * bw, H * bh + H * 0.14);
  drawPalm(ctx, W * 0.03, H * 0.10, W * 0.05, 'rgba(16, 6, 30, 0.6)');
  drawPalm(ctx, W * 0.95, H * 0.10, W * 0.045, 'rgba(16, 6, 30, 0.6)');

  const rects = panelRects(state.layout, W, H);
  state.slots.forEach((slot, i) => {
    const r = rects[i];
    if (!r) return;
    ctx.save();
    if (state.layout === 'strips') {
      ctx.beginPath();
      ctx.moveTo(r.x, r.y + r.w * 0.35);
      ctx.lineTo(r.x + r.w, r.y);
      ctx.lineTo(r.x + r.w, r.y + r.h - r.w * 0.35);
      ctx.lineTo(r.x, r.y + r.h);
      ctx.closePath();
      ctx.clip();
      drawPanelImage(ctx, slot, r.x, r.y, r.w, r.h);
    } else {
      drawPanelImage(ctx, slot, r.x, r.y, r.w, r.h);
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = Math.max(2, W * 0.0025);
    if (state.layout === 'strips') {
      ctx.beginPath();
      ctx.moveTo(r.x, r.y + r.w * 0.35);
      ctx.lineTo(r.x + r.w, r.y);
      ctx.lineTo(r.x + r.w, r.y + r.h - r.w * 0.35);
      ctx.lineTo(r.x, r.y + r.h);
      ctx.closePath();
      ctx.stroke();
    } else {
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    }
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = W * 0.008;
    ctx.shadowOffsetY = W * 0.004;
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    drawRoleLabel(ctx, slot, r, W);
  });

  const titleY = H * 0.50;
  const titleSize = drawStripedTitle(ctx, (state.title || 'NEON VERDICT').toUpperCase(), W, titleY, grade, state.titleStyle || 'stripes');

  const subStyle = state.subtitleStyle || 'script';
  const subFamily = subStyle === 'type'
    ? `'Courier New', ui-monospace, monospace`
    : subStyle === 'bold' ? `system-ui, sans-serif` : `'Brush Script MT', 'Segoe Script', cursive`;
  const subWeight = subStyle === 'type' ? '700' : subStyle === 'bold' ? 'italic 800' : 'italic 700';
  const subSize = fitFont(ctx, state.subtitle || '', W * 0.86, W * 0.042, subFamily, subWeight);
  ctx.font = `${subWeight} ${subSize}px ${subFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = grade.subtitle;
  ctx.shadowColor = grade.stripes[0];
  ctx.shadowBlur = W * 0.012;
  ctx.fillText(state.subtitle || '', W / 2, titleY + titleSize * 0.58);
  ctx.shadowBlur = 0;

  const ribbonY = titleY + titleSize * 0.98;
  ctx.save();
  ctx.translate(W / 2, ribbonY);
  ctx.rotate(-0.02);
  ctx.fillStyle = grade.ribbon;
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = W * 0.01;
  ctx.shadowOffsetY = W * 0.005;
  ctx.fillRect(-W * 0.52, -H * 0.016, W * 1.04, H * 0.032);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  const tagSize = fitFont(ctx, state.tagline || '', W * 0.96, W * 0.028, `system-ui, sans-serif`, '800');
  ctx.font = `800 ${tagSize}px system-ui, sans-serif`;
  ctx.fillStyle = grade.ribbonText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.tagline || '', 0, 0);
  ctx.restore();

  const barY = H * 0.028;
  ctx.textBaseline = 'middle';
  for (let i = 0; i < 5; i++) drawStar(ctx, W * (0.035 + i * 0.028), barY + H * 0.012, W * 0.011, '#ffd23f');
  const quoteLine = `"${state.quote || ''}" — ${state.quoteSource || ''}`;
  const quoteSize = fitFont(ctx, quoteLine, W * 0.58, W * 0.02, `system-ui, sans-serif`, '800');
  ctx.font = `800 ${quoteSize}px system-ui, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(quoteLine, W * 0.5, barY + H * 0.014);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(2, W * 0.002);
  const edW = W * 0.075;
  const edH = H * 0.032;
  ctx.strokeRect(W - edW - W * 0.02, barY - edH * 0.2, edW, edH);
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${edH * 0.52}px system-ui, sans-serif`;
  ctx.fillText(state.edition || 'VOL. 1', W - edW / 2 - W * 0.02, barY + H * 0.012);

  const relSize = fitFont(ctx, state.release || 'COMING SOON', W * 0.5, W * 0.032, `system-ui, sans-serif`, '900');
  ctx.font = `900 ${relSize}px system-ui, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(state.release || 'COMING SOON', W / 2, H * 0.88);
  const billSize = fitFont(ctx, state.billing || '', W * 0.82, W * 0.014, `system-ui, sans-serif`, '600');
  ctx.font = `600 ${billSize}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(state.billing || '', W / 2, H * (tall ? 0.925 : 0.925));
  ctx.font = `600 ${billSize * 0.85}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('PHOTOS NEVER LEAVE THIS DEVICE  ·  MADE WITH LEONIDA NIGHTS COVER STUDIO', W / 2, H * 0.955);

  drawSeal(ctx, W * 0.085, H * (tall ? 0.845 : 0.82), Math.min(W, H) * 0.042, grade, state.seal || 'BEST CAST');
  drawBarcode(ctx, W * 0.885, H * (tall ? 0.925 : 0.92), W * 0.085, H * 0.018);

  ctx.fillStyle = grade.tint;
  ctx.fillRect(0, 0, W, H);
}
