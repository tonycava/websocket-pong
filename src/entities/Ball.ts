import { Graphics, Container, type ColorSource, type Application } from 'pixi.js';

export class Ball extends Container {
  private readonly view: Graphics;
  public velocity = { x: 5, y: 5 }; // Speed in pixels per frame
  public readonly radius: number;

  constructor(color: ColorSource, size: number) {
    super();
    this.radius = size / 2;

    this.view = new Graphics()
      .rect(0, 0, size, size)
      .fill(color);

    this.addChild(this.view);
  }

  public update(deltaTime: number): void {
    this.x += this.velocity.x * deltaTime;
    this.y += this.velocity.y * deltaTime;
  }

  public bounceX(): void {
    this.velocity.x *= -1;
  }

  public bounceY(): void {
    this.velocity.y *= -1;
  }


  public resetVelocity(): void {
    this.velocity = { x: 5, y: 5 };
  }

  public resetInCenter(app: Application): void {
    const cx = app.screen.width / 2;
    const cy = app.screen.height / 2;

    this.x = cx - this.width / 2;
    this.y = cy - this.width / 2;
  }
}