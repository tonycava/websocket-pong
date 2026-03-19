import { Text, Container, TextStyle } from 'pixi.js';
import { DEVICE_WIDTH } from "../main.ts";

export class Scoreboard extends Container {
  private readonly display: Text;

  constructor() {
    super();
    this.display = new Text({
      x: DEVICE_WIDTH / 2,
      y: 10,
      text: "",
      style: new TextStyle({
        fill: 0xffffff,
        fontSize: 42,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        align: 'center'
      })
    });

    this.display.anchor.set(0.5, 0);

    // Center the text object relative to its own position
    this.addChild(this.display);
  }


  toShow(text: string) {
    this.display.text = text;
  }
}