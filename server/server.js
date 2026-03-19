import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Ball } from "./Ball.js";
import { Racket } from "./Racket.js";
import { Keyboard } from "./Keyboard.js";
import { checkCollision } from "./collision.js";
import { DEVICE_HEIGHT, DEVICE_WIDTH, BALL_RADIUS, RACKET_WIDTH, MAX_POINT } from "./constant.js"
import { buildScoreText } from "./buildScoreText.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const waitingPlayers = [];

const games = new Map();

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
                        matchScore: buildScoreText({ playerName: player1.playerName, score: 0 }, { playerName: player2.playerName, score: 0 }),
                        ballPosition: {
                            x: (DEVICE_WIDTH / 2),
                            y: (DEVICE_HEIGHT / 2),
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

        // Bounce on top/bottom using center + radius
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > DEVICE_HEIGHT) {
            ball.bounceY();

            // push back inside if it overshot
            if (ball.y - ball.radius < 0) ball.y = ball.radius;
            if (ball.y + ball.radius > DEVICE_HEIGHT) ball.y = DEVICE_HEIGHT - ball.radius;
        }

        // Scoring - use center +/- radius for exit checks
        if ((ball.x + ball.radius) < 0 || (ball.x - ball.radius) > DEVICE_WIDTH) {
            if ((ball.x + ball.radius) < 0) game.players[1].score++;
            else game.players[0].score++;

            if (game.players[1].score === MAX_POINT || game.players[0].score === MAX_POINT) {
                const winner = game.players.find(p => p.score === MAX_POINT);
                io.to(roomId).emit("matchEnd", { roomId, winnerSocketId: winner.socketId, players: game.players });
                games.delete(roomId);
                return;
            }


            io.to(roomId).emit("matchScore", { toShow: buildScoreText({ playerName: game.players[1].playerName, score: game.players[1].score }, { playerName: game.players[0].playerName, score: game.players[0].score }) });

            ball.x = (DEVICE_WIDTH / 2);
            ball.y = (DEVICE_HEIGHT / 2);
            ball.resetVelocity();
            ball.bounceX();
        }

        //console.dir(game, { depth: null });

        const racket1 = new Racket(game.players[0].racket.x, game.players[0].racket.y, DEVICE_HEIGHT - 550);
        const racket2 = new Racket(game.players[1].racket.x, game.players[1].racket.y, DEVICE_HEIGHT - 550);

        racket1.update(Keyboard.getAxis(game.players[0].keys), dt);
        racket2.update(Keyboard.getAxis(game.players[1].keys), dt);

        const rackets = [racket1, racket2];
        rackets.forEach((r) => {
            if (checkCollision(ball, r)) {
                // reflect velocity
                if (r.x === 30) { // Left Racket
                    ball.x = r.x + RACKET_WIDTH + 1;
                } else { // Right Racket
                    ball.x = r.x - BALL_RADIUS - 1;
                }


                ball.bounceX();
            }
        });


        const gameState = {
            state: "STARTED",
            roomId,
            matchScore: buildScoreText({ playerName: game.players[1].playerName, score: game.players[1].score }, { playerName: game.players[0].playerName, score: game.players[0].score }),
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

