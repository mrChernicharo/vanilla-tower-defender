import {
  COLS,
  ROWS,
  FIRST_WAVE_AT_ROW,
  MARGIN,
  svg,
  scene,
  playPauseBtn,
  gameSpeedForm,
  selectionRing,
  selectionRingG,
  sceneRect,
  menuIcons,
  tileWidth,
  enemyLaneLeft,
  enemyLaneCenter,
  enemyLaneRight,
  TOWERS,
  pre,
} from "./constants";
import {
  canBecomePath,
  getMenuType,
  getMiddleX,
  getTileColor,
  createGrid,
  getTileExits,
  getAdjacentTile,
  getIconDirection,
  getChains,
  getTowerType,
  createPath,
  drawTowerPreview,
  drawNewPathTile,
  removePreviewTower,
  drawRingIcons,
  appendIconsListeners,
  removeRingIcons,
} from "./helpers";

let playPauseIcon = "▶️";
export const G = {
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
  inBattle: false,
  towerPreviewActive: false,
  stageNumber: 1,
  waveNumber: null,
  wavesTimes: [{ s: 0, e: null }],
  gameSpeed: 2,
};

export const menuActions = {
  trap: function () {},
  newPath: handleCreateNewPath,
  newTower: handleShowTowerPreview,
  tower: function () {},
};

scene.setAttribute("transform", `translate(${MARGIN},${MARGIN})`);

setInterval(() => {
  const {
    isPlaying,
    inBattle,
    selectedTile,
    lastSelectedTile,
    towerPreviewActive,
    stageNumber,
    waveNumber,
    gameSpeed,
  } = G;
  pre.innerHTML = JSON.stringify(
    {
      isPlaying,
      inBattle,
      selectedTile: selectedTile?.id ?? null,
      lastSelectedTile: lastSelectedTile?.id ?? null,
      towerPreviewActive,
      stageNumber,
      waveNumber,
      gameSpeed,
    },
    null,
    2
  );
}, 1000);

svg.onpointermove = (e) => {
  G.mouse = { x: e.offsetX, y: e.offsetY };
};
document.onclick = (e) => {
  // console.log(e.composedPath());
  if (!e.target.closest("svg")) {
    selectionRingG.setAttribute("style", "opacity: 0; display: none");
    selectionRing.setAttribute("style", "opacity: 0; display: none");
    G.lastSelectedTile = G.selectedTile;
    G.lastSelectedTile?.blur();
    G.selectedTile = null;
  }

  if (
    e.target.closest(`.ring-icon`) ||
    e.target.closest(`[data-entity="tower"]`)
  ) {
    console.log("clicked towerIcon or tower");
  }
  if (
    !e.target.closest(`.ring-icon`) &&
    !e.target.closest(`[data-entity="tower"]`)
  ) {
    removePreviewTower();
    G.towerPreviewActive = false;

    console.log("clicked elsewhere");
  }
};
svg.onclick = (e) => {
  G.lastClick = { x: e.offsetX - MARGIN, y: e.offsetY - MARGIN };
  // console.log(G.lastClick);
};
scene.onclick = (e) => {
  // console.log(e);
  const entity = e.target.dataset.entity;
  if (!entity) return;

  // console.log(`clicked ${entity}`);
  const entityActions = {
    enemy() {},
    tile() {
      handleTileSelect(e);
    },
    tower() {
      handleTowerSelect(e);
    },
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

function handleTowerSelect(e) {
  // console.log("handleTowerSelect", e);
}

function handleShowTowerPreview(e, tile, icon) {
  removePreviewTower();

  // createTower(towerPos, towerType, true);
  // image.setAttribute("href", G.towerPreviewActive ? 'assets/check.svg' : item.img);
  // icon
  const towerPos = {
    x: tile.pos.x + tileWidth / 2,
    y: tile.pos.y + tileWidth / 2,
  };
  drawTowerPreview(towerPos, getTowerType(icon));

  // const defs =
  G.towerPreviewActive = true;
  const iconImg = document.querySelector(`#image-${icon.id}`);
  // const pattern = iconImg.parentElement;
  // const defs = pattern.parentElement;

  const icons = document.querySelectorAll(".ring-icon");
  Array.from(icons).forEach((icon) => {
    const iconImg = document.querySelector(`#image-${icon.id}`);
    // console.log("clicked");
    if (e.target.id === icon.id) {
      iconImg.setAttribute("href", "assets/check.svg");
      icon.setAttribute("data-selected", icon.dataset.type);
    }
    // console.log("not clicked");
    else {
      const idx = menuIcons["newTower"].findIndex(
        (i) => i.type === icon.dataset.type
      );
      iconImg.setAttribute("href", menuIcons["newTower"][idx].img);
      icon.getAttribute("data-selected") &&
        icon.removeAttribute("data-selected");
    }
    // console.log({ e, icon, iconImg, menuIcons, type: icon.dataset.type });
  });

  // iconImg.remove()
  // const icons = drawRingIcons("newTower", tile);
  // appendIconsListeners(icons, tile, "newTower");

  // iconImg.setAttribute("href", "assets/check.svg");
  // console.log("handle tower preview", {
  //   e,
  //   icon,
  //   iconImg,
  //   defs,
  //   pattern,
  //   icons,
  // });
}

function handleCreateNewPath(e, tile, icon) {
  const barrierBroken =
    tile.pos.y / tileWidth > FIRST_WAVE_AT_ROW + G.waveNumber;
  const direction = getIconDirection(icon.dataset.type);

  const adj = getAdjacentTile(G.tiles, tile, direction);
  const exits = getTileExits(adj);
  // console.log("handleCreateNewPath", tile, icon, adj);

  const newTile = {
    ...adj,
    type: "path",
    exits,
    ...(barrierBroken && { enemyEntrance: true }),
  };

  const newTileChain = [...G.tileChain];
  const prevTile = newTileChain.pop();
  prevTile.connected = true;

  G.tiles[prevTile.index] = prevTile;
  G.tiles[newTile.index] = newTile;
  // getTileExits //////
  G.tileChain = [...newTileChain, prevTile, newTile];

  if (barrierBroken) {
    (G.waveNumber = tile.y / tileWidth - FIRST_WAVE_AT_ROW),
      (G.inBattle = true);
  }

  drawNewPathTile(newTile);
}

function handleDisplayTileMenu(e, tile) {
  console.log("handleDisplayTileMenu", tile);

  removeRingIcons();

  if (tile.blocked) {
    return;
  }

  const menuType = getMenuType(tile);
  const icons = drawRingIcons(menuType, tile);
  appendIconsListeners(icons, tile, menuType);
}

function handleTileSelect(e) {
  const { index } = e.target.dataset;
  G.lastSelectedTile = G.selectedTile;
  G.selectedTile = G.tiles[index];

  // clicked same tile as before
  if (G.lastSelectedTile?.id === G.selectedTile?.id) {
    console.log("clicked same tile as before");
    G.selectedTile = null;
    G.lastSelectedTile.blur();
    selectionRingG.setAttribute("style", "opacity: 0; display: none");
    selectionRing.setAttribute("style", "opacity: 0; display: none");
  }
  // clicked another tile
  else {
    G.lastSelectedTile?.blur();
    G.selectedTile.focus();

    if (G.selectedTile.blocked) {
      console.log("clicked another tile, it is BLOCKED");
      selectionRingG.setAttribute("style", "opacity: 0; display: none");
      selectionRing.setAttribute("style", "opacity: 0; display: none");
    } else {
      console.log("clicked another tile");
      const { x, y } = G.selectedTile.pos;
      selectionRing.setAttribute("transform", `translate(${x},${y})`);
      selectionRing.setAttribute("style", "opacity: .75; display: block");
      selectionRingG.setAttribute("style", "opacity: 1; display: block");
    }
    handleDisplayTileMenu(e, G.selectedTile);
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
      this.pos.x = getMiddleX(sceneRect);
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
G.tiles = createGrid(COLS, ROWS);

// auto-play
setTimeout(() => {
  G.isPlaying = true;
  playPauseIcon = "⏸";
  playPauseBtn.innerHTML = playPauseIcon;
  G.frameId = requestAnimationFrame(runAnimation);
  console.log("auto-play");
}, 1000);
