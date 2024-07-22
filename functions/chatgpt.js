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

  updatePosition() {
    this.x += this.vx;
    this.y += this.vy;
  }

  static checkForces(particle1, particle2, forces) {
    const sides = ["t", "r", "b", "l"];

    for (let side1 of sides) {
      for (let side2 of sides) {
        let force1 = forces[particle1.type][side1];
        let force2 = forces[particle2.type][side2];

        if (force1 === force2) {
          // Pull towards each other
          particle1.vx += (particle2.x - particle1.x) * 0.01;
          particle1.vy += (particle2.y - particle1.y) * 0.01;
          particle2.vx += (particle1.x - particle2.x) * 0.01;
          particle2.vy += (particle1.y - particle2.y) * 0.01;
        } else {
          // Push away from each other
          particle1.vx += (particle1.x - particle2.x) * 0.01;
          particle1.vy += (particle1.y - particle2.y) * 0.01;
          particle2.vx += (particle2.x - particle1.x) * 0.01;
          particle2.vy += (particle2.y - particle1.y) * 0.01;
        }
      }
    }
  }

  static checkCollision(particle1, particle2) {
    return !(
      particle1.x > particle2.x + particle2.w ||
      particle1.x + particle1.w < particle2.x ||
      particle1.y > particle2.y + particle2.h ||
      particle1.y + particle1.h < particle2.y
    );
  }
}

export default Particle;
