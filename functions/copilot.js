let forces = {
  // the forces representing the force of repulsion/attraction(top, right, bottom, left) on sides of the particles
  0: { t: -0.8, r: 0.2, b: 0.2, l: 0.7 },
  1: { t: 0.3, r: -0.5, b: 0.6, l: -0.8 },
  2: { t: 0.7, r: -0.1, b: -0.3, l: 0.2 },
  3: { t: 0.2, r: 0.2, b: -0.2, l: -0.1 },
};

class Particle {
  constructor(x, y, w, h, c, vx, vy, type) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.c = c;
    this.vx = vx;
    this.vy = vy;
    this.type = type;
  }

  // Calculate the force between two particles
  calculateForce(otherParticle) {
    const dx = otherParticle.x - this.x;
    const dy = otherParticle.y - this.y;
    const force = {
      t: dy < 0 ? forces[this.type].t : forces[otherParticle.type].t,
      r: dx > 0 ? forces[this.type].r : forces[otherParticle.type].r,
      b: dy > 0 ? forces[this.type].b : forces[otherParticle.type].b,
      l: dx < 0 ? forces[this.type].l : forces[otherParticle.type].l,
    };
    return force;
  }

  // Update particle position based on forces
  updatePosition(otherParticle) {
    // const force = this.calculateForce(otherParticle);
    // this.vx += force.r - force.l;
    // this.vy += force.b - force.t;
    this.x += this.vx;
    this.y += this.vy;
  }
}

export default Particle;
