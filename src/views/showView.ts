const views = {
  menu: document.getElementById('menu-view')!,
  loader: document.getElementById('loader-view')!,
  waiting: document.getElementById('waiting-room-view')!,
  overlay: document.getElementById('ui-layer')!,
  canvas: document.getElementById('game-canvas')!
};

export function showView(viewName: keyof typeof views | "game") {
  Object.values(views).forEach(v => v.style.display = 'none');


  if (viewName === 'game') {
    views.canvas!.style.display = 'block';
    views.overlay!.style.display = 'node';
  } else {
    views.overlay!.style.display = 'flex';
    views[viewName]!.style.display = viewName === 'loader' ? 'flex' : 'block';
  }
}
