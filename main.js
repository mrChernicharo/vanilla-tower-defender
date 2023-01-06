const FIRST_WAVE_AT_ROW = 3;

const menuIcons = {
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

const menuActions = {
  trap: function () {},
  newPath: handleCreateNewPath,
  newTower: handleShowTowerPreview,
  tower: function () {},
};

const G = {
  frameId: 0,
  tick: 0,
  clock: 0,
  loopTimestamp: 0,
  timestamp: Date.now(),
  mouse: { x: null, y: null },
  lastClick: { x: null, y: null },
  enemies: [],
  towers: [],
  bullets: [],
  tiles: [],
  tileChain: [],
  selectedTile: null,
  lastSelectedTile: null,
  isPlaying: false,
  stageNumber: 1,
  waveNumber: null,
  wavesTimes: [{ s: 0, e: null }],
  sceneRect: null,
  gameSpeed: 2,
};

const svg = document.querySelector("svg");
const scene = document.querySelector("#scene");
const playPauseBtn = document.querySelector("#play-pause-btn");
const gameSpeedForm = document.querySelector("#game-speed-form");
const selectionRing = document.querySelector("#selection-ring");
const selectionRingG = document.querySelector("#selection-ring-g");
let playPauseIcon = "▶️";

const sceneRect = svg.getBoundingClientRect();
const tileWidth = sceneRect.width / 6;
const MARGIN = tileWidth / 2;
scene.setAttribute("transform", `translate(${MARGIN},${MARGIN})`);

svg.onpointermove = (e) => {
  G.mouse = { x: e.offsetX, y: e.offsetY };
};
svg.onclick = (e) => {
  G.lastClick = { x: e.offsetX - MARGIN, y: e.offsetY - MARGIN };
  console.log(G.lastClick);
};
scene.onclick = (e) => {
  console.log(e);
  const entity = e.target.dataset.entity;
  if (!entity) return;

  console.log(`clicked ${entity}`);
  const entityActions = {
    enemy() {},
    tile() {
      handleSelectTile(e.target.dataset.index);
    },
    tower() {},
  };

  entityActions[entity]();
};
playPauseBtn.onclick = (e) => {
  G.isPlaying = !G.isPlaying;
  playPauseIcon = G.isPlaying ? "⏸" : "▶️";
  playPauseBtn.innerHTML = playPauseIcon;

  if (G.isPlaying) {
    G.loopTimestamp = 0;
    G.timestamp = Date.now();
    G.tick = 0;
    G.frameId = requestAnimationFrame(runAnimation);
  } else {
    cancelAnimationFrame(G.frameId);
    G.tick = 0;
  }
};
gameSpeedForm.onchange = (e) => {
  e.preventDefault();
  // console.log(e.target.value);
  let speed;
  switch (e.target.value) {
    case "normal":
      speed = 2;
      break;
    case "fast":
      speed = 4;
      break;
    case "faster":
      speed = 8;
      break;
  }
  G.gameSpeed = speed;
};

const getMiddleX = () => sceneRect.width / 2 - MARGIN;
const getTileColor = (type, blocked = false) => {
  if (blocked) return "#444";
  if (type === "path") return "#971";
  const random = Math.floor(Math.random() * 4);
  const greens = ["#060", "#050", "#040", "#030"];
  return greens[random];
};

function handleShowTowerPreview(tile, icon) {
  console.log("handle tower preview", tile, icon);
}

function handleCreateNewPath(tile, icon) {
  console.log("handleCreateNewPath", tile, icon);
  // const barrierBroken = tile.y > firstWaveRow + waveNumber;
}

function handleDisplayTileMenu(tile) {
  console.log("handleDisplayTileMenu", tile);

  const removeRingIcons = () => {
    Array.from(document.querySelectorAll(".ring-icon")).forEach((circle) => {
      circle.removeEventListener("click", menuActions[circle.dataset.type]);
      circle.remove();
    });
    Array.from(document.querySelectorAll(".defs")).forEach((defs) =>
      defs.remove()
    );
  };

  const getMenuType = () => {
    if (tile.type === "path") {
      if (tile.connected) {
        return "trap";
      } else {
        return "newPath";
      }
    } else {
      if (tile.hasTower) {
        return "tower";
      } else {
        return "newTower";
      }
    }
  };

  const drawRingIcons = (menuType) => {
    // const translation = selectionRingG.getAttribute("transform");
    // const [x, y] = translation
    //   .replace(/translate|\(|\)/g, "")
    //   .split(",")
    //   .map(Number);
    const pluckTowerType = (id) => id.split("-")[0];

    const icons = [];
    for (const [i, item] of menuIcons[menuType].entries()) {
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );

      circle.setAttribute("class", `ring-icon`);
      circle.setAttribute("data-entity", `ring-icon`);
      circle.setAttribute("data-type", item.type);
      circle.setAttribute("id", item.id);
      circle.setAttribute("cx", tile.pos.x + item.x);
      circle.setAttribute("cy", tile.pos.y + item.y);
      circle.setAttribute("r", 20);
      circle.setAttribute("stroke", item.color);

      const defs = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "defs"
      );
      const pattern = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "pattern"
      );
      const image = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "image"
      );
      defs.setAttribute("class", "defs");
      const patternId = `${i}-${tile.id}-bg-img`;
      pattern.setAttribute("id", patternId);
      pattern.setAttribute("width", 28);
      pattern.setAttribute("height", 28);
      image.setAttribute("href", item.img);
      image.setAttribute("x", 5);
      image.setAttribute("y", 5);
      image.setAttribute("width", 28);
      image.setAttribute("height", 28);

      pattern.append(image);
      defs.append(pattern);
      selectionRingG.append(defs);

      circle.setAttribute("fill", `url(#${patternId})`);
      selectionRingG.append(circle);

      icons.push(circle);
    }
    return icons;
  };

  const appendIconsListeners = (icons) => {
    icons.forEach(
      (icon) => (icon.onclick = (e) => menuActions[menuType](tile, icon))
    );
  };

  removeRingIcons();

  if (tile.blocked) {
    return;
  }

  const menuType = getMenuType();
  const icons = drawRingIcons(menuType);
  appendIconsListeners(icons);
}

function handleSelectTile(index) {
  G.lastSelectedTile = G.selectedTile;
  G.selectedTile = G.tiles[index];

  if (G.lastSelectedTile?.id === G.selectedTile?.id) {
    G.selectedTile = null;
    G.lastSelectedTile.blur();
    selectionRingG.setAttribute("style", "opacity: 0");
    selectionRing.setAttribute("style", "opacity: 0");
  } else {
    G.lastSelectedTile?.blur();
    G.selectedTile.focus();
    if (G.selectedTile.blocked) {
      selectionRingG.setAttribute("style", "opacity: 0");
      selectionRing.setAttribute("style", "opacity: 0");
    }
    if (!G.selectedTile.blocked) {
      const { x, y } = G.selectedTile.pos;
      selectionRing.setAttribute("transform", `translate(${x},${y})`);
      selectionRing.setAttribute("style", "opacity: .75");
      selectionRingG.setAttribute("style", "opacity: 1");
    }
    handleDisplayTileMenu(G.selectedTile);
  }
}

function createGrid(cols = 5, rows = 12) {
  const isInitialPath = (row, col) => row == 0 && col == 2;
  const isBlocked = (row, col) =>
    (row == 3 && col == 2) || (row == 4 && col == 1);

  // prettier-ignore
  for (let row of Array(rows).fill().map((_, i) => i)) {
    for (let col of Array(cols).fill().map((_, i) => i)) {
      const pos = { x: col * tileWidth, y: row * tileWidth };
      const newTile = {
        index: row * cols + col,
        id: `${row}:${col}`,
        pos,
        shape: null,
        fill: null,
        type: null,
        connected: false,
        hasTower: false,
        blocked: false,
        startingPoint: false,
        exits: null,
        init() {
          this.shape = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
          );
          const isStartingPoint = isInitialPath(row,col);
          this.type = isStartingPoint ? 'path' : 'grass';
          this.blocked = isBlocked(row, col);
          this.startingPoint = isStartingPoint
          this.exits = isStartingPoint ? getTileExits(this): null;
          this.fill = getTileColor(this.type, this.blocked);
          this.shape.setAttribute("id", this.id);
          this.shape.setAttribute("data-entity", "tile");
          this.shape.setAttribute("data-index", this.index);
          this.shape.setAttribute("x", pos.x);
          this.shape.setAttribute("y", pos.y);
          this.shape.setAttribute("height", tileWidth);
          this.shape.setAttribute("width", tileWidth);
          this.shape.setAttribute("fill", this.fill);
          this.shape.setAttribute("opacity", 1);
          scene.append(this.shape);
        },
        focus() {
          this.shape.setAttribute("opacity", 0.4);
          this.shape.setAttribute('style', `filter: drop-shadow(0 0 1rem #04f);`)
        },
        blur() {
          this.shape.setAttribute("opacity", 1);
          this.shape.setAttribute('style', `filter: drop-shadow(0 0 0 #04f);`)
        },
      };
      newTile.init();
      G.tiles.push(newTile);
    }
  }
}

function spawnEnemy() {
  const newEnemy = {
    id: G.tick,
    shape: null,
    hp: Math.random() * 800 + 100,
    size: 13,
    pos: {
      x: 0,
      y: 0,
    },
    init() {
      this.shape = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      this.pos.x = getMiddleX();
      this.shape.setAttribute("id", `enemy-${G.tick}`);
      this.shape.setAttribute("cx", parseInt(this.pos.x));
      this.shape.setAttribute("cy", parseInt(this.pos.y));
      this.shape.setAttribute("r", parseInt(this.size));
      this.shape.setAttribute("data-hp", this.hp);
      this.shape.setAttribute("data-entity", "enemy");
      this.shape.setAttribute("fill", "blue");
      scene.append(this.shape);
    },
    move() {
      this.shape.setAttribute(
        "cy",
        Number(this.shape.getAttribute("cy")) + G.gameSpeed
      );
    },
    die() {
      this.shape.remove();
    },
  };

  newEnemy.init();
  G.enemies.push(newEnemy);
}

function createTower(pos) {
  const newTower = {
    id: G.tick,
    shape: null,
    pos,
    init() {
      this.shape = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      this.shape.setAttribute("id", `enemy-${G.tick}`);
      this.shape.setAttribute("cx", parseInt(this.pos.x));
      this.shape.setAttribute("cy", parseInt(this.pos.y));
      this.shape.setAttribute("data-entity", "tower");
      this.shape.setAttribute("r", 25);

      this.shape.setAttribute("fill", "orange");
      scene.append(this.shape);
    },
  };
  newTower.init();
  G.towers.push(newTower);
}

function update() {
  for (let enemy of G.enemies) {
    enemy.move();
    enemy.hp -= G.gameSpeed;

    if (enemy.hp <= 0) {
      enemy.die();
    }
  }
}

let waveInterval = 120;
function runAnimation(frame) {
  waveInterval -= G.gameSpeed;
  G.tick += G.gameSpeed;
  G.clock = G.tick / 60;

  // spawning enemies
  if (waveInterval < 0) {
    // spawnEnemy();
    waveInterval = 120;
  }

  update();

  if (G.isPlaying) {
    requestAnimationFrame(runAnimation);
  }
}

createGrid();

// auto-play
setTimeout(() => {
  G.isPlaying = true;
  playPauseIcon = "⏸";
  playPauseBtn.innerHTML = playPauseIcon;
  G.frameId = requestAnimationFrame(runAnimation);
  console.log("auto-play");
}, 1000);

function getTileExits(tile) {
  if (tile.startingPoint) {
    console.log("hey", tile, G.tiles, G.tileChain);
    return {
      left: { x: tile.pos.x + 25, y: 0 },
      center: { x: tile.pos.x + 50, y: 0 },
      right: { x: tile.pos.x + 75, y: 0 },
    };
  }

  // return;
  const prevTile = G.tileChain.at(-1);

  const left = { x: 0, y: 0 };
  const center = { x: 0, y: 0 };
  const right = { x: 0, y: 0 };

  // newTile below
  if (prevTile.pos.y < tile.pos.y) {
    left.x = tile.pos.x + 25;
    left.y = tile.pos.y;
    center.x = tile.pos.x + 50;
    center.y = tile.pos.y;
    right.x = tile.pos.x + 75;
    right.y = tile.pos.y;
  }

  // newTile to the left
  if (prevTile.pos.x > tile.pos.x) {
    left.x = tile.pos.x + 100;
    left.y = tile.pos.y + 25;
    center.x = tile.pos.x + 100;
    center.y = tile.pos.y + 50;
    right.x = tile.pos.x + 100;
    right.y = tile.pos.y + 75;
  }

  // newTile to the right
  if (prevTile.pos.x < tile.pos.x) {
    left.x = tile.pos.x;
    left.y = tile.pos.y + 75;
    center.x = tile.pos.x;
    center.y = tile.pos.y + 50;
    right.x = tile.pos.x;
    right.y = tile.pos.y + 25;
  }
  return { left, center, right };
}
