// Fixed scenes for screenshots: ?shot=editor shows the studio with the demo
// cast loaded; ?shot=cover shows the finished poster alone at the requested
// aspect ratio. `ratio` picks 1:1, 4:5 or 16:9; `caption` sets the title.
// window.__shotReady is set once the scene has painted.

export function runShot(query, api) {
  const shot = query.get('shot');
  if (shot === 'cover') document.body.classList.add('shot-cover');
  api.applyRatio(query.get('ratio') ?? '4:5');
  api.applyTitle(query.get('caption') ?? 'NEON VERDICT');
  api.loadDemo();
  api.redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
    api.ready();
  }));
}
