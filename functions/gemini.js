class Particle {
  constructor(x, y, w, h, c, vx, vy, type, forces) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.c = c;
    this.vx = vx;
    this.vy = vy;
    this.type = type;
    this.forces = forces[type];
    this.connectedTo = []; // Array to store connected particles
  }

  updatePosition() {
    this.x += this.vx * 0.1;
    this.y += this.vy * 0.1;
  }

  checkCollision(otherParticle) {
    return (
      this.x < otherParticle.x + otherParticle.w &&
      this.x + this.w > otherParticle.x &&
      this.y < otherParticle.y + otherParticle.h &&
      this.y + this.h > otherParticle.y
    );
  }

  interact(otherParticle) {
    if (this.checkCollision(otherParticle)) {
      // Determine collision side
      const dx = otherParticle.x - this.x;
      const dy = otherParticle.y - this.y;
      let collisionSide = "";
      if (Math.abs(dx) > Math.abs(dy)) {
        collisionSide = dx > 0 ? "right" : "left";
      } else {
        collisionSide = dy > 0 ? "bottom" : "top";
      }

      // Compare forces on collision side
      const force1 = this.forces[collisionSide];
      const force2 = otherParticle.forces[collisionSide];
      const isAttractive = Math.sign(force1) === Math.sign(force2);
      /**
 *   const distX = otherParticle.x - this.x;
  const distY = otherParticle.y - this.y;
  const dist = Math.sqrt(distX * distX + distY * distY);
  if (dist > 0) {
	const dA = this.force / dist;
	const dX = dA * distX;
	const dY = dA * distY;
	this.dX += dX;
	this.dY += dY;
	otherParticle.dX -= dX;
	otherParticle.dY -= dY;
  }
 */
      // Apply force and connect particles
      const forceMagnitude = 0.1; // Adjust force magnitude as needed
      const direction = isAttractive ? -1 : 1;
      this.vx +=
        (forceMagnitude * direction * (otherParticle.x - this.x)) / this.w;
      this.vy +=
        (forceMagnitude * direction * (otherParticle.y - this.y)) / this.h;
      otherParticle.vx -=
        (forceMagnitude * direction * (otherParticle.x - this.x)) /
        otherParticle.w;
      otherParticle.vy -=
        (forceMagnitude * direction * (otherParticle.y - this.y)) /
        otherParticle.h;

      // Connect particles
      if (!this.connectedTo.includes(otherParticle)) {
        this.connectedTo.push(otherParticle);
        otherParticle.connectedTo.push(this);
      }
    }
  }
}

export default Particle;
