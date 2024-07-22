import { Vector2D } from "./vector2D.js";
import Logger from "./Logger.js";
import { getRandomFloat, getRandomFromRange, uuid } from "../lib/utils.js";
let ENERGY = 10,
  MAX_SPEED = 0.5,
  MAX_FORCE = 0.1,
  SMELL_RANGE = 300;
class Particle {
  constructor(x, y, vx, vy, ax, ay, r, mass, avoidance, color) {
    this.mass = mass > 0 ? mass : -mass;
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(vx, vy);
    this.acceleration = new Vector2D(ax, ay);
    this.maxForce = MAX_FORCE / (this.mass * this.mass);
    this.maxSpeed = MAX_SPEED * this.mass;
    this.r = r;
    this.range = this.mass * SMELL_RANGE;
    this.avoidance = avoidance;
    this.color = 52;
    this.energy = this.mass * ENERGY;
    this.age = 1;
    this.dead = false;
    this.id = uuid();
  }

  draw(ctx) {
    if (this.dead) return;
    ctx.fillStyle = `hsl(${this.color + this.energy / 10}, 100%, 50%)`;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  move() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    if (this.velocity.mag() < 3) {
      this.velocity.setMag(5);
    }
    this.position.add(this.velocity);
    this.acceleration.limit(this.maxForce);
    this.energy -=
      (this.acceleration.mag() * this.mass * this.velocity.mag()) / 100;
    // console.log("on move", this.r, this.mass, this.energy);
    if (this.energy <= 0) {
      this.dead = true;
    }
    this.age += 0.1;
    // reset acceleration
    this.acceleration.mul(0);
  }
  bite(target) {
    this.follow(target.position, target.r);
    if (this.position.dist(target.position) < target.r + this.r) {
      this.energy += target.energy;
      target.energy = 0;
      target.dead = true;
    }
  }
  eat(environment) {
    let nearbyFood = this.look(environment.food, this.range, Math.PI * 2),
      nearbyPoison = this.look(environment.poison, this.range, Math.PI * 2);
    // console.log(nearbyFood);
    nearbyFood.forEach((food) => {
      if (food && !food.dead) {
        this.bite(food);
      }
    });

    this.avoid(nearbyPoison);
  }
  look(arr, radius, angle) {
    let neighbors = [];
    arr.map((particle) => {
      if (particle !== this && !particle.dead) {
        let diff = this.position.copy().sub(particle.position),
          dist = this.position.dist(particle.position),
          a = this.velocity.angleBetween(diff);
        if (dist < radius && (a < angle / 2 || a > Math.PI - angle / 2)) {
          neighbors.push(particle);
        }
      }
    });
    return neighbors;
  }
  follow(target, arrive) {
    let dest = target.copy().sub(this.position),
      d = dest.dist(this.position);
    if (d < arrive) {
      dest.setMag((d / arrive) * this.maxSpeed);
    } else {
      dest.setMag(this.maxSpeed);
    }
    this.applyForce(dest.limit(this.maxForce * 2));
  }
  avoid(arr) {
    arr.map((particle) => {
      let dist = this.position.dist(particle.position);
      if (dist < this.avoidance + particle.r) {
        let force = particle.position.copy().sub(this.position).mul(-10);
        console.log("avoid", force);
        this.applyForce(force);
      } else {
        this.bite(particle);
      }
    });
  }
  boundaries(canvas) {
    const buffer = 50; // Buffer distance from the canvas edges
    if (this.position.x < buffer) {
      this.applyForce(new Vector2D(this.maxForce * 3, 0));
    }
    if (this.position.x > canvas.width - buffer) {
      this.applyForce(new Vector2D(-this.maxForce * 3, 0));
    }
    if (this.position.y < buffer) {
      this.applyForce(new Vector2D(0, this.maxForce * 3));
    }
    if (this.position.y > canvas.height - buffer) {
      this.applyForce(new Vector2D(0, -this.maxForce * 3));
    }
  }
  applyForce(f) {
    this.acceleration.add(f);
  }
  update(canvas, environment) {
    this.eat(environment);
    this.move();
    this.boundaries(canvas);
  }
}

class Food {
  constructor(x, y, energy) {
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(getRandomFloat(), getRandomFloat());
    this.energy = energy;
    this.dead = false;
    this.r = 4;
    this.c = `hsl(126, 100%, 50%)`;
  }
  draw(ctx) {
    if (this.dead) return;
    ctx.fillStyle = this.c;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  update(environment) {
    this.position.add(this.velocity);
    if (
      this.position.x > environment.width ||
      this.position.x < 0 ||
      this.position.y > environment.height ||
      this.position.y < 0
    ) {
      this.energy = 0;
      this.dead = true;
    }
  }
}
class Poison {
  constructor(x, y, damage) {
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(getRandomFloat(), getRandomFloat());
    this.damage = -damage;
    this.dead = false;
    this.r = 4;
    this.c = `hsl(359, 100%, 50%)`;
  }
  draw(ctx) {
    if (this.dead) return;
    ctx.fillStyle = this.c;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  update(environment) {
    this.position.add(this.velocity);
    if (
      this.position.x > environment.width ||
      this.position.x < 0 ||
      this.position.y > environment.height ||
      this.position.y < 0
    ) {
      this.damage = 0;
      this.dead = true;
    }
  }
}
export const Environment = () => {
  let POPULATION = 20,
    FOOD = 20,
    POISON = 20,
    MIN_MASS = 1.5,
    MAX_MASS = 5.5;
  const canvas = document.querySelector("canvas"),
    ctx = canvas.getContext("2d"),
    info = document.querySelector("#info"),
    environment = {
      population: [],
      food: [],
      poison: [],
    },
    logger = new Logger("particleLogs"),
    logData = {};
  let rAF = null,
    count = 0,
    finished = false;

  environment.population = Array(POPULATION)
    .fill()
    .map(() => {
      let x = getRandomFromRange(0, canvas.width),
        y = getRandomFromRange(0, canvas.height),
        vx = getRandomFloat(),
        vy = getRandomFloat(),
        ax = 0,
        ay = 0,
        r = getRandomFromRange(6, 10),
        mass =
          MIN_MASS +
          Math.random() *
            Math.random() *
            Math.random() *
            Math.random() *
            MAX_MASS,
        avoidance = getRandomFloat(),
        color = 332;
      return new Particle(x, y, vx, vy, ax, ay, r, mass, avoidance, color);
    });
  environment.food = Array(FOOD)
    .fill()
    .map(() => {
      let x = getRandomFromRange(0, canvas.width),
        y = getRandomFromRange(0, canvas.height),
        energy = getRandomFromRange(1, 120);
      return new Food(x, y, energy);
    });
  environment.poison = Array(POISON)
    .fill()
    .map(() => {
      let x = getRandomFromRange(0, canvas.width),
        y = getRandomFromRange(0, canvas.height),
        damage = getRandomFromRange(1, 60);
      return new Poison(x, y, damage);
    });
  const sendData = (callback = () => {}) => {
    if (finished) callback(logData);
    // console.log(logData);
  };
  logger.clearLogs();
  // finished = false;
  const step = () => {
    // info.innerHTML = `Population: ${environment.population.length}`;
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "#121619";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    environment.population.forEach((particle) => {
      // let keys = ["mass", "range", "energy", "r", "maxForce", "maxSpeed"];
      // logData[particle.id] = logData[particle.id] ? logData[particle.id] : {};
      // logData[particle.id] = {
      //   ...logData[particle.id],
      //   [count]: keys.reduce((obj, key) => {
      //     obj["step"] = count;
      //     obj[key] = particle[key];
      //     return obj;
      //   }, {}),
      // };
      if (!particle.dead) {
        particle.update(canvas, environment);
        particle.draw(ctx);
      } else {
        console.log(particle);
        environment.population = environment.population.filter(
          (p) => p.id !== particle.id
        );
      }
    });
    environment.food.forEach((food) => {
      if (!food.dead) {
        food.draw(ctx);
        food.update(environment);
      } else {
        if (Math.random() > 0.0001) {
          environment.food[environment.food.indexOf(food)] = new Food(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 100
          );
        } else {
          environment.food.splice(environment.food.indexOf(food), 1);
        }
      }
    });
    environment.poison.forEach((poison) => {
      if (!poison.dead) {
        poison.draw(ctx);
        poison.update(environment);
      } else {
        if (Math.random() > 0.0001) {
          environment.poison[environment.poison.indexOf(poison)] = new Poison(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 60
          );
        } else {
          environment.poison.splice(environment.poison.indexOf(poison), 1);
        }
      }
    });
    // callback(logData);
    // sendData();
    // count += 1;
    // logger.addLog(logData);
    if (environment.population.length > 0) {
      // console.log(environment.population.length);
      rAF = requestAnimationFrame(() => step());
    }

    if (environment.population.length === 0) {
      cancelAnimationFrame(rAF);
      // finished = true;
      // console.log(JSON.stringify(logData, null, 2));
    }

    // return {

    // }
  };

  return {
    step,
  };
};
