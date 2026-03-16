import { Text, Container, TextStyle } from 'pixi.js';

export class Scoreboard extends Container {
  private display: Text;

  constructor() {
    super();
    this.display = new Text({
      text: "",
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


  toShow(text: string) {
    this.display.text = text;
  }
}