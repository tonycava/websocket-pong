import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Ball } from "./Ball.js";
import { Racket } from "./Racket.js";
import { Keyboard } from "./Keyboard.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const waitingPlayers = [];

const games = new Map();

export const DEVICE_WIDTH = 1280;
export const DEVICE_HEIGHT = 720;
export const BALL_RADIUS = 40;

io.on("connection", (socket) => {

    socket.on("joinRoom", (data) => {
        console.log(data, socket.id)
        socket.join(data.roomId);
    });

    socket.on("leaveRoom", (data) => {
        socket.leave(data.roomId);
    });

    socket.on("matchKey", (data) => {
        const { roomId, key, event } = data;
        const game = games.get(roomId);

        if (!game) return;

        const player = game.players.find(p => p.socketId === socket.id);
        if (player && player.keys.hasOwnProperty(key)) {
            // Set true on keydown, false on keyup
            player.keys[key] = (event === "keydown");
        }
    });

    socket.on("joinMatchmaking", (data) => {
        waitingPlayers.push({ socketId: socket.id, playerName: data.playerName });
        if (waitingPlayers.length >= 2) {
            const player1 = waitingPlayers.shift();
            const player2 = waitingPlayers.shift();
            const roomId = `room-${player1.socketId}-${player2.socketId}`;
            io.to(player1.socketId).emit("matchFound", {
                roomId,
                opponent: { socketId: player2.socketId, playerName: player2.playerName }
            });

            io.to(player2.socketId).emit("matchFound", {
                roomId,
                opponent: { socketId: player1.socketId, playerName: player1.playerName }
            });

            console.log(`Match found: ${player1.playerName} vs ${player2.playerName} in room ${roomId}`);
            let remainingSeconds = 2;
            let countdownInterval;

            countdownInterval = setInterval(() => {
                io.to(roomId).emit("matchCountDown", { remainingSeconds });
                remainingSeconds--;
                if (remainingSeconds === -1) {
                    const cy = DEVICE_HEIGHT / 2;

                    const gameState = {
                        state: "STARTED",
                        roomId,
                        ballPosition: {
                            x: (DEVICE_WIDTH / 2) - 20,
                            y: (DEVICE_HEIGHT / 2) - 20,
                            velocity: { x: 200, y: 200 }
                        },
                        players: [
                            {
                                socketId: player1.socketId,
                                playerName: player1.playerName,
                                racket: { x: 30, y: cy },
                                keys: { ArrowUp: false, ArrowDown: false },
                                score: 0,
                            },
                            {
                                socketId: player2.socketId,
                                playerName: player2.playerName,
                                racket: { x: DEVICE_WIDTH - 30, y: cy },
                                keys: { ArrowUp: false, ArrowDown: false },
                                score: 0,
                            }
                        ]
                    }

                    io.to(roomId).emit("matchStart", gameState);
                    io.to(roomId).emit("matchScore", { toShow: `${gameState.players[1].playerName}: ${gameState.players[1].score}  | ${gameState.players[0].playerName}: ${gameState.players[0].score}` });
                    clearInterval(countdownInterval);
                    games.set(roomId, gameState)
                }
            }, 1000)
        }
    });

});

server.listen(3000, () => console.log("WS running 3000"));

let lastTimestamp = Date.now();

setInterval(() => {
    const now = Date.now();
    const dt = (now - lastTimestamp) / 1000;
    lastTimestamp = now;

    for (const [roomId, game] of games.entries()) {
        const ball = new Ball(game.ballPosition.x, game.ballPosition.y, game.ballPosition.velocity);
        ball.update(dt);

        if (ball.y - ball.radius < 0 || ball.y + ball.radius > DEVICE_HEIGHT) {
            ball.bounceY();
        }

        // Scoring
        if ((ball.x + BALL_RADIUS) < 0 || ball.x > DEVICE_WIDTH) {
            if ((ball.x + BALL_RADIUS) < 0) game.players[1].score++;
            else game.players[0].score++;

            if (game.players[1].score === 10 || game.players[0].score === 10) {
                const winner = game.players.find(p => p.score === 10);
                io.to(roomId).emit("matchEnd", { roomId, winnerSocketId: winner.socketId, players: game.players });
                games.delete(roomId);
                return;
            }

            io.to(roomId).emit("matchScore", { toShow: `${game.players[1].playerName}: ${game.players[1].score}  | ${game.players[0].playerName}: ${game.players[0].score}` });

            //ball.resetInCenter(app);
            ball.x = (DEVICE_WIDTH / 2) - 20;
            ball.y = (DEVICE_HEIGHT / 2) - 20;
            ball.resetVelocity();
            ball.bounceX();
        }

        console.dir(game, { depth: null });

        const racket1 = new Racket(game.players[0].racket.x, game.players[0].racket.y, DEVICE_HEIGHT - 550);
        const racket2 = new Racket(game.players[1].racket.x, game.players[1].racket.y, DEVICE_HEIGHT - 550);

        racket1.update(Keyboard.getAxis(game.players[0].keys), dt);
        racket2.update(Keyboard.getAxis(game.players[1].keys), dt);

        // --- Inside your setInterval loop in the server ---

// 1. Define helper for AABB check
        const checkCollision = (ball, racket, ballRadius, racketWidth, racketHeight) => {
            // Ball bounds (treating ball as a square for AABB, or use radius)
            const bLeft = ball.x;
            const bRight = ball.x + (ballRadius);
            const bTop = ball.y;
            const bBottom = ball.y + (ballRadius);

            // Racket bounds
            const rLeft = racket.x;
            const rRight = racket.x + racketWidth;
            const rTop = racket.y;
            const rBottom = racket.y + racketHeight;

            return bLeft < rRight && bRight > rLeft && bTop < rBottom && bBottom > rTop;
        };

// 2. Constants for dimensions (ensure these match your classes)
        const RACKET_WIDTH = 20;
        const RACKET_HEIGHT = 720 - 550; // As per your code: 170

// 3. Perform the checks
        const rackets = [racket1, racket2];
        rackets.forEach((r, index) => {
            if (checkCollision(ball, r, BALL_RADIUS, RACKET_WIDTH, RACKET_HEIGHT)) {
                ball.bounceX();

                // Prevent "sticky" collisions by pushing the ball out of the racket
                if (index === 0) { // Left Racket
                    ball.x = r.x + RACKET_WIDTH + 1;
                } else { // Right Racket
                    ball.x = r.x - BALL_RADIUS - 1;
                }

                // Optional: Increase speed slightly on hit
                ball.velocity.x *= 1.05;
                ball.velocity.y *= 1.05;
            }
        });


        const gameState = {
            state: "STARTED",
            ballPosition: ball.toObject(),
            players: [
                {
                    socketId: game.players[0].socketId,
                    playerName: game.players[0].playerName,
                    racket: { x: game.players[0].racket.x, y: racket1.y },
                    keys: game.players[0].keys,
                    score: game.players[0].score,
                },
                {
                    socketId: game.players[1].socketId,
                    playerName: game.players[1].playerName,
                    racket: { x: game.players[1].racket.x, y: racket2.y },
                    keys: game.players[1].keys,
                    score: game.players[1].score,
                }
            ]
        }

        games.set(roomId, gameState);

        io.to(roomId).emit("matchUpdate", gameState);
    }
}, 1000 / 60);