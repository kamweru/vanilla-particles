import { Environment } from "./functions/foodPoison.js";
import { interpolate, uuid } from "./lib/utils.js";
let canvas = document.querySelector("canvas"),
  app = document.querySelector("#container"),
  inputField = document.querySelector("#input-field"),
  startButton = document.getElementById("start"),
  stopButton = document.getElementById("stop"),
  startRecordingButton = document.getElementById("startRecording"),
  stopRecordingButton = document.getElementById("stopRecording"),
  recorderStatus = document.getElementById("recorder"),
  inputs = {
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
  };

startButton.addEventListener("click", () => {
  Environment.init(canvas);
  Environment.step();
});
stopButton.addEventListener("click", () => {
  Environment.stop();
});

// Create an HTML string
let html = "";

for (let input of Object.values(inputs)) {
  let { value, min, max, step, id } = input;
  html += interpolate(inputField.innerHTML, { value, min, max, step, id });
}

// Add the HTML to the UI
app.insertAdjacentHTML("beforeend", html);
// https://stackoverflow.com/questions/29182244/convert-a-string-to-a-template-string/
let projectSetup = {};
for (let input of Object.keys(inputs)) {
  let { id } = inputs[input];
  let inputField = document.getElementById(id);
  projectSetup[input] = inputs[input].value * 1;
  inputField.addEventListener("input", () => {
    inputs[input].value = inputField.value * 1;
    Environment.setup({ [input]: inputs[input].value * 1 });
  });
}
Environment.setup(projectSetup);

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

startRecordingButton.addEventListener("click", startRecording);
stopRecordingButton.addEventListener("click", stopRecording);
