// Wires the studio: the 3-step flow (add photos, caption, export), the 8
// cast slots, the live preview and the PNG export. Photos are read on the
// device and never leave it; the demo cast is drawn by portraits.js.

import { renderPoster, GRADES, LAYOUTS, RATIOS } from './poster.js';
import { DEMO_CAST, makePortraitCanvas } from './portraits.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const preview = $('preview');
const statusEl = $('status');
const slotGrid = $('slotGrid');

const DEFAULT_STATE = () => ({
  layout: 'mosaic',
  grade: 'sunset',
  ratio: '4:5',
  title: 'NEON VERDICT',
  titleStyle: 'stripes',
  subtitle: 'Every Sunset Has a Price',
  subtitleStyle: 'script',
  tagline: 'EIGHT CREW · ONE COAST · NO WAY BACK',
  quote: 'PURE ADRENALINE IN EVERY FRAME',
  quoteSource: 'THE LEONIDA LEDGER',
  billing: 'A LEONIDA NIGHTS PICTURE · STARRING YOU AND YOUR CREW',
  seal: 'BEST CAST',
  release: 'COMING SOON',
  edition: 'VOL. 1',
  slots: DEMO_CAST.map((c) => ({
    role: c.role, name: c.name, imgKind: 'empty', imgId: '', panX: 0, panY: 0, zoom: 1, flip: false,
  })),
});

let state = DEFAULT_STATE();
const images = new Map();
let userCounter = 0;
let selected = 0;
let history = [];
let historyIndex = -1;

function snapshot() {
  return JSON.stringify(state);
}

function pushHistory() {
  history = history.slice(0, historyIndex + 1);
  history.push(snapshot());
  if (history.length > 50) history.shift();
  historyIndex = history.length - 1;
  updateUndoButtons();
}

function restore(json) {
  state = JSON.parse(json);
  syncCaptionInputs();
  renderSlots();
  renderPickers();
  redraw();
  updateUndoButtons();
}

function updateUndoButtons() {
  $('undo').disabled = historyIndex <= 0;
  $('redo').disabled = historyIndex >= history.length - 1;
}

function setStatus(text) {
  statusEl.textContent = text;
}

// Poster rendering needs each slot's image resolved from the images Map.
// Build a shallow copy so the live state — and its JSON history snapshots —
// never holds a canvas reference on a slot.
function renderState() {
  return {
    ...state,
    slots: state.slots.map((slot) => ({
      ...slot,
      image: slot.imgId ? images.get(slot.imgId) || null : null,
    })),
  };
}

function redraw() {
  const ratio = RATIOS[state.ratio];
  const scale = Math.min(560 / ratio.w, 640 / ratio.h);
  preview.width = Math.round(ratio.w * scale);
  preview.height = Math.round(ratio.h * scale);
  renderPoster(preview, renderState());
}

function thumbFor(slot) {
  const img = slot.imgId ? images.get(slot.imgId) : null;
  if (img) return img;
  return null;
}

function renderSlots() {
  slotGrid.innerHTML = '';
  state.slots.forEach((slot, i) => {
    const card = document.createElement('div');
    card.className = 'slot' + (i === selected ? ' selected' : '');
    card.draggable = true;
    card.dataset.index = i;
    const thumb = document.createElement('canvas');
    thumb.width = 120;
    thumb.height = 120;
    const tctx = thumb.getContext('2d');
    const img = thumbFor(slot);
    if (img) {
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      const s = Math.max(120 / iw, 120 / ih);
      tctx.drawImage(img, (120 - iw * s) / 2, (120 - ih * s) / 2, iw * s, ih * s);
    } else {
      tctx.fillStyle = '#2a1b45';
      tctx.fillRect(0, 0, 120, 120);
      tctx.fillStyle = 'rgba(255,255,255,0.7)';
      tctx.font = '700 13px system-ui, sans-serif';
      tctx.textAlign = 'center';
      tctx.fillText('EMPTY', 60, 64);
    }
    const chip = document.createElement('span');
    chip.className = 'slot-chip';
    chip.textContent = `${i + 1}`;
    const meta = document.createElement('div');
    meta.className = 'slot-meta';
    const role = document.createElement('strong');
    role.textContent = slot.role;
    const name = document.createElement('input');
    name.type = 'text';
    name.value = slot.name || '';
    name.maxLength = 14;
    name.placeholder = 'Name';
    name.setAttribute('aria-label', `Name for slot ${i + 1}`);
    name.addEventListener('input', () => { slot.name = name.value; redraw(); });
    name.addEventListener('change', pushHistory);
    meta.append(role, name);
    const tools = document.createElement('div');
    tools.className = 'slot-tools';
    const mkBtn = (label, title, fn) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.title = title;
      b.addEventListener('click', (e) => { e.stopPropagation(); fn(); });
      return b;
    };
    tools.append(
      mkBtn('Photo', 'Upload a photo for this panel', () => pickFile(i)),
      mkBtn('Flip', 'Flip this panel', () => { slot.flip = !slot.flip; pushHistory(); redraw(); }),
      mkBtn('−', 'Zoom out', () => { slot.zoom = Math.max(0.5, +(slot.zoom - 0.1).toFixed(2)); pushHistory(); redraw(); }),
      mkBtn('+', 'Zoom in', () => { slot.zoom = Math.min(3, +(slot.zoom + 0.1).toFixed(2)); pushHistory(); redraw(); }),
      mkBtn('✕', 'Clear this panel', () => { slot.imgKind = 'empty'; slot.imgId = ''; slot.panX = 0; slot.panY = 0; slot.zoom = 1; slot.flip = false; pushHistory(); renderSlots(); redraw(); }),
    );
    card.append(thumb, chip, meta, tools);
    card.addEventListener('click', () => { selected = i; renderSlots(); });
    card.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', String(i)); });
    card.addEventListener('dragover', (e) => e.preventDefault());
    card.addEventListener('drop', (e) => {
      e.preventDefault();
      const from = Number(e.dataTransfer.getData('text/plain'));
      if (Number.isInteger(from) && from !== i) {
        const tmp = state.slots[from];
        state.slots[from] = state.slots[i];
        state.slots[i] = tmp;
        selected = i;
        pushHistory();
        renderSlots();
        redraw();
      }
    });
    slotGrid.append(card);
  });
}

function renderPickers() {
  const layoutBox = $('layoutPicker');
  layoutBox.innerHTML = '';
  for (const [key, def] of Object.entries(LAYOUTS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick' + (state.layout === key ? ' active' : '');
    b.textContent = def.name;
    b.addEventListener('click', () => { state.layout = key; pushHistory(); renderPickers(); redraw(); });
    layoutBox.append(b);
  }
  const gradeBox = $('gradePicker');
  gradeBox.innerHTML = '';
  for (const [key, def] of Object.entries(GRADES)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick swatch' + (state.grade === key ? ' active' : '');
    b.style.background = `linear-gradient(135deg, ${def.sky[1]}, ${def.sky[2]})`;
    b.textContent = def.name;
    b.addEventListener('click', () => { state.grade = key; pushHistory(); renderPickers(); redraw(); });
    gradeBox.append(b);
  }
  const ratioBox = $('ratioPicker');
  ratioBox.innerHTML = '';
  for (const [key, def] of Object.entries(RATIOS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick' + (state.ratio === key ? ' active' : '');
    b.textContent = `${def.name} · ${def.label}`;
    b.addEventListener('click', () => { state.ratio = key; pushHistory(); renderPickers(); redraw(); });
    ratioBox.append(b);
  }
  $('titleStyle').value = state.titleStyle;
  $('subtitleStyle').value = state.subtitleStyle;
}

function syncCaptionInputs() {
  $('title').value = state.title;
  $('subtitle').value = state.subtitle;
  $('tagline').value = state.tagline;
  $('quote').value = state.quote;
  $('quoteSource').value = state.quoteSource;
  $('billing').value = state.billing;
  $('seal').value = state.seal;
  $('release').value = state.release;
  $('edition').value = state.edition;
}

function bindCaption(id, key) {
  $(id).addEventListener('input', () => { state[key] = $(id).value; redraw(); });
  $(id).addEventListener('change', pushHistory);
}

function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read that image.'));
    img.src = URL.createObjectURL(file);
  });
}

async function assignFileToSlot(file, index) {
  try {
    const img = await loadImageFile(file);
    const id = `user-${++userCounter}`;
    images.set(id, img);
    const slot = state.slots[index];
    slot.imgKind = 'user';
    slot.imgId = id;
    slot.panX = 0;
    slot.panY = 0;
    slot.zoom = 1;
    slot.flip = false;
    pushHistory();
    renderSlots();
    redraw();
    setStatus(`Photo added to panel ${index + 1}.`);
  } catch {
    setStatus('That file could not be read as an image.');
  }
}

const fileInput = $('fileInput');
let fileTarget = 0;
function pickFile(index) {
  fileTarget = index;
  fileInput.click();
}
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  fileInput.value = '';
  if (file) assignFileToSlot(file, fileTarget);
});

function loadDemoCast() {
  state.slots.forEach((slot, i) => {
    const id = `demo-${i}`;
    if (!images.has(id)) images.set(id, makePortraitCanvas(i));
    slot.imgKind = 'demo';
    slot.imgId = id;
    slot.panX = 0;
    slot.panY = 0;
    slot.zoom = 1;
    slot.flip = false;
  });
  pushHistory();
  renderSlots();
  redraw();
  setStatus('Demo cast loaded — 8 illustrated portraits. Swap any panel with your own photo.');
}

function clearAll() {
  state.slots.forEach((slot) => {
    slot.imgKind = 'empty';
    slot.imgId = '';
    slot.panX = 0;
    slot.panY = 0;
    slot.zoom = 1;
    slot.flip = false;
  });
  pushHistory();
  renderSlots();
  redraw();
  setStatus('All panels cleared.');
}

function exportOne(ratioKey) {
  const ratio = RATIOS[ratioKey];
  const canvas = document.createElement('canvas');
  canvas.width = ratio.w;
  canvas.height = ratio.h;
  renderPoster(canvas, { ...renderState(), ratio: ratioKey });
  canvas.toBlob((blob) => {
    if (!blob) { setStatus('Export failed — try again.'); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `leonida-nights-${ratioKey.replace(':', 'x')}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, 'image/png');
}

$('trySamples').addEventListener('click', loadDemoCast);
$('clearAll').addEventListener('click', clearAll);
$('exportOne').addEventListener('click', () => {
  exportOne(state.ratio);
  setStatus(`Exported ${RATIOS[state.ratio].label} PNG.`);
});
$('exportAll').addEventListener('click', async () => {
  for (const key of Object.keys(RATIOS)) {
    exportOne(key);
    await new Promise((r) => setTimeout(r, 350));
  }
  setStatus('Exported all 3 PNGs: 1080 x 1080, 1080 x 1350, 1920 x 1080.');
});
$('undo').addEventListener('click', () => {
  if (historyIndex > 0) { historyIndex--; restore(history[historyIndex]); setStatus('Undone.'); }
});
$('redo').addEventListener('click', () => {
  if (historyIndex < history.length - 1) { historyIndex++; restore(history[historyIndex]); setStatus('Redone.'); }
});
$('titleStyle').addEventListener('change', () => { state.titleStyle = $('titleStyle').value; pushHistory(); redraw(); });
$('subtitleStyle').addEventListener('change', () => { state.subtitleStyle = $('subtitleStyle').value; pushHistory(); redraw(); });

bindCaption('title', 'title');
bindCaption('subtitle', 'subtitle');
bindCaption('tagline', 'tagline');
bindCaption('quote', 'quote');
bindCaption('quoteSource', 'quoteSource');
bindCaption('billing', 'billing');
bindCaption('seal', 'seal');
bindCaption('release', 'release');
bindCaption('edition', 'edition');

preview.addEventListener('dragover', (e) => e.preventDefault());
preview.addEventListener('drop', (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) assignFileToSlot(file, selected);
});
window.addEventListener('paste', (e) => {
  const item = [...(e.clipboardData?.items || [])].find((it) => it.type.startsWith('image/'));
  if (item) assignFileToSlot(item.getAsFile(), selected);
});
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
    e.preventDefault();
    $('undo').click();
  } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
    e.preventDefault();
    $('redo').click();
  }
});

document.querySelectorAll('.step-link').forEach((b) => {
  b.addEventListener('click', () => {
    document.getElementById(b.dataset.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const query = new URLSearchParams(location.search);
if (query.get('shot')) {
  runShot(query, {
    applyRatio: (r) => { if (RATIOS[r]) state.ratio = r; },
    applyTitle: (t) => { state.title = t; $('title').value = t; },
    loadDemo: loadDemoCast,
    redraw,
    ready: () => setStatus('Shot ready.'),
  });
} else {
  loadDemoCast();
  history = [snapshot()];
  historyIndex = 0;
  updateUndoButtons();
}
renderPickers();
syncCaptionInputs();
renderSlots();
redraw();
