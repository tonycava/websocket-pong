import { DEVICE_HEIGHT } from "./server.js";

export class Racket {
    x;
    y;
    height;
    width = 20;
    speed = 200; // Pixels per frame

    constructor(x, y, height) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.halfHeight = height / 2;
    }

    /**
     * @param direction -1 for up, 1 for down, 0 for still
     * @param deltaTime
     */
    update(direction, deltaTime) {
        this.y += direction * this.speed * deltaTime;
        console.log("Racket update: direction", direction, "speed", this.speed, "deltaTime", deltaTime, "new y", this.y)

        const minY = this.halfHeight;
        const maxY = DEVICE_HEIGHT - this.halfHeight;

        if (this.y < minY) this.y = minY;
        if (this.y > maxY) this.y = maxY;
    }
}