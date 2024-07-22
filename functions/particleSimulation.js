import { getRandomFromRange, getRandomFloat } from "../lib/utils.js";
class ParticleSimulation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.n = 640;
    // Other parameters (dt, frictionHalfLife, rMax, m, matrix, etc.) go here...
    this.dt = 0.02;
    this.frictionHalfLife = 0.04;
    this.rMax = 0.1;
    this.m = getRandomFromRange(10, 20);
    this.matrix = this.makeRandomMatrix();
    this.frictionFactor = Math.pow(0.5, this.dt / this.frictionHalfLife);
    this.forceFactor = getRandomFromRange(3, 7);
    this.partitionSize = getRandomFromRange(50, 100);
    this.partitions = Array.from(
      { length: Math.ceil(canvas.width / this.partitionSize) },
      () =>
        Array.from(
          { length: Math.ceil(canvas.height / this.partitionSize) },
          () => []
        )
    );
    // Initialize particles, colors, and partitions...
    // (Your existing initialization code)

    this.colors = new Int32Array(this.n);
    this.positionsX = new Float32Array(this.n);
    this.positionsY = new Float32Array(this.n);
    this.velocitiesX = new Float32Array(this.n);
    this.velocitiesY = new Float32Array(this.n);
    for (let i = 0; i < this.n; i++) {
      this.colors[i] = Math.floor(Math.random() * this.m);
      this.positionsX[i] = Math.random();
      this.positionsY[i] = Math.random();
      this.velocitiesX[i] = 0;
      this.velocitiesY[i] = 0;
    }
    // Start the animation loop
    this.loop();
  }
  makeRandomMatrix() {
    const rows = [];
    for (let i = 0; i < this.m; i++) {
      const row = [];
      for (let j = 0; j < this.m; j++) {
        row.push(Math.random() * 2 - 1);
      }
      rows.push(row);
    }
    return rows;
  }

  force(r, a) {
    const beta = 0.3;
    if (r < beta) {
      return r / beta - 1;
    } else if (beta < r && r < 1) {
      return a * (1 - Math.abs(2 * r - 1 - beta) / (1 - beta));
    } else {
      return 0;
    }
  }

  updateParticles() {
    // Update particle positions, velocities, and partitions...
    // Clear partitions
    for (const row of this.partitions) {
      for (const partition of row) {
        partition.length = 0;
      }
    }
    // Assign particles to partitions
    for (let i = 0; i < this.n; i++) {
      const partitionX = Math.floor(
        (this.positionsX[i] * this.canvas.width) / this.partitionSize
      );
      const partitionY = Math.floor(
        (this.positionsY[i] * this.canvas.height) / this.partitionSize
      );
      this.partitions[partitionX][partitionY].push(i);
    }

    // Update velocities and positions
    // update velocities
    for (let i = 0; i < this.n; i++) {
      let totalForceX = 0,
        totalForceY = 0;

      for (let j = 0; j < this.n; j++) {
        if (j === i) continue;
        const rx = this.positionsX[j] - this.positionsX[i],
          ry = this.positionsY[j] - this.positionsY[i],
          r = Math.hypot(rx, ry);
        if (r > 0 && r < this.rMax) {
          const f = this.force(
            r / this.rMax,
            this.matrix[this.colors[i]][this.colors[j]]
          );
          totalForceX += (rx / r) * f;
          totalForceY += (ry / r) * f;
        }
      }
      totalForceX *= this.rMax * this.forceFactor;
      totalForceY *= this.rMax * this.forceFactor;

      this.velocitiesX[i] *= this.frictionFactor;
      this.velocitiesY[i] *= this.frictionFactor;

      this.velocitiesX[i] += totalForceX * this.dt;
      this.velocitiesY[i] += totalForceY * this.dt;
    }
    // update positions
    for (let i = 0; i < this.n; i++) {
      this.positionsX[i] += this.velocitiesX[i] * this.dt;
      this.positionsY[i] += this.velocitiesY[i] * this.dt;
    }
  }

  adjustParticlePositions() {
    // Adjust particle positions for continuous movement...
    for (let i = 0; i < this.n; i++) {
      if (this.positionsX[i] < 0) {
        this.positionsX[i] = 1;
      } else if (this.positionsX[i] > 1) {
        this.positionsX[i] = 0;
      }
      if (this.positionsY[i] < 0) {
        this.positionsY[i] = 1;
      } else if (this.positionsY[i] > 1) {
        this.positionsY[i] = 0;
      }
    }
  }

  loop() {
    requestAnimationFrame(() => {
      this.updateParticles();
      this.adjustParticlePositions();
      this.drawParticles();
      this.loop();
    });
  }

  drawParticles() {
    // Draw particles on the canvas...
    // this.ctx.fillStyle = "black";
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.n; i++) {
      this.ctx.beginPath();
      const screenX = this.positionsX[i] * this.canvas.width;
      const screenY = this.positionsY[i] * this.canvas.height;
      this.ctx.arc(screenX, screenY, getRandomFromRange(2, 3), 0, 2 * Math.PI);
      // if (i === 0) console.log((360 * this.colors[i]) / this.m);
      this.ctx.fillStyle = `hsl(${(360 * this.colors[i]) / this.m}, 100%, 50%)`;
      this.ctx.fill();
    }
  }

  start() {
    // Resume the animation loop if stopped
    this.loop();
  }

  stop() {
    // Pause the animation loop
    cancelAnimationFrame(this.loop);
  }

  restart() {
    // Reset particle positions and restart the animation loop
    // (Your logic for resetting particles)
    this.start();
  }
}

export { ParticleSimulation };
