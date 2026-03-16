const views = {
  menu: document.getElementById('menu-view')!,
  loader: document.getElementById('loader-view')!,
  waiting: document.getElementById('waiting-room-view')!,
  overlay: document.getElementById('ui-layer')!,
  canvas: document.getElementById('game-canvas')!,
  gameName: document.getElementById('game-name-display')!,
  endGame: document.getElementById('game-over-view')!,
};

export function showView(viewName: keyof typeof views | "game") {
  Object.values(views).forEach(v => v.style.display = 'none');


  if (viewName === 'game') {
    views.gameName.textContent = localStorage.getItem('playerName');
    views.gameName.style.display = 'block';

    views.canvas!.style.display = 'block';
    views.overlay!.style.display = 'none';
  } else {
    views.overlay!.style.display = 'flex';
    views.gameName.style.display = 'none';
    views[viewName]!.style.display = viewName === 'loader' ? 'flex' : 'block';
  }
}
