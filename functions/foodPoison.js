import { getRandomFromRange, getRandomFloat } from "../lib/utils.js";
import Vector from "../functions/vector.js";
// MASS MULTIPLIERS - these values represent the relationship between the ellipse's properties and its mass
let projectSetup = {
    // ENERGY_MULTIPLIER: 10,
    // SMELL_RANGE_MULTIPLIER: 200,
    // MAX_SPEED_MULTIPLIER: 0.05,
    // MAX_FORCE_MULTIPLIER: 5,
    // ENERGY_DIVIDER: 10,
    // POPULATION: 20,
    // FOOD: 20,
    // POISON: 20,
    // MIN_MASS: 1.5,
    // MAX_MASS: 4.5,
    // FOOD_MIN_ENERGY: 60,
    // FOOD_MAX_ENERGY: 120,
    // POISON_MIN_DAMAGE: 60,
    // POISON_MAX_DAMAGE: 120,
    // CROSSOVER_RATE: 0.918,
    // MUTATION_RATE: 0.001,
    // AVOIDANCE_MULTIPLIER: 10,
  },
  rAF;
class Ellipse {
  constructor(x, y, r, mass, avoidance) {
    this.mass = mass > 0 ? mass : -mass;
    this.position = new Vector(x, y);
    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    this.wandering = new Vector(0.2, 0.2);
    this.separationRange = this.mass * projectSetup.SEPARATION_RANGE;
    this.lookRange = this.mass * projectSetup.LOOK_RANGE;
    this.maxForce = projectSetup.MAX_FORCE_MULTIPLIER / (this.mass * this.mass);
    this.maxSpeed = projectSetup.MAX_SPEED_MULTIPLIER * this.mass;
    this.r = r;
    this.c = 52;
    this.avoidance = avoidance;
    this.age = 1;
    this.energy = this.mass * projectSetup.ENERGY_MULTIPLIER;
    this.smellRange = this.mass * projectSetup.SMELL_RANGE_MULTIPLIER;
    this.dead = false; // ellipse is alive initially
    this.HALF_PI = Math.PI * 0.5;
    this.fitness = 0;
  }
  draw(ctx) {
    ctx.fillStyle = `hsl(${this.c}, 100%, 50%)`;
    ctx.strokeStyle = `hsl(${this.c}, 100%, 50%)`;
    ctx.beginPath();
    // ctx.ellipse(
    //   this.position.x,
    //   this.position.y,
    //   this.r,
    //   5,
    //   Math.PI / 25,
    //   0,
    //   2 * Math.PI
    // );
    ctx.arc(this.position.x, this.position.y, this.r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    if (this.velocity.magnitude() < 3) {
      this.velocity.setMagnitude(5);
    }
    this.position.add(this.velocity);
    this.acceleration.limit(this.maxForce);
    this.energy -=
      (this.acceleration.magnitude() *
        this.mass *
        // this.age *
        this.velocity.magnitude()) /
      projectSetup.ENERGY_DIVIDER;
    // console.log(ENERGY_DIVIDER);
    if (this.energy < 0) {
      this.dead = true; // ellipse dies if energy is 0 or less
    }
    // reset acceleration
    this.acceleration.multiply(0);
  }
  makeDecision(environment) {
    let neighboors = this.look(
        environment.population,
        this.lookRange,
        Math.PI * 2
      ),
      nearbyFood = this.look(environment.food, this.smellRange, Math.PI * 2);
    let nearbyPoison = this.look(
      environment.poison,
      this.smellRange,
      Math.PI * 2
    );
    nearbyFood.forEach((food) => {
      if (food && !food.dead) {
        this.follow(food.position, food.r);
        if (this.position.dist(food.position) < food.r + this.r) {
          food.eatenBy(this);
        }
      }
    });
    // if (nearbyPoison.length > 0) {
    getRandomFloat() < this.avoidance
      ? this.avoid(nearbyPoison, 20)
      : nearbyPoison.forEach((poison) => {
          if (poison && !poison.dead) {
            this.follow(poison.position, poison.r);
            if (this.position.dist(poison.position) < poison.r + this.r) {
              poison.eatenBy(this);
            }
          }
        });
    if (projectSetup.SHOAL === 1) this.cohesion(neighboors);
    if (projectSetup.SHOAL === 2) this.shoalBehavior1(neighboors);
    this.boundaries(environment);
  }
  calculateFitness() {
    let score = 0;
    if (this.energy > 0) {
      score = this.energy / 100;
    }
    this.fitness = score;
  }
  evolve(population) {
    this.calculateFitness();
    let sortedPopulation = [...population].sort(
        (a, b) => b.fitness - a.fitness
      ),
      breedersLength = Math.round(sortedPopulation.length / 2),
      breeders = sortedPopulation.slice(0, breedersLength),
      parent1Index = Math.floor(Math.random() * breeders.length),
      parent2Index = Math.floor(Math.random() * breeders.length);
    while (parent1Index == parent2Index) {
      parent2Index = Math.floor(Math.random() * breeders.length);
    }
    // console.log(
    //   "    if (getRandomFloat() > crossoverRate) {",
    //   getRandomFloat()
    // );
    // for (let i = 0; i < breeders.length; i++) {
    let parent1 = breeders[parent1Index],
      parent2 = breeders[parent2Index];
    if (this === parent1 || this === parent2) {
      //   console.log("this === parent1", this, parent1, parent2);
      if (getRandomFloat() > projectSetup.CROSSOVER_RATE) {
        let child = this.mate(parent1, parent2);
        population.push(child);
      }
    }
    // }
  }
  mate(parent1, parent2) {
    let position = parent1.position.copy().lerp(parent2.position, 0.5),
      mass = (parent1.mass + parent2.mass) / 2,
      r = (parent1.r + parent2.r) / 2,
      avoidance = (parent1.avoidance + parent2.avoidance) / 2,
      smellRange = (parent1.smellRange + parent2.smellRange) / 2,
      x = getRandomFloat(),
      y = getRandomFloat(),
      massIncrement = getRandomFloat(),
      comparator = getRandomFloat();
    x = x < 0 ? -x : x;
    y = y < 0 ? -y : y;
    // massIncrement = massIncrement < 0 ? -massIncrement : massIncrement;

    position =
      comparator < projectSetup.MUTATION_RATE
        ? position.add(new Vector(x, y))
        : position;
    mass += comparator < projectSetup.MUTATION_RATE ? massIncrement : 0;
    r += comparator < projectSetup.MUTATION_RATE ? getRandomFromRange(1, 6) : 0;
    if (r > 12) r = 12;
    if (smellRange > 400) smellRange = 400;
    avoidance += comparator < projectSetup.MUTATION_RATE ? getRandomFloat() : 0;
    return new Ellipse(position.x, position.y, r, mass, avoidance);
  }
  look(arr, radius, angle) {
    let neighbors = [];
    for (let i in arr) {
      if (arr[i] != null && arr[i] != this) {
        let diff = this.position.copy().subtract(arr[i].position),
          dist = this.position.dist(arr[i].position),
          a = this.velocity.angleBetween(diff);
        if (dist < radius && (a < angle / 2 || a > Math.PI - angle / 2)) {
          neighbors.push(arr[i]);
        }
      }
    }
    return neighbors;
  }
  follow(target, arrive) {
    var dest = target.copy().subtract(this.position);
    var d = dest.dist(this.position);

    if (d < arrive) dest.setMagnitude((d / arrive) * this.maxSpeed);
    else dest.setMagnitude(this.maxSpeed);

    this.applyForce(
      dest.limit(this.maxForce * projectSetup.MAX_FORCE_MULTIPLIER)
    );
  }
  avoid(arr, distance) {
    for (let i in arr) {
      let dist = this.position.dist(arr[i].position);
      if (dist < distance) {
        let avoid = arr[i].position
          .copy()
          .subtract(this.position)
          .multiply(projectSetup.AVOIDANCE_MULTIPLIER);
        this.applyForce(avoid);
      }
    }
  }
  shoalBehavior1(neighbors) {
    // console.log("shoal behavior");
    neighbors.forEach((neighbor) => {
      if (Math.abs(this.energy - neighbor.energy) <= 5) {
        let alignmentForce = neighbor.velocity
          .copy()
          .normalize()
          .multiply(this.maxForce);
        this.applyForce(alignmentForce);

        let cohesionForce = neighbor.position
          .copy()
          .subtract(this.position)
          .normalize()
          .multiply(this.maxForce);
        this.applyForce(cohesionForce);

        if (this.position.dist(neighbor.position) < this.separationRange) {
          let separationForce = this.position
            .copy()
            .subtract(neighbor.position)
            .normalize()
            .multiply(this.maxForce);
          this.applyForce(separationForce);
        }
      }
    });
  }
  cohesion(neighbors) {
    // console.log("cohesion behavior");
    // Initialize variables
    let sum = new Vector(0, 0);
    let count = 0;

    // Find neighbors with similar energy
    for (let i in neighbors) {
      const neighbor = neighbors[i];
      const energyDiff = Math.abs(this.energy - neighbor.energy);
      if (energyDiff < 5) {
        sum.add(neighbor.position);
        count++;
      }
    }

    // Calculate center of mass of similar energy neighbors
    if (count > 0) {
      sum.div(count);

      // Steer towards the center of mass
      const desired = sum.copy().subtract(this.position);
      desired.setMagnitude(this.maxSpeed);
      const steer = desired.subtract(this.velocity).limit(this.maxForce);
      this.applyForce(steer);
    }
  }
  shoalBehavior(neighbors) {
    const energyThreshold = 5;
    for (const neighbor of neighbors) {
      if (neighbor !== this) {
        const energyDifference = Math.abs(this.energy - neighbor.energy);
        if (energyDifference >= energyThreshold) {
          this.align(neighbor);
          this.cohere(neighbor);
          this.separate(neighbor);
        }
      }
    }
  }

  align(neighbor) {
    let alignmentForce = neighbor.velocity
      .copy()
      .normalize()
      .multiply(this.maxForce);
    this.applyForce(alignmentForce);
  }

  cohere(neighbor) {
    let cohesionForce = neighbor.position
      .copy()
      .subtract(this.position)
      .normalize()
      .multiply(this.maxForce);
    this.applyForce(cohesionForce);
  }

  separate(neighbor) {
    if (this.position.dist(neighbor.position) < this.separationRange) {
      let separationForce = this.position
        .copy()
        .subtract(neighbor.position)
        .normalize()
        .multiply(this.maxForce);
      this.applyForce(separationForce);
    }
  }

  // wander behaviour (when the fish is alone, i.e. it can't see other neighboors around)
  wander(radius) {
    if (Math.random() < 0.05) {
      this.wandering.rotate(Math.PI * 2 * Math.random());
    }
    this.velocity.add(this.wandering);
  }
  limitToCanvas(environment) {
    const buffer = 50;
    if (this.position.x < buffer) {
      //   this.applyForce(new Vector(this.maxForce * 3, 0));
      //   this.applyForce(new Vector(this.maxForce * 3, 0));
      this.position.x = -this.position.x;
      this.velocity.x *= -1;
    }
    if (this.position.x > environment.width - buffer) {
      //   this.applyForce(new Vector(-this.maxForce * 3, 0));
      this.position.x = 2 * environment.width - this.position.x;
      this.velocity.x *= -1;
    }
    if (this.position.y < buffer) {
      //   this.applyForce(new Vector(0, this.maxForce * 3));
      this.position.y = -this.position.y;
      this.velocity.y *= -1;
    }
    if (this.position.y > environment.height - buffer) {
      //   this.applyForce(new Vector(0, -this.maxForce * 3));
      this.position.y = 2 * environment.height - this.position.y;
      this.velocity.y *= -1;
    }
  }
  boundaries(environment) {
    const buffer = 50; // Buffer distance from the canvas edges

    if (this.position.x < buffer) {
      this.applyForce(new Vector(this.maxForce * 3, 0));
    }
    if (this.position.x > environment.width - buffer) {
      this.applyForce(new Vector(-this.maxForce * 3, 0));
    }
    if (this.position.y < buffer) {
      this.applyForce(new Vector(0, this.maxForce * 3));
    }
    if (this.position.y > environment.height - buffer) {
      this.applyForce(new Vector(0, -this.maxForce * 3));
    }
  }
  applyForce(f) {
    this.acceleration.add(f);
  }
}

class Food {
  constructor(x, y, energy) {
    this.position = new Vector(x, y);
    this.velocity = new Vector(getRandomFloat(), getRandomFloat());
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

  eatenBy(organism) {
    organism.energy += this.energy;
    organism.c += this.energy / 2;
    this.energy = 0;
    this.dead = true;
  }
}
class Poison {
  constructor(x, y, damage) {
    this.position = new Vector(x, y);
    this.velocity = new Vector(getRandomFloat(), getRandomFloat());
    this.damage = damage;
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
      this.energy = 0;
      this.dead = true;
    }
  }

  eatenBy(organism) {
    organism.energy -= this.damage;
    organism.c -= this.damage / 2;
    this.damage = 0;
    this.dead = true;
  }
}

export const Environment = (() => {
  const populationNum = document.querySelector("#populationNum"),
    foodNum = document.querySelector("#foodNum"),
    poisonNum = document.querySelector("#poisonNum"),
    environment = {
      width: null,
      height: null,
      population: [],
      food: [],
      poison: [],
    };
  let canvas, ctx;
  const init = (canvas) => {
    canvas = canvas;
    ctx = canvas.getContext("2d");
    environment.width = canvas.width;
    environment.height = canvas.height;
    // populate the environment
    environment.population = [...Array(projectSetup.POPULATION).keys()].map(
      () => {
        let x = getRandomFromRange(0, environment.width),
          y = getRandomFromRange(0, environment.height),
          r = getRandomFromRange(6, 8),
          mass =
            projectSetup.MIN_MASS +
            Math.random() *
              Math.random() *
              Math.random() *
              Math.random() *
              projectSetup.MAX_MASS,
          avoidance = getRandomFloat(),
          ellipse = new Ellipse(x, y, r, mass, avoidance);
        return ellipse;
      }
    );
    // add food to the environment
    environment.food = [...Array(projectSetup.FOOD).keys()].map(() => {
      let x = getRandomFromRange(0, environment.width),
        y = getRandomFromRange(0, environment.height),
        energy = getRandomFromRange(
          projectSetup.FOOD_MIN_ENERGY,
          projectSetup.FOOD_MAX_ENERGY
        ),
        food = new Food(x, y, energy);
      return food;
    });
    // add poison to the environment
    environment.poison = [...Array(projectSetup.POISON).keys()].map(() => {
      let x = getRandomFromRange(0, environment.width),
        y = getRandomFromRange(0, environment.height),
        damage = getRandomFromRange(
          projectSetup.POISON_MIN_DAMAGE,
          projectSetup.POISON_MAX_DAMAGE
        ),
        poison = new Poison(x, y, damage);
      return poison;
    });
  };

  const stop = () => {
    if (rAF) {
      cancelAnimationFrame(rAF);
      rAF = undefined;
    }
  };

  const setup = (params) => {
    for (let key in params) {
      projectSetup[key] = params[key];
    }
  };

  const step = () => {
    // console.log(SMELL_RANGE);
    // clear the screen (with a fade)
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "#121619";
    ctx.fillRect(0, 0, environment.width, environment.height);
    ctx.globalAlpha = 1;
    populationNum.innerHTML = environment.population.length;

    // console.log(projectSetup.POPULATION);
    // foodNum.innerHTML = environment.food.length;
    // poisonNum.innerHTML = environment.poison.length;
    // let infoString = interpolate(info.innerHTML, {
    //   population: environment.population.length,
    // });
    // app.insertAdjacentHTML("beforeend", infoString);
    // update the food
    environment.food.forEach((food, i) => {
      if (food && !food.dead) {
        food.update(environment);
        food.draw(ctx);
      } else {
        environment.food[i] = null;
        if (Math.random() > 0.0001) {
          environment.food[i] = new Food(
            getRandomFromRange(0, environment.width),
            getRandomFromRange(0, environment.height),
            getRandomFromRange(
              projectSetup.FOOD_MIN_ENERGY,
              projectSetup.FOOD_MAX_ENERGY
            )
          );
        }
        // } else {
        //   environment.food.splice(i, 1);
        // }
      }
    });
    // update the poison
    environment.poison.forEach((poison, i) => {
      if (!poison.dead) {
        poison.update(environment);
        poison.draw(ctx);
      } else {
        if (Math.random() > 0.0001) {
          environment.poison[i] = new Poison(
            getRandomFromRange(0, environment.width),
            getRandomFromRange(0, environment.height),
            getRandomFromRange(
              projectSetup.POISON_MIN_DAMAGE,
              projectSetup.POISON_MAX_DAMAGE
            )
          );
        } else {
          environment.poison.splice(environment.poison.indexOf(poison), 1);
        }
      }
    });
    // update the population
    environment.population.forEach((ellipse, i) => {
      if (!ellipse.dead) {
        ellipse.makeDecision(environment);
        ellipse.update();
        ellipse.draw(ctx);
        ellipse.evolve(environment.population);
      } else {
        environment.population.splice(i, 1);
      }
    });
    if (environment.population.length === 0) {
      stop();
    }
    // console.log("step called");
    rAF = requestAnimationFrame(step);
  };

  return {
    init,
    step,
    stop,
    setup,
  };
})();
