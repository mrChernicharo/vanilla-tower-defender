export const COLS = 5;
export const ROWS = 12;

export const FIRST_WAVE_AT_ROW = 2;

export const menuIcons = {
  trap: [],
  newPath: [
    {
      id: "shovel-right-icon",
      type: "shovel-right",
      x: 150,
      y: 75,
      color: "red",
      img: "assets/shovel.svg",
    },
    {
      id: "shovel-left-icon",
      type: "shovel-left",
      x: 0,
      y: 75,
      color: "red",
      img: "assets/shovel.svg",
    },
    {
      id: "shovel-bottom-icon",
      type: "shovel-bottom",
      x: 75,
      y: 150,
      color: "red",
      img: "assets/shovel.svg",
    },
  ],
  tower: [],
  newTower: [
    {
      id: "fire-tower-add-icon",
      type: "fire",
      x: 75,
      y: 0,
      color: "red",
      img: "assets/fire.svg",
    },
    {
      id: "lightning-tower-add-icon",
      type: "lightning",
      x: 150,
      y: 75,
      color: "gold",
      img: "assets/bolt.svg",
    },
    {
      id: "ice-tower-add-icon",
      type: "ice",
      x: 0,
      y: 75,
      color: "dodgerblue",
      img: "assets/snowflake.svg",
    },
    {
      id: "earth-tower-add-icon",
      type: "earth",
      x: 75,
      y: 150,
      color: "orange",
      img: "assets/mountain.svg",
    },
  ],
};

export const svg = document.querySelector("svg");
export const scene = document.querySelector("#scene");
export const sceneRect = svg.getBoundingClientRect();
export const tileWidth = sceneRect.width / 6;
export const enemiesG = document.querySelector("#enemies-g");
export const MARGIN = tileWidth / 2;

export const playPauseBtn = document.querySelector("#play-pause-btn");
export const gameSpeedForm = document.querySelector("#game-speed-form");
export const pre = document.querySelector("pre");

export const selectionRing = document.querySelector("#selection-ring");
export const selectionRingG = document.querySelector("#selection-ring-g");

export const enemyLaneLeft = document.querySelector("#enemy-lane-left")
export const enemyLaneCenter = document.querySelector("#enemy-lane-center")
export const enemyLaneRight = document.querySelector("#enemy-lane-right")



export const TOWERS = {
  fire: {
    name: "fire",
    damage: 50,
    range: 160,
    rate_of_fire: 2,
    xp: 0,
    fill: "red",
    price: 100,
    bullet_speed: 100
  },
  ice: {
    name: "ice",
    damage: 40,
    range: 200,
    rate_of_fire: 3,
    xp: 0,
    fill: "dodgerblue",
    price: 80,
    bullet_speed: 100
  },
  lightning: {
    name: "lightning",
    damage: 60,
    range: 250,
    rate_of_fire: 1,
    xp: 0,
    fill: "yellow",
    price: 120,
    bullet_speed: 200
  },
  earth: {
    name: "earth",
    damage: 30,
    range: 140,
    rate_of_fire: 4,
    xp: 0,
    fill: "brown",
    price: 60,
    bullet_speed: 50
  },
};

export const ENEMIES = {
  goblin: {
    name: "goblin",
    speed: 10,
    hp: 100,
    gold: 4,
    fill: "forestgreen",
    size: 5,
  },
  orc: {
    name: "orc",
    speed: 8,
    hp: 200,
    gold: 7,
    fill: "darkgreen",
    size: 7,
  },
  troll: {
    name: "troll",
    speed: 5,
    hp: 500,
    gold: 20,
    fill: "#041",
    size: 10,
  },
};
