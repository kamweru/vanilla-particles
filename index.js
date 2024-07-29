import { config } from "./config/config.js";
import { Environment } from "./functions/foodPoison.js";
import { ParticleSimulation } from "./functions/particleSimulation.js";
import { ForceBased } from "./functions/ForceBased.js";
import { Game } from "./functions/PacMan.js";
import { interpolate, uuid } from "./lib/utils.js";
let canvas = document.querySelector("canvas"),
  app = document.querySelector("#container"),
  controlsBox = document.querySelector("#controls-box"),
  inputField = document.querySelector("#input-field"),
  selectField = document.querySelector("#select-field"),
  rangeField = document.querySelector("#range-field"),
  projectSelectInput = document.querySelector("#project"),
  startButton = document.getElementById("start"),
  stopButton = document.getElementById("stop"),
  startRecordingButton = document.getElementById("startRecording"),
  stopRecordingButton = document.getElementById("stopRecording"),
  recorderStatus = document.getElementById("recorder"),
  selectedProject = "foodPoison",
  projectFunctions = {
    foodPoison: {
      setup: () => {},
      init: () => {},
    },
    particleSim: {
      setup: () => {},
      init: () => {},
    },
    forceBased: {
      setup: (payload) => ForceBased.setup(payload),
      addColor: (payload) => ForceBased.addColor(payload),
      updateTimeFactor: (payload) => ForceBased.updateTimeFactor(payload),
      init: () => {},
    },
  },
  foodPoisonInputs = {
    ENERGY_MULTIPLIER: {
      value: 10,
      min: 10,
      max: 100,
      step: 10,
      id: "energyMultiplier",
    },
    SMELL_RANGE_MULTIPLIER: {
      value: 200,
      min: 10,
      max: 400,
      step: 20,
      id: "smellRangeMultiplier",
    },
    MAX_SPEED_MULTIPLIER: {
      value: 0.05,
      min: 0.01,
      max: 0.1,
      step: 0.01,
      id: "maxSpeedMultiplier",
    },
    MAX_FORCE_MULTIPLIER: {
      value: 5,
      min: 1,
      max: 50,
      step: 1,
      id: "maxForceMultiplier",
    },
    ENERGY_DIVIDER: {
      value: 80,
      min: 5,
      max: 100,
      step: 1,
      id: "energyDivider",
    },
    POPULATION: {
      value: 30,
      min: 5,
      max: 100,
      step: 5,
      id: "population",
    },
    FOOD: {
      value: 20,
      min: 5,
      max: 100,
      step: 5,
      id: "food",
    },
    POISON: {
      value: 20,
      min: 5,
      max: 100,
      step: 5,
      id: "poison",
    },
    MIN_MASS: {
      value: 1.5,
      min: 0.5,
      max: 5,
      step: 0.5,
      id: "minMass",
    },
    MAX_MASS: {
      value: 4.5,
      min: 0.5,
      max: 10,
      step: 0.5,
      id: "maxMass",
    },
    FOOD_MIN_ENERGY: {
      value: 60,
      min: 60,
      max: 120,
      step: 10,
      id: "foodMinEnergy",
    },
    FOOD_MAX_ENERGY: {
      value: 120,
      min: 60,
      max: 120,
      step: 10,
      id: "foodMaxEnergy",
    },
    POISON_MIN_DAMAGE: {
      value: 60,
      min: 60,
      max: 120,
      step: 10,
      id: "poisonMinDamage",
    },
    POISON_MAX_DAMAGE: {
      value: 120,
      min: 60,
      max: 120,
      step: 10,
      id: "poisonMaxDamage",
    },
    CROSSOVER_RATE: {
      value: 0.918,
      min: 0.001,
      max: 1,
      step: 0.001,
      id: "crossoverRate",
    },
    MUTATION_RATE: {
      value: 0.001,
      min: 0.001,
      max: 1,
      step: 0.001,
      id: "mutationRate",
    },
    AVOIDANCE_MULTIPLIER: {
      value: -100,
      min: -100,
      max: 10,
      step: 10,
      id: "avoidanceMultiplier",
    },
    SEPARATION_RANGE: {
      value: 30,
      min: 1,
      max: 100,
      step: 1,
      id: "separationRange",
    },
    LOOK_RANGE: {
      value: 100,
      min: 1,
      max: 500,
      step: 1,
      id: "lookRange",
    },
    SHOAL: {
      value: 0,
      min: 0,
      max: 2,
      step: 1,
      id: "shoal",
    },
  },
  particleSimInputs = {
    n: {
      value: 640,
      min: 100,
      max: 1000,
      step: 100,
      id: "n",
    },
    dt: {
      value: 0.02,
      min: 0.01,
      max: 0.1,
      step: 0.001,
      id: "dt",
    },
    frictionHalfLife: {
      value: 0.04,
      min: 0.01,
      max: 0.1,
      step: 0.01,
      id: "frictionHalfLife",
    },
    rMax: {
      value: 0.1,
      min: 0.1,
      max: 1,
      step: 0.01,
      id: "rMax",
    },
    m: {
      value: 6,
      min: 2,
      max: 50,
      step: 1,
      id: "m",
    },
    frictionFactor: {
      value: 0.5,
      min: 0.01,
      max: 2,
      step: 0.01,
      id: "frictionFactor",
    },
    forceFactor: {
      value: 3,
      min: 1,
      max: 10,
      step: 1,
      id: "forceFactor",
    },
    partitionSize: {
      value: 3,
      min: 1,
      max: 100,
      step: 1,
      id: "partitionSize",
    },
  };
const addProjectOptions = () => {
  for (let project of config.projects.list) {
    let option = document.createElement("option");
    option.value = project.key;
    option.textContent = project.title;
    projectSelectInput.appendChild(option);
  }
  projectSelectInput.value =
    config.projects.list[config.projects.list.length - 1].key;
  selectedProject = config.projects.list[config.projects.list.length - 1].key;
};
addProjectOptions();
const setupInputs = () => {
  let html = "";
  for (let input of config.projects.inputs[selectedProject]) {
    let { id, inputType, value, options, label, min, max, step } = input;
    if (inputType === "select") {
      html += interpolate(selectField.innerHTML, { value, label, id });
      controlsBox.insertAdjacentHTML("beforeend", html);
      let selectInput = document.querySelector(`#${id}`);
      options.forEach((optionItem) => {
        let option = document.createElement("option");
        option.value = optionItem.value;
        option.textContent = optionItem.label;
        selectInput.appendChild(option);
      });
      selectInput.addEventListener("input", () => {
        let selectedOption = options.find(
          (optionItem) => optionItem.value === selectInput.value
        );
        if (selectedProject === "forceBased")
          projectFunctions[selectedProject].addColor(selectedOption);
      });
    }
    if (inputType === "range") {
      html = interpolate(rangeField.innerHTML, {
        value,
        label,
        id,
        min,
        max,
        step,
      });
      controlsBox.insertAdjacentHTML("beforeend", html);
      let rangeInput = document.querySelector(`#${id}`),
        amoutSpan = document.querySelector(`#${id}_amount`);
      amoutSpan.innerText = value;
      rangeInput.addEventListener("input", () => {
        if (selectedProject === "forceBased") {
          projectFunctions[selectedProject].updateTimeFactor(rangeInput.value);
          amoutSpan.innerText = rangeInput.value;
        }
      });
    }
  }
};
setupInputs();
// let html = "",
//   particleSimulation,
//   projectInputs = {
//     foodPoison: foodPoisonInputs,
//     particleSim: particleSimInputs,
//   },
//   projectSetupFunction = {
//     foodPoison: (payload) => Environment.setup(payload),
//     particleSim: (payload) => {
//       ParticleSimulation.setup({
//         ...payload,
//         canvas,
//       });
//       // setup(payload);
//       // particleSimulation = new ParticleSimulation(canvas);
//       // particleSimulation.init();
//     },
//   },
//   projectStartFunction = {
//     foodPoison: () => {
//       Environment.init(canvas);
//       Environment.step();
//     },
//     particleSim: () => {
//       // particleSimulation.start();
//       ParticleSimulation.start();
//     },
//   };

// startButton.addEventListener("click", () => {
//   projectStartFunction[selectedProject]();
// });
// stopButton.addEventListener("click", () => {
//   particleSimulation.stop();
// });

// // particleSimulation.start();
// // Create an HTML string

// for (let input of Object.values(projectInputs[selectedProject])) {
//   let { value, min, max, step, id } = input;
//   html += interpolate(inputField.innerHTML, { value, min, max, step, id });
// }

// // Add the HTML to the UI
// app.insertAdjacentHTML("beforeend", html);
// // https://stackoverflow.com/questions/29182244/convert-a-string-to-a-template-string/
// let projectSetup = {};
// for (let input of Object.keys(projectInputs[selectedProject])) {
//   let { id } = projectInputs[selectedProject][input];
//   let inputField = document.getElementById(id);
//   projectSetup[input] = projectInputs[selectedProject][input].value * 1;
//   inputField.addEventListener("input", () => {
//     projectInputs[selectedProject][input].value = inputField.value * 1;
//     projectSetupFunction[selectedProject]({
//       [input]: projectInputs[selectedProject][input].value * 1,
//     });
//     // Environment.setup({ [input]: projectInputs[selectedProject][input].value * 1 });
//   });
// }
// // Environment.setup(projectSetup);
// projectSetupFunction[selectedProject](projectSetup);

let mediaRecorder;
recorderStatus.innerText = "inactive";
const mediaStream = () => {
  const stream = canvas.captureStream();
  // Create a MediaRecorder instance
  const options = {
    mimeType: "video/webm; codecs=vp9",
    videoBitsPerSecond: 2500000,
  };
  mediaRecorder = new MediaRecorder(stream, options);

  const chunks = [];
  // Handle data available event
  mediaRecorder.addEventListener("dataavailable", ({ data }) =>
    chunks.push(data)
  );
  // Handle stop event
  mediaRecorder.addEventListener("stop", async () => {
    const blob = new Blob(chunks, options);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `canvas_video_${uuid(4)}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
};

const startRecording = () => {
  if (!mediaRecorder) mediaStream();
  if (mediaRecorder) mediaRecorder.start();
  recorderStatus.innerText = mediaRecorder.state;
};

const stopRecording = () => {
  if (mediaRecorder) {
    if (mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      recorderStatus.innerText = mediaRecorder.state;
    }
  }
};

// startRecordingButton.addEventListener("click", startRecording);
// stopRecordingButton.addEventListener("click", stopRecording);

// let game = new Game(canvas);
// game.loop();

// const ctx = canvas.getContext("2d");
// ctx.fillStyle = "red";
// ctx.beginPath();
// ctx.ellipse(100, 100, 10, 5, Math.PI / 25, 0, 2 * Math.PI);
// ctx.fill();
//   sector = (context, cx, cy, radius, startangle, endangle) => {
//     context.fillStyle = "red";
//     context.beginPath();
//     context.moveTo(cx, cy);
//     context.arc(cx, cy, radius, startangle, endangle);
//     context.lineTo(cx, cy);
//     context.fill(); // or context.fill()
//   };

// ctx.fillStyle = "red";

// ctx.beginPath();
// ctx.arc(37, 37, 13, Math.PI / 7, -Math.PI / 7, false);
// // ctx.lineTo(31, 37);
// ctx.fill();
// sector(ctx, 307, 307, 50, Math.PI + Math.PI / 8, Math.PI + (3 * Math.PI) / 4);
ForceBased.setup({
  ctx: canvas.getContext("2d"),
});
ForceBased.init();
startRecordingButton.addEventListener("click", ForceBased.start);
