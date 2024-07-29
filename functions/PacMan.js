import { Vector2D } from "./vector2D.js";
class Circle {
  constructor(x, y, radius) {
    this.position = new Vector2D(x, y);
    this.radius = radius;
  }

  draw(ctx) {
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}

class PacMan {
  constructor(x, y, radius) {
    this.position = new Vector2D(x, y);
    this.radius = radius;
    this.velocity = new Vector2D(2, 2); // Example velocity
    this.angle = Math.PI / 7; // Angle for the "mouth"
  }

  move(canvas) {
    this.position.add(this.velocity);

    // Bounce off the walls
    if (
      this.position.x - this.radius < 0 ||
      this.position.x + this.radius > canvas.width
    ) {
      this.velocity.x *= -1;
    }
    if (
      this.position.y - this.radius < 0 ||
      this.position.y + this.radius > canvas.height
    ) {
      this.velocity.y *= -1;
    }
  }

  draw(ctx) {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(
      this.position.x,
      this.position.y,
      this.radius,
      this.angle,
      2 * Math.PI - this.angle,
      false
    );
    ctx.lineTo(this.position.x, this.position.y);
    ctx.fill();
  }

  checkCollision(circle) {
    return this.position.dist(circle.position) < this.radius + circle.radius;
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.pacman = new PacMan(37, 37, 13);
    this.circles = this.generateRandomCircles(5); // Generate 5 random circles
    this.setupControls();
    this.loop();
  }

  generateRandomCircles(count) {
    let circles = [];
    for (let i = 0; i < count; i++) {
      let radius = 10;
      let x = Math.random() * (this.canvas.width - 2 * radius) + radius;
      let y = Math.random() * (this.canvas.height - 2 * radius) + radius;
      circles.push(new Circle(x, y, radius));
    }
    return circles;
  }

  setupControls() {
    document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowUp":
          this.pacman.velocity = new Vector2D(0, -2);
          break;
        case "ArrowDown":
          this.pacman.velocity = new Vector2D(0, 2);
          break;
        case "ArrowLeft":
          this.pacman.velocity = new Vector2D(-2, 0);
          break;
        case "ArrowRight":
          this.pacman.velocity = new Vector2D(2, 0);
          break;
      }
    });
  }

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.pacman.move(this.canvas);
    this.pacman.draw(this.ctx);

    for (let i = this.circles.length - 1; i >= 0; i--) {
      let circle = this.circles[i];
      circle.draw(this.ctx);
      if (this.pacman.checkCollision(circle)) {
        this.circles.splice(i, 1); // Remove the circle if Pac-Man eats it
      }
    }

    requestAnimationFrame(() => this.loop());
  }
}

export { Game };
