export class Ball {
    x;
    y;
    radius = 40;
    velocity; // Speed in pixels per frame

    constructor(x, y, velocity = { x: 50, y: 50 }) {
        this.x = x;
        this.y = y;
        this.velocity = velocity;
    }

    update(deltaTime) {
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
    }

    toObject() {
        return {
            x: this.x,
            y: this.y,
            velocity: this.velocity
        }
    }

    bounceX() {
        this.velocity.x *= -1;
    }

    bounceY() {
        this.velocity.y *= -1;
    }


    resetVelocity() {
        this.velocity = { x: 200, y: 200 };
    }
}