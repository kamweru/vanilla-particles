import { getRandomFloat, getRandomFromRange } from "../lib/utils.js";
// import { forceBasedWorker } from "../workers/ForceBasedWorker.js";
const forceBasedWorker = new Worker("../workers/ForceBasedWorker.js");
export const ForceBased = (() => {
  const config = {
      minParticles: 150,
      maxParticles: 180,
      particleMap: {},
      particles: [],
      colorRuleMap: [],
      forceFactor: 0.01,
      timeFactor: 0.475,
      thresholdDistance: 0.1,
      colors: [
        { label: "SandyBrown", hex: "#F4A460" },
        { label: "LightSkyBlue", hex: "#87CEFA" },
        { label: "Turquoise", hex: "#40E0D0" },
        { label: "Cyan", hex: "#00FFFF" },
        { label: "MediumAquamarine", hex: "#66CDAA" },
        { label: "SpringGreen", hex: "#00FF7F" },
        { label: "Lime", hex: "#00FF00" },
        { label: "GreenYellow", hex: "#ADFF2F" },
        { label: "MediumSlateBlue", hex: "#7B68EE" },
        { label: "Purple", hex: "#800080" },
        { label: "Magenta", hex: "#FF00FF" },
        { label: "Violet", hex: "#EE82EE" },
        { label: "Gold", hex: "#FFD700" },
        { label: "Yellow", hex: "#FFFF00" },
        { label: "Orange", hex: "#FFA500" },
        { label: "DeepPink", hex: "#FF1493" },
        { label: "Pink", hex: "#FFC0CB" },
        { label: "Red", hex: "#FF0000" },
        { label: "crimson", hex: "#e6194B" },
        { label: "maroon", hex: "#800000" },
        { label: "teal", hex: "#469990" },
      ].sort((a, b) => a.label.localeCompare(b.label)),
      selectedColors: [],
      offscreen: undefined,
    },
    initArr = [
      "offscreen",
      "particleMap",
      "particles",
      "colorRuleMap",
      "timeFactor",
      "thresholdDistance",
      "forceFactor",
    ];
  const particle = (x, y, r, c) => ({
    x: x,
    y: y,
    r: r,
    vx: 0,
    vy: 0,
    color: c,
  });
  const createParticles = (number, color) => {
    let particleGroup = Array.from({ length: number }, (v, i) => i).map(() => {
      let { canvas } = config.ctx,
        r = getRandomFromRange(2, 3),
        x = getRandomFromRange(0, canvas.width - r),
        y = getRandomFromRange(0, canvas.height - r);
      return particle(x, y, r, color);
    });
    config.particles = [...config.particles, ...particleGroup];
    return particleGroup;
  };
  const createParticleMap = () => {
    config.selectedColors.map(({ name, hex }) => {
      config.particleMap[name] = createParticles(
        getRandomFromRange(config.minParticles, config.maxParticles),
        hex
      );
    });
  };
  const createColorRuleMap = () => {
    config.selectedColors.flatMap((color1) => {
      config.selectedColors.map((color2) => {
        // if (color1.name !== color2.name) {
        config.colorRuleMap.push({
          color1: color1.name,
          color2: color2.name,
          hex1: color1.hex,
          hex2: color2.hex,
          direction: getRandomFloat(),
        });
        // }
      });
    });
  };
  const init = () => {
    config.offscreen = new OffscreenCanvas(
      config.ctx.canvas.width,
      config.ctx.canvas.height
    );
    createParticleMap();
    createColorRuleMap();
    forceBasedWorker.postMessage(
      {
        message: "init",
        ...initArr.reduce((acc, val) => {
          acc[val] = config[val];
          return acc;
        }, {}),
      },
      [config.offscreen]
    );
    // add an event listener for messages from the worker
    forceBasedWorker.addEventListener("message", (event) => {
      // console.log("from main", event);
      // get the bitmap from the event
      const bitmap = event.data;
      // draw the bitmap on the canvas
      config.ctx.drawImage(bitmap, 0, 0);
    });
  };
  const addColor = (color) => {
    console.log(color);
    if (color.value) {
      config.selectedColors = [
        ...config.selectedColors,
        { name: color.label, hex: color.value },
      ];
      let colorRuleMap = [],
        group = createParticles(
          getRandomFromRange(config.minParticles, config.maxParticles),
          color.value
        );
      colorRuleMap = [
        ...colorRuleMap,
        {
          color1: color.label,
          color2: color.label,
          hex1: color.value,
          hex2: color.value,
          direction: getRandomFloat(),
        },
      ];
      config.selectedColors.map(({ name, hex }) => {
        if (name !== color.label) {
          colorRuleMap = [
            ...colorRuleMap,
            {
              color1: color.label,
              color2: name,
              hex1: color.value,
              hex2: hex,
              direction: getRandomFloat(),
            },
            {
              color1: name,
              color2: color.label,
              hex1: hex,
              hex2: color.value,
              direction: getRandomFloat(),
            },
          ];
        }
      });
      config.colorRuleMap = [...config.colorRuleMap, ...colorRuleMap];
      forceBasedWorker.postMessage({
        message: "addColor",
        particles: group,
        particleMap: { [color.label]: group },
        colorRuleMap: colorRuleMap,
      });
    }
  };
  const updateTimeFactor = (timeFactor) => {
    config.timeFactor = timeFactor;
    forceBasedWorker.postMessage({
      message: "updateTimeFactor",
      timeFactor: timeFactor,
    });
  };
  const start = () => forceBasedWorker.postMessage({ message: "start" });
  const setup = (params) => {
    for (const key in params) {
      config[key] = params[key];
    }
    console.log(params);
  };

  return {
    setup,
    init,
    start,
    addColor,
    updateTimeFactor,
  };
})();
