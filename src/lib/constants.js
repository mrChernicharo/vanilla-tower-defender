import { svg } from "./dom-selects";

export const FPS = 15;
export const COLS = 5;
export const ROWS = 12;

export const initialGold = 250;
export const initialEmeralds = 50;
export const initialCastleHP = 10;
export const FIRST_WAVE_AT_ROW = 2;

export const sceneRect = svg.getBoundingClientRect();
export const tileWidth = sceneRect.width / 6;
export const MARGIN = tileWidth / 2;

export const menuIcons = {
  trap: [
    {
      id: "mine-trap-icon",
      type: "mine",
      x: 20,
      y: 25,
      color: "gray",
      img: "/assets/icons/bullseye.svg",
    },
    {
      id: "slime-trap-icon",
      type: "slime",
      x: 20,
      y: 125,
      color: "gray",
      img: "/assets/icons/bottle-droplet.svg",
    },
    {
      id: "poison-trap-icon",
      type: "poison",
      x: 130,
      y: 25,
      color: "gray",
      img: "/assets/icons/flask.svg",
    },
    {
      id: "ice-trap-icon",
      type: "ice",
      x: 130,
      y: 125,
      color: "gray",
      img: "/assets/icons/icicles.svg",
    },
  ],
  newPath: [
    {
      id: "shovel-right-icon",
      type: "shovel-right",
      x: 150,
      y: 75,
      color: "red",
      img: "/assets/icons/shovel.svg",
    },
    {
      id: "shovel-left-icon",
      type: "shovel-left",
      x: 0,
      y: 75,
      color: "red",
      img: "/assets/icons/shovel.svg",
    },
    {
      id: "shovel-bottom-icon",
      type: "shovel-bottom",
      x: 75,
      y: 150,
      color: "red",
      img: "/assets/icons/shovel.svg",
    },
  ],
  tower: [
    {
      id: "upgrade-icon",
      type: "upgrade",
      x: 75,
      y: 0,
      color: "#7a2",
      img: "/assets/icons/arrow-up.svg",
    },
    {
      id: "sell-icon",
      type: "acid",
      x: 20,
      y: 125,
      color: "gold",
      img: "/assets/icons/sack-dollar.svg",
    },
    {
      id: "info-icon",
      type: "ice",
      x: 130,
      y: 125,
      color: "gray",
      img: "/assets/icons/book.svg",
    },
  ],
  newTower: [
    {
      id: "fire-tower-add-icon",
      type: "fire",
      x: 75,
      y: 0,
      color: "red",
      img: "/assets/icons/fire.svg",
    },
    {
      id: "lightning-tower-add-icon",
      type: "lightning",
      x: 150,
      y: 75,
      color: "gold",
      img: "/assets/icons/bolt.svg",
    },
    {
      id: "ice-tower-add-icon",
      type: "ice",
      x: 0,
      y: 75,
      color: "dodgerblue",
      img: "/assets/icons/snowflake.svg",
    },
    {
      id: "earth-tower-add-icon",
      type: "earth",
      x: 75,
      y: 150,
      color: "orange",
      img: "/assets/icons/mountain.svg",
    },
  ],
};

export const TOWERS = {
  fire: {
    name: "fire",
    damage: 40,
    range: 160,
    rate_of_fire: 2,
    xp: 0,
    fill: "red",
    price: 100,
    bullet_speed: 180,
    img: "/assets/sprites/fire-tower.svg",
  },
  ice: {
    name: "ice",
    damage: 20,
    range: 200,
    rate_of_fire: 3,
    xp: 0,
    fill: "dodgerblue",
    price: 100,
    bullet_speed: 140,
    img: "/assets/sprites/ice-tower.svg",
  },
  lightning: {
    name: "lightning",
    damage: 75,
    range: 250,
    rate_of_fire: 1,
    xp: 0,
    fill: "gold",
    price: 100,
    bullet_speed: 200,
    img: "/assets/sprites/lightning-tower.svg",
  },
  earth: {
    name: "earth",
    damage: 30,
    range: 140,
    rate_of_fire: 4,
    xp: 0,
    fill: "brown",
    price: 100,
    bullet_speed: 100,
    img: "/assets/sprites/earth-tower.svg",
  },
};

export const ENEMIES = {
  goblin: {
    name: "goblin",
    speed: 10,
    hp: 100,
    gold: 4,
    fill: "forestgreen",
    size: 6,
  },
  orc: {
    name: "orc",
    speed: 8,
    hp: 200,
    gold: 7,
    fill: "darkgreen",
    size: 8,
  },
  troll: {
    name: "troll",
    speed: 5,
    hp: 500,
    gold: 20,
    fill: "#041",
    size: 12,
  },
  dragon: {
    name: "dragon",
    speed: 2.5,
    hp: 2500,
    gold: 20,
    fill: "red",
    size: 15,
  },
};

export const STAGES_AND_WAVES = {
  1: {
    stage: { number: 1, name: "cozy hills", firstWaveAtRow: 2 },
    // waves:
    // [
    //   // 0
    //   [{ type: "goblin", lane: "left", delay: 0 }],
    //   // 1
    //   [{ type: "troll", lane: "center", delay: 0 }],
    //   // 2
    //   [{ type: "goblin", lane: "left", delay: 0 }],
    //   // 3
    //   [{ type: "goblin", lane: "left", delay: 0 }],
    //   // 4
    //   [{ type: "goblin", lane: "left", delay: 0 }],
    //   // 5
    //   [{ type: "goblin", lane: "left", delay: 0 }],
    //   // 6
    //   [{ type: "goblin", lane: "left", delay: 0 }],
    //   //7
    //   [
    //     { type: "orc", lane: "center", delay: 0 },
    //     { type: "orc", lane: "center", delay: 0 },
    //     { type: "troll", lane: "center", delay: 0 },
    //   ],
    //   // 8
    //   [{ type: "troll", lane: "center", delay: 0 }],
    //   [{ type: "dragon", lane: "center", delay: 0 }],
    // ],

    // waves: [
    //   // 1
    //   [
    //     { type: "goblin", lane: "left", delay: 0 },
    //     { type: "goblin", lane: "right", delay: 3 },
    //     { type: "goblin", lane: "right", delay: 5 },
    //     { type: "goblin", lane: "right", delay: 8 },
    //     { type: "goblin", lane: "left", delay: 10 },
    //     { type: "goblin", lane: "left", delay: 13 },
    //     { type: "goblin", lane: "left", delay: 16 },
    //     { type: "goblin", lane: "left", delay: 18 },
    //     { type: "goblin", lane: "left", delay: 21 },
    //     { type: "orc", lane: "center", delay: 12 },
    //     { type: "goblin", lane: "left", delay: 25 },
    //     { type: "goblin", lane: "left", delay: 28 },
    //     { type: "goblin", lane: "left", delay: 29 },
    //     { type: "goblin", lane: "left", delay: 32 },
    //     { type: "goblin", lane: "left", delay: 35 },
    //     { type: "orc", lane: "center", delay: 38 },

    //   ],
    //   // 2
    //   [
    //     { type: "goblin", lane: "left", delay: 0 },
    //     { type: "goblin", lane: "right", delay: 8 },
    //     { type: "orc", lane: "center", delay: 12 },
    //   ],
    //   // 3
    //   [
    //     { type: "goblin", lane: "left", delay: 0 },
    //     { type: "goblin", lane: "left", delay: 10 },
    //     { type: "goblin", lane: "right", delay: 12 },
    //     { type: "orc", lane: "center", delay: 9 },
    //   ],
    //   // 4
    //   [
    //     { type: "goblin", lane: "right", delay: 2 },
    //     { type: "goblin", lane: "left", delay: 4 },
    //     { type: "goblin", lane: "right", delay: 12 },
    //     { type: "orc", lane: "center", delay: 3 },
    //     { type: "orc", lane: "center", delay: 9 },
    //     { type: "orc", lane: "center", delay: 12 },
    //   ],
    //   // 5
    //   [
    //     { type: "goblin", lane: "left", delay: 0 },
    //     { type: "goblin", lane: "right", delay: 2 },
    //     { type: "goblin", lane: "left", delay: 4 },
    //     { type: "goblin", lane: "right", delay: 8 },
    //     { type: "goblin", lane: "left", delay: 10 },
    //     { type: "goblin", lane: "right", delay: 12 },
    //     { type: "orc", lane: "center", delay: 3 },
    //     { type: "orc", lane: "center", delay: 6 },
    //     { type: "orc", lane: "center", delay: 9 },
    //     { type: "orc", lane: "center", delay: 12 },
    //   ],
    //   // 6
    //   [
    //     { type: "goblin", lane: "left", delay: 0 },
    //     { type: "goblin", lane: "right", delay: 2 },
    //     { type: "goblin", lane: "left", delay: 4 },
    //     { type: "goblin", lane: "right", delay: 8 },
    //     { type: "goblin", lane: "left", delay: 10 },
    //     { type: "goblin", lane: "right", delay: 12 },
    //     { type: "orc", lane: "center", delay: 3 },
    //     { type: "orc", lane: "center", delay: 6 },
    //     { type: "orc", lane: "center", delay: 9 },
    //     { type: "orc", lane: "center", delay: 12 },
    //   ],
    //   // 7
    //   [
    //     { type: "goblin", lane: "left", delay: 0 },
    //     { type: "goblin", lane: "right", delay: 2 },
    //     { type: "goblin", lane: "left", delay: 4 },
    //     { type: "goblin", lane: "right", delay: 8 },
    //     { type: "goblin", lane: "left", delay: 10 },
    //     { type: "goblin", lane: "right", delay: 12 },
    //     { type: "orc", lane: "center", delay: 3 },
    //     { type: "orc", lane: "center", delay: 6 },
    //     { type: "orc", lane: "center", delay: 9 },
    //     { type: "orc", lane: "center", delay: 12 },
    //   ],
    //   // 8
    //   [
    //     { type: "goblin", lane: "left", delay: 0 },
    //     { type: "goblin", lane: "right", delay: 2 },
    //     { type: "goblin", lane: "left", delay: 4 },
    //     { type: "goblin", lane: "right", delay: 8 },
    //     { type: "goblin", lane: "left", delay: 10 },
    //     { type: "goblin", lane: "right", delay: 12 },
    //     { type: "orc", lane: "center", delay: 3 },
    //     { type: "orc", lane: "center", delay: 6 },
    //     { type: "orc", lane: "center", delay: 9 },
    //     { type: "orc", lane: "center", delay: 12 },
    //   ],
    // ],

    waves: [
      // 0
      [
        { type: "goblin", lane: "left", delay: 0 },
        { type: "goblin", lane: "left", delay: 2 },
        { type: "goblin", lane: "left", delay: 4 },
        { type: "goblin", lane: "left", delay: 6 },
        { type: "goblin", lane: "right", delay: 8 },
        { type: "goblin", lane: "left", delay: 10 },
        { type: "goblin", lane: "right", delay: 12 },
        { type: "goblin", lane: "right", delay: 14 },
        { type: "goblin", lane: "right", delay: 16 },
        { type: "goblin", lane: "right", delay: 18 },
        { type: "goblin", lane: "right", delay: 20 },
        { type: "orc", lane: "center", delay: 7 },
        { type: "orc", lane: "center", delay: 14 },
        { type: "orc", lane: "center", delay: 21 },
      ],
      // 1
      [
        { type: "troll", lane: "center", delay: 0 },
        { type: "goblin", lane: "right", delay: 5 },
        { type: "troll", lane: "center", delay: 10 },
        { type: "goblin", lane: "left", delay: 15 },
        { type: "troll", lane: "center", delay: 20 },
      ],
      // 2
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
      // 3
      [
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
        // 4
        { type: "goblin", lane: "left", delay: 0 },
        { type: "goblin", lane: "right", delay: 2 },
        { type: "goblin", lane: "left", delay: 4 },
        { type: "goblin", lane: "right", delay: 8 },
        { type: "goblin", lane: "left", delay: 10 },
        { type: "goblin", lane: "right", delay: 12 },
        { type: "goblin", lane: "left", delay: 14 },
        { type: "goblin", lane: "right", delay: 16 },
        { type: "orc", lane: "center", delay: 3 },
        { type: "orc", lane: "center", delay: 6 },
        { type: "orc", lane: "center", delay: 9 },
        { type: "orc", lane: "center", delay: 12 },
        { type: "troll", lane: "center", delay: 20 },
      ],
      // 5
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
      // 6
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
      //7
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
        { type: "goblin", lane: "left", delay: 14 },
        { type: "goblin", lane: "right", delay: 16 },
        { type: "orc", lane: "center", delay: 3 },
        { type: "orc", lane: "center", delay: 6 },
        { type: "orc", lane: "center", delay: 9 },
        { type: "orc", lane: "center", delay: 12 },
        { type: "orc", lane: "center", delay: 16 },
        { type: "troll", lane: "center", delay: 20 },
      ],
      // 8
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
        { type: "goblin", lane: "left", delay: 14 },
        { type: "goblin", lane: "right", delay: 16 },
        { type: "orc", lane: "center", delay: 3 },
        { type: "orc", lane: "center", delay: 6 },
        { type: "orc", lane: "center", delay: 9 },
        { type: "orc", lane: "center", delay: 12 },
        { type: "orc", lane: "center", delay: 16 },
        { type: "troll", lane: "center", delay: 20 },
      ],
      [
        { type: "dragon", lane: "center", delay: 0 },
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
        { type: "orc", lane: "center", delay: 15 },
        { type: "orc", lane: "center", delay: 18 },
        { type: "orc", lane: "center", delay: 21 },
        { type: "orc", lane: "center", delay: 24 },
      ],
    ],
  },
};
