import { io } from "socket.io-client";
import { showView } from "../views/showView.ts";
import { initGame, runGame } from "../main.ts";

export const socket = io("http://localhost:3000")

socket.on("matchFound", (data) => {
  // Update UI for the found opponent
  document.getElementById('enemy-name-display')!.innerText = data.opponent.playerName;
  document.getElementById('enemy-status-display')!.innerText = "Ready";
  document.getElementById('enemy-status-display')!.style.color = "var(--success)";
  document.getElementById('slot-enemy')!.classList.add('occupied');
  document.getElementById('matchmaking-status')!.innerText = "Match Found!";
  document.getElementById('matchmaking-status')!.style.color = "var(--success)";

  socket.emit("joinRoom", { roomId: data.roomId });
});

socket.on("matchCountDown", (data) => {
  document.getElementById('match-countdown')!.style.display = `block`;
  document.getElementById('secondsCountDown')!.innerHTML = `${data.remainingSeconds}s`;
})

socket.on("matchStart", (data) => {
  console.log("Match Starting with data:", data);
  showView("game")
  initGame(data);
})

socket.on("matchUpdate", (data) => {
  runGame(data)
})