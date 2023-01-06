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
  selectedTile: null,
  lastSelectedTile: null,
  isPlaying: false,
  stageNumber: 1,
  waveNumber: null,
  wavesData: [{ s: 0, e: null }],
  sceneRect: null,
  gameSpeed: 2,
};

const svg = document.querySelector("svg");
const scene = document.querySelector("#scene");
const playPauseBtn = document.querySelector("#play-pause-btn");
const gameSpeedForm = document.querySelector("#game-speed-form");

const sceneRect = svg.getBoundingClientRect();
const tileWidth = sceneRect.width / 6;
scene.setAttribute("transform", `translate(${tileWidth / 2},${tileWidth / 2})`);

scene.onpointermove = (e) => {
  G.mouse = { x: e.offsetX, y: e.offsetY };
};
scene.onclick = (e) => {
  G.lastClick = { x: e.offsetX, y: e.offsetY };

  selectTile(e.target.dataset.index);
};
playPauseBtn.onclick = (e) => {
  G.isPlaying = !G.isPlaying;
  const icon = G.isPlaying ? "⏸" : "▶️";
  playPauseBtn.innerHTML = icon;

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
  console.log(e.target.value);
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

function selectTile(index) {
  G.lastSelectedTile = G.selectedTile;
  G.selectedTile = G.tiles[index];

  G.selectedTile.focus();
  G.lastSelectedTile?.blur();
  console.log(G.selectedTile)
}

const getTileColor = (type) => {
  if (type === "path") return "#971";
  const random = Math.floor(Math.random() * 4);
  const greens = ["#060", "#050", "#040", "#030"];
  return greens[random];
};

function createGrid(cols = 5, rows = 12) {
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
        init() {
          this.shape = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
          );
          this.type = row == 0 && col == 2 ? 'path' : 'grass',
          this.fill = getTileColor(this.type)
          this.shape.setAttribute("id", this.id);
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
  console.log(G);
}

function spawnEnemy() {
  const newEnemy = {
    id: G.tick,
    shape: null,
    hp: Math.random() * 800 + 100,
    size: 15,
    pos: {
      x: 0,
      y: 0,
    },
    init() {
      this.shape = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      this.pos.x = sceneRect.width / 2 - this.size / 2;
      this.shape.setAttribute("id", `enemy-${G.tick}`);
      this.shape.setAttribute("cx", parseInt(this.pos.x));
      this.shape.setAttribute("cy", parseInt(this.pos.y));
      this.shape.setAttribute("r", parseInt(this.size));
      this.shape.setAttribute("data-hp", this.hp);
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
  console.log(pos);
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

  if (waveInterval < 0) {
    console.log({ clock: G.clock, tick: G.tick });
    spawnEnemy();
    waveInterval = 120;
  }

  update();

  if (G.isPlaying) {
    requestAnimationFrame(runAnimation);
  }
}

createGrid();
