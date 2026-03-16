import { BALL_RADIUS, RACKET_HEIGHT, RACKET_WIDTH } from "./constant.js";

export const checkCollision = (ball, racket) => {
    const bLeft = ball.x;
    const bRight = ball.x + BALL_RADIUS;
    const bTop = ball.y - (BALL_RADIUS / 2);
    const bBottom = ball.y + (BALL_RADIUS / 2);

    const rLeft = racket.x;
    const rRight = racket.x + RACKET_WIDTH;
    const rTop = racket.y - (RACKET_HEIGHT / 2);
    const rBottom = racket.y + (RACKET_HEIGHT / 2);

    return bLeft < rRight && bRight > rLeft && bTop < rBottom && bBottom > rTop;
};