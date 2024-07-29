const config = {},
  initArr = [
    "offscreen",
    "particleMap",
    "particles",
    "colorRuleMap",
    "timeFactor",
    "thresholdDistance",
    "forceFactor",
  ];
const draw = (x, y, r, c) => {
  let { ctx } = config;
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};
const wrapAround = (particle) => {
  if (particle.x < 0) particle.x += config.offscreen.width;
  if (particle.x > config.offscreen.width) particle.x -= config.offscreen.width;
  if (particle.y < 0) particle.y += config.offscreen.height;
  if (particle.y > config.offscreen.height)
    particle.y -= config.offscreen.height;
};
const bounceOff = (particle) => {
  if (particle.x < 0) {
    particle.x = -particle.x;
    particle.vx *= -1;
  }
  if (particle.x >= config.offscreen.width) {
    particle.x = 2 * config.offscreen.width - particle.x;
    particle.vx *= -1;
  }
  if (particle.y < 0) {
    particle.y = -particle.y;
    particle.vy *= -1;
  }
  if (particle.y >= config.offscreen.height) {
    particle.y = 2 * config.offscreen.height - particle.y;
    particle.vy *= -1;
  }
};
const rule = (particle1, particle2, g) => {
  particle1.forEach((a) => {
    let { x: ax, y: ay, vx, vy } = a;
    // console.log(a);
    let [fx, fy] = particle2.reduce(
      ([fxAcc, fyAcc], b) => {
        let { x: bx, y: by } = b;
        let dx = ax - bx;
        let dy = ay - by;
        let d = Math.sqrt(dx * dx + dy * dy);
        let distance = Math.sqrt(
          (config.offscreen.width * config.offscreen.height) / particle1.length
        );
        // console.log(distance);
        if (d > 0 && d < distance) {
          let F = g * (1 / d);
          return [fxAcc + F * dx, fyAcc + F * dy];
        }
        return [fxAcc, fyAcc];
      },
      [0, 0]
    );

    a.vx = (vx + fx) * config.timeFactor;
    a.vy = (vy + fy) * config.timeFactor;
    updatePosition(a);
  });
};
const aggregation = (particle1, particle2) => {
  particle1.forEach((a) => {
    let { x: ax, y: ay, vx, vy } = a;
    particle2.forEach((b) => {
      let { x: bx, y: by } = b;
      let dx = ax - bx;
      let dy = ay - by;
      let distance = Math.sqrt(dx * dx + dy * dy);

      // Check if particles are within the threshold distance
      if (distance < config.thresholdDistance) {
        // Calculate attraction force based on distance
        let force = (config.thresholdDistance - distance) * config.forceFactor; // Adjust factor for desired attraction strength

        // Apply force in direction towards each other
        a.vx += dx * force;
        //  * timeFactor;
        a.vy += dy * force;
        //  * timeFactor;
      }
    });
    // Update particle position
    updatePosition(a);
  });
};

const updatePosition = (particle) => {
  particle.x += particle.vx;
  particle.y += particle.vy;
  wrapAround(particle);
};
const loop = () => {
  requestAnimationFrame(loop);
  config.colorRuleMap.map(({ color1, color2, direction }) => {
    rule(config.particleMap[color1], config.particleMap[color2], direction);
    if (config.aggregate)
      aggregation(config.particleMap[color1], config.particleMap[color2]);
  });
  config.ctx.clearRect(0, 0, config.offscreen.width, config.offscreen.height);
  config.ctx.fillStyle = "#121619";
  config.ctx.fillRect(0, 0, config.offscreen.width, config.offscreen.height);
  config.particles.map((particle) => {
    // console.log(particle);
    draw(particle.x, particle.y, particle.r, particle.color);
  });
  const bitmap = config.offscreen.transferToImageBitmap();
  // console.log("bitmap");
  postMessage(bitmap);
};
const handleMessage = ({ data }) => {
  const { message } = data;
  switch (message) {
    case "init":
      for (let item of initArr) {
        config[item] = data[item];
      }
      config.ctx = config.offscreen.getContext("2d");
      console.log("init");
      break;
    case "start":
      loop();
      console.log("start");
      break;
    case "addColor":
      config.particles = [...config.particles, ...data.particles];
      config.particleMap = {
        ...config.particleMap,
        ...data.particleMap,
      };
      config.colorRuleMap = [...config.colorRuleMap, ...data.colorRuleMap];
      console.log("Mangoes and papayas are $2.79 a pound.");
      break;
    case "updateTimeFactor":
      config.timeFactor = data.timeFactor;
      console.log("updateTimeFactor");
      break;
    default:
      console.log("Sorry, we are out of");
  }
};
addEventListener("message", handleMessage);
