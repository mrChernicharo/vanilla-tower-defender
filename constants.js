import { svg } from "./lib/dom-selects";

export const COLS = 5;
export const ROWS = 12;

export const FIRST_WAVE_AT_ROW = 2;

export const sceneRect = svg.getBoundingClientRect();
export const tileWidth = sceneRect.width / 6;
export const MARGIN = tileWidth / 2;

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

export const TOWERS = {
  fire: {
    name: "fire",
    damage: 50,
    range: 160,
    rate_of_fire: 2,
    xp: 0,
    fill: "red",
    price: 100,
    bullet_speed: 180,
  },
  ice: {
    name: "ice",
    damage: 10,
    range: 200,
    rate_of_fire: 3,
    xp: 0,
    fill: "dodgerblue",
    price: 80,
    bullet_speed: 140,
  },
  lightning: {
    name: "lightning",
    damage: 60,
    range: 250,
    rate_of_fire: 1,
    xp: 0,
    fill: "yellow",
    price: 120,
    bullet_speed: 200,
  },
  earth: {
    name: "earth",
    damage: 30,
    range: 140,
    rate_of_fire: 4,
    xp: 0,
    fill: "brown",
    price: 60,
    bullet_speed: 100,
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

export const STAGE_WAVES = {
  1: {
    stage: { number: 1, name: "cozy hills", firstWaveAtRow: 2 },
    waves: [
      [
        // 0
        { type: "goblin", lane: "left", delay: 0 },
        { type: "orc", lane: "right", delay: 2 },
        { type: "goblin", lane: "left", delay: 4 },
        { type: "goblin", lane: "right", delay: 8 },
        { type: "goblin", lane: "left", delay: 10 },
        { type: "goblin", lane: "right", delay: 12 },
        { type: "orc", lane: "center", delay: 6 },
        { type: "orc", lane: "center", delay: 12 },
      ],
      [
        // 1
        { type: "troll", lane: "center", delay: 0 },
        { type: "goblin", lane: "right", delay: 5 },
        { type: "troll", lane: "center", delay: 10 },
        { type: "goblin", lane: "left", delay: 15 },
        { type: "troll", lane: "center", delay: 20 },
      ],
      [
        // 2
        { type: "goblin", lane: "left", delay: 0 },
        { type: "goblin", lane: "right", delay: 2 },
        { type: "goblin", lane: "left", delay: 4 },
        { type: "goblin", lane: "right", delay: 8 },
        { type: "goblin", lane: "left", delay: 10 },
        { type: "goblin", lane: "right", delay: 12 },
        { type: "orc", lane: "center", delay: 3 },
        { type: "orc", lane: "center", delay: 6 },
        { type: "orc", lane: "center", delay: 9 },
        { type: "orc", lane: "center", delay: 12 },
      ],
      [
        // 3
        { type: "goblin", lane: "left", delay: 0 },
        { type: "goblin", lane: "right", delay: 2 },
        { type: "goblin", lane: "left", delay: 4 },
        { type: "goblin", lane: "right", delay: 8 },
        { type: "goblin", lane: "left", delay: 10 },
        { type: "goblin", lane: "right", delay: 12 },
        { type: "goblin", lane: "left", delay: 14 },
        { type: "goblin", lane: "right", delay: 16 },
        { type: "orc", lane: "center", delay: 6 },
        { type: "orc", lane: "center", delay: 12 },
        { type: "orc", lane: "center", delay: 18 },
      ],

      [
        { type: "goblin", lane: "left", delay: 0 },
        { type: "goblin", lane: "right", delay: 2 },
        { type: "goblin", lane: "left", delay: 4 },
        { type: "goblin", lane: "right", delay: 8 },
        { type: "goblin", lane: "left", delay: 10 },
        { type: "goblin", lane: "right", delay: 12 },
        { type: "orc", lane: "center", delay: 3 },
        { type: "orc", lane: "center", delay: 6 },
        { type: "orc", lane: "center", delay: 9 },
        { type: "orc", lane: "center", delay: 12 },
      ],
      [
        { type: "goblin", lane: "left", delay: 0 },
        { type: "goblin", lane: "right", delay: 2 },
        { type: "goblin", lane: "left", delay: 4 },
        { type: "goblin", lane: "right", delay: 8 },
        { type: "goblin", lane: "left", delay: 10 },
        { type: "goblin", lane: "right", delay: 12 },
        { type: "orc", lane: "center", delay: 3 },
        { type: "orc", lane: "center", delay: 6 },
        { type: "orc", lane: "center", delay: 9 },
        { type: "orc", lane: "center", delay: 12 },
      ],
      [
        { type: "goblin", lane: "left", delay: 0 },
        { type: "goblin", lane: "right", delay: 2 },
        { type: "goblin", lane: "left", delay: 4 },
        { type: "goblin", lane: "right", delay: 8 },
        { type: "goblin", lane: "left", delay: 10 },
        { type: "goblin", lane: "right", delay: 12 },
        { type: "orc", lane: "center", delay: 3 },
        { type: "orc", lane: "center", delay: 6 },
        { type: "orc", lane: "center", delay: 9 },
        { type: "orc", lane: "center", delay: 12 },
      ],
      [
        { type: "goblin", lane: "left", delay: 0 },
        { type: "goblin", lane: "right", delay: 1 },
        { type: "goblin", lane: "left", delay: 2 },
        { type: "goblin", lane: "right", delay: 3 },
        { type: "goblin", lane: "left", delay: 4 },
        { type: "goblin", lane: "right", delay: 5 },
        { type: "goblin", lane: "left", delay: 6 },
        { type: "goblin", lane: "right", delay: 7 },
        { type: "goblin", lane: "left", delay: 8 },
        { type: "goblin", lane: "right", delay: 9 },
        { type: "goblin", lane: "left", delay: 10 },
        { type: "goblin", lane: "right", delay: 11 },
        { type: "orc", lane: "center", delay: 3 },
        { type: "orc", lane: "center", delay: 6 },
        { type: "orc", lane: "center", delay: 9 },
        { type: "orc", lane: "center", delay: 12 },
      ],
      [
        { type: "goblin", lane: "left", delay: 0 },
        { type: "goblin", lane: "right", delay: 1 },
        { type: "goblin", lane: "left", delay: 2 },
        { type: "goblin", lane: "right", delay: 3 },
        { type: "goblin", lane: "left", delay: 4 },
        { type: "goblin", lane: "right", delay: 5 },
        { type: "goblin", lane: "left", delay: 6 },
        { type: "goblin", lane: "right", delay: 7 },
        { type: "goblin", lane: "left", delay: 8 },
        { type: "goblin", lane: "right", delay: 9 },
        { type: "goblin", lane: "left", delay: 10 },
        { type: "goblin", lane: "right", delay: 11 },
        { type: "orc", lane: "center", delay: 3 },
        { type: "orc", lane: "center", delay: 6 },
        { type: "orc", lane: "center", delay: 9 },
        { type: "orc", lane: "center", delay: 12 },
      ],
    ],
  },
};
