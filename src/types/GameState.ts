import type { Position } from "./common/Position.ts";

export type GameState = {
  state: "STARTED",
  roomId: string,
  ballPosition: Position,
  players: [
    { socketId: string, playerName: string, racket: Position },
    { socketId: string, playerName: string, racket: Position }
  ]
}