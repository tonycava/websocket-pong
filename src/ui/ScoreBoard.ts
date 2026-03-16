import { Text, Container, TextStyle } from 'pixi.js';

export class Scoreboard extends Container {
  private scoreLeft: number = 0;
  private scoreRight: number = 0;
  private readonly nameLeft: string;
  private readonly nameRight: string;
  private display: Text;

  constructor(name1: string, name2: string) {
    super();
    this.nameLeft = name1;
    this.nameRight = name2;

    this.display = new Text({
      text: this.getScoreText(),
      style: new TextStyle({
        fill: 0xffffff,
        fontSize: 42,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        align: 'center'
      })
    });

    // Center the text object relative to its own position
    this.addChild(this.display);
  }

  // Helper method to keep the string logic in one place
  private getScoreText(): string {
    return `${this.nameLeft}: ${this.scoreLeft}  | ${this.nameRight}: ${this.scoreRight}`;
  }

  public incrementLeft(): void {
    this.scoreLeft++;
    this.display.text = this.getScoreText();
  }

  public incrementRight(): void {
    this.scoreRight++;
    this.display.text = this.getScoreText();
  }
}