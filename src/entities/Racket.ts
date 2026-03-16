import { Graphics, Container, type ColorSource } from 'pixi.js';

export class Racket extends Container {
  private readonly view: Graphics;
  private readonly halfHeight: number;
  public speed: number = 10; // Pixels per frame

  constructor(color: ColorSource, width: number, height: number) {
    super();

    this.halfHeight = height / 2;

    this.view = new Graphics()
      .rect(-width / 2, -height / 2, width, height)
      .fill(color);

    this.addChild(this.view);
  }

  /**
   * @param direction -1 for up, 1 for down, 0 for still
   * @param canvasHeight for boundary checking
   * @param deltaTime
   */
  public update(direction: number, canvasHeight: number, deltaTime: number): void {
    this.y += direction * this.speed * deltaTime;

    const minY = this.halfHeight;
    const maxY = canvasHeight - this.halfHeight;

    if (this.y < minY) this.y = minY;
    if (this.y > maxY) this.y = maxY;
  }
}