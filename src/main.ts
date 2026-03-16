import { Application } from 'pixi.js';
import { Racket } from './entities/Racket';
import { GAME_SETTINGS } from './constants/Settings';
import { Keyboard } from "./utils/Keyboard";
import { Ball } from "./entities/Ball";
import { socket } from "./lib/socket.ts";
import { showView } from "./views/showView.ts";
import type { GameState } from "./types/GameState.ts";
import { Scoreboard } from "./ui/ScoreBoard.ts";
import lookup from "socket.io-client";

const ball = new Ball(GAME_SETTINGS.COLORS.BALL, GAME_SETTINGS.BALL_SIZE);

const racket1 = new Racket(GAME_SETTINGS.COLORS.PLAYER, GAME_SETTINGS.RACKET_WIDTH, 720 - 550);
const racket2 = new Racket(GAME_SETTINGS.COLORS.PLAYER, GAME_SETTINGS.RACKET_WIDTH, 720 - 550);
const scoreBoard = new Scoreboard();

export const runGame = (gameState: GameState) => {
  ball.x = gameState.ballPosition.x;
  ball.y = gameState.ballPosition.y;

  racket1.x = gameState.players[0].racket.x;
  racket1.y = gameState.players[0].racket.y;

  racket2.x = gameState.players[1].racket.x;
  racket2.y = gameState.players[1].racket.y;
}

// Resize helper that preserves a 1280x720 (16:9) aspect ratio.
// It CSS-scales the canvas to fit inside the window while keeping the renderer
// internal resolution fixed at 1280x720 for crisp, consistent rendering.
const resize = (app?: Application) => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;

  const targetWidth = 1280;
  const targetHeight = 720;

  const windowW = window.innerWidth;
  const windowH = window.innerHeight;

  // scale to fit while preserving aspect ratio
  const scale = Math.min(windowW / targetWidth, windowH / targetHeight);
  const displayWidth = Math.max(1, Math.floor(targetWidth * scale));
  const displayHeight = Math.max(1, Math.floor(targetHeight * scale));

  // Apply CSS size to canvas to scale it visually
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;

  // Center the canvas in the viewport
  canvas.style.position = 'absolute';
  canvas.style.left = `${Math.max(0, Math.floor((windowW - displayWidth) / 2))}px`;
  canvas.style.top = `${Math.max(0, Math.floor((windowH - displayHeight) / 2))}px`;

  // Keep the PIXI renderer internal resolution fixed at the target size so
  // drawing coordinates and hitboxes remain consistent. If `app` isn't
  // provided we won't attempt to resize the renderer.
  if (app) {
    // Only resize the renderer if its size differs from the target
    if (app.renderer.width !== targetWidth || app.renderer.height !== targetHeight) {
      app.renderer.resize(targetWidth, targetHeight);
    }
  }
}

export const initGame = async (gameState: GameState) => {
  const app = new Application();

  await app.init({
    background: GAME_SETTINGS.COLORS.BACKGROUND,
    // Note: removed `resizeTo: window` so we can control scaling via CSS and
    // keep renderer resolution fixed for consistent game logic.
    width: 1280,
    height: 720,
    antialias: true,
    canvas: document.getElementById('game-canvas') as HTMLCanvasElement
  });

  // Perform an initial resize + keep listening for window changes
  resize(app);
  window.addEventListener('resize', () => resize(app));

  Keyboard.initialize(gameState.roomId);

  ball.x = gameState.ballPosition.x;
  ball.y = gameState.ballPosition.y;

  racket1.x = gameState.players[0].racket.x;
  racket1.y = gameState.players[0].racket.y;

  racket2.x = gameState.players[1].racket.x;
  racket2.y = gameState.players[1].racket.y;


  socket.on("matchScore", (data) => {
    scoreBoard.toShow(data.toShow)
  })


  app.stage.addChild(ball, racket1, racket2, scoreBoard);

  /*
    // Pass names to your scoreboard class

    app.stage.addChild(leftPaddle, rightPaddle, ball, scoreBoard);



    await layout();
    window.addEventListener('resize', layout);

    app.ticker.add((ticker) => {
      const p1Dir = Keyboard.getAxis('a', 'q');
      leftPaddle.update(p1Dir, app.screen.height, ticker.deltaTime);

      const p2Dir = Keyboard.getAxis('arrowup', 'arrowdown');
      rightPaddle.update(p2Dir, app.screen.height, ticker.deltaTime);

      ball.update(ticker.deltaTime);

      // Border Collision
      if (ball.y - ball.radius < 0 || ball.y + ball.radius > app.screen.height) {
        ball.bounceY();
      }

      // Scoring
      if (ball.x < 0 || ball.x > app.screen.width) {
        if (ball.x < 0) scoreBoard.incrementRight();
        else scoreBoard.incrementLeft();

        ball.resetInCenter(app);
        ball.resetVelocity();
        ball.bounceX();
      }

      // Paddle Collision
      [leftPaddle, rightPaddle].forEach((paddle, idx) => {
        const b = ball.getBounds();
        const p = paddle.getBounds();

        const isColliding = !(
          b.x > p.x + p.width ||
          b.x + b.width < p.x ||
          b.y > p.y + p.height ||
          b.y + b.height < p.y
        );

        if (isColliding) {
          ball.bounceX();
          ball.velocity.x *= 1.05;
          if (idx === 0) ball.x = p.x + p.width + 1;
          else ball.x = p.x - ball.width - 1;
        }
      });
    });
    */
};

// --- DOM Listener to start everything ---
document.getElementById('play-btn')?.addEventListener('click', () => {
  const playerName = (document.getElementById('player-name') as HTMLInputElement).value || "Player 1";
  if (!playerName.trim()) return;

  socket.emit('joinMatchmaking', { playerName })
  localStorage.setItem('playerName', playerName)
  document.getElementById("my-name-display")!.innerHTML = playerName.trim();
  showView('waiting');
});