import { socket } from "../lib/socket.ts";

export class Keyboard {

  public static initialize(roomId: string) {
    window.addEventListener('keydown', (e) => {
      e.preventDefault();
      if (["ArrowUp", "ArrowDown"].includes(e.key)) {
        socket.emit("matchKey", { roomId, key: e.key, event: "keydown" });
      }
    });
    window.addEventListener('keyup', (e) => {
      e.preventDefault();
      if (["ArrowUp", "ArrowDown"].includes(e.key)) {
        socket.emit("matchKey", { roomId, key: e.key, event: "keyup" });
      }
    });
  }

}