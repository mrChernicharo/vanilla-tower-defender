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
  enemiesG,
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
  focusNoTile,
  updateFocusedTile,
  showRing,
  hideRing,
  drawRingIcons,
  appendIconsListeners,
  removeRingIcons,
  getAngle,
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
  tiles: null,
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
G.tiles = createGrid(COLS, ROWS)

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
    focusNoTile();
  }

  // prettier-ignore
  if (e.target.closest(`.ring-icon`) || e.target.closest(`[data-entity="tower"]`)) {
  //   console.log("clicked towerIcon or tower");
  }
  // prettier-ignore
  if (e.target.closest(`[data-entity="tower"]`)) {
    // console.log("clicked tower", { e, towerPreviewActive: G.towerPreviewActive });
  }
  // prettier-ignore
  if (!e.target.closest(`.ring-icon`) && !e.target.closest(`[data-entity="tower"]`)) {
    // console.log("clicked anywhere but not at a towerIcon neither at a tower");
    removePreviewTower();
    G.towerPreviewActive = false;
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
    enemy(e) {},
    tile(e) {
      const { index } = e.target.dataset;
      G.lastSelectedTile = G.selectedTile;
      G.selectedTile = G.tiles[index];
      handleTileSelect(e);
    },
    tower(e) {
      const towerId = e.target.id;
      const [_, y, x] = towerId.split("-").map((v) => Number(v) - 50);
      const tileIdx = x / tileWidth + (y / tileWidth) * COLS;
      const tile = G.tiles[tileIdx];
      G.lastSelectedTile = G.selectedTile;
      G.selectedTile = tile;
      handleTowerSelect(e);
    },
  };
  entityActions[entity](e);
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

function handleShowTowerPreview(e, tile, icon) {
  const towerPos = {
    x: tile.pos.x + tileWidth / 2,
    y: tile.pos.y + tileWidth / 2,
  };
  removePreviewTower();
  drawTowerPreview(towerPos, getTowerType(icon));

  G.towerPreviewActive = true;

  const icons = document.querySelectorAll(".ring-icon");
  Array.from(icons).forEach((icon) => {
    const iconImg = document.querySelector(`#image-${icon.id}`);

    // console.log("clicked icon"); //
    if (e.target.id === icon.id) {
      iconImg.setAttribute("href", "assets/check.svg");
      icon.setAttribute("data-selected", icon.dataset.type);
    }
    // console.log("not clicked");
    else {
      const iconIdx = menuIcons["newTower"].findIndex(
        (i) => i.type === icon.dataset.type
      );
      iconImg.setAttribute("href", menuIcons["newTower"][iconIdx].img);
      icon.getAttribute("data-selected") &&
        icon.removeAttribute("data-selected");
    }
  });
}

function handleCreateNewPath(e, tile, icon) {
  const direction = getIconDirection(icon.dataset.type);

  const adj = getAdjacentTile(G.tiles, tile, direction);
  const barrierBroken =
    direction === "bottom" &&
    adj.pos.y / tileWidth + 1 > FIRST_WAVE_AT_ROW + G.waveNumber;

  const exits = getTileExits(adj);

  // console.log({ barrierBroken });

  const newTile = {
    ...adj,
    type: "path",
    exits,
    ...(barrierBroken && { enemyEntrance: true }),
  };

  if (barrierBroken) {
    G.waveNumber = tile.pos.y / tileWidth - FIRST_WAVE_AT_ROW;
    G.inBattle = true;
  }

  const newTileChain = [...G.tileChain];
  const prevTile = newTileChain.pop();
  prevTile.connected = true;
  if (!barrierBroken) {
    delete prevTile.enemyEntrance;
  }

  G.tiles[prevTile.index] = prevTile;
  G.tiles[newTile.index] = newTile;
  G.tileChain = [...newTileChain, prevTile, newTile];

  drawNewPathTile(newTile);
}

function handleDisplayTileMenu(e, tile) {
  // console.log("handleDisplayTileMenu", tile);

  removeRingIcons();

  if (tile?.blocked) {
    return;
  }

  const menuType = getMenuType(tile);
  // console.log("Open this menu please!", { menuType });
  const icons = drawRingIcons(menuType, tile);
  appendIconsListeners(icons, tile, menuType);
}

function handleTowerSelect(e) {
  // console.log("handleTowerSelect", e, G);
  if (G.lastSelectedTile?.id === G.selectedTile?.id) {
    // console.log("clicked same tile as before");
    focusNoTile();
    hideRing();
  } else {
    updateFocusedTile();
    showRing();
    handleDisplayTileMenu(e, G.selectedTile);
  }
}

function handleTileSelect(e) {
  if (G.selectedTile.hasTower) {
    return handleTowerSelect(e);
  }

  // clicked same tile as before
  if (G.lastSelectedTile?.id === G.selectedTile?.id) {
    // console.log("clicked same tile as before");
    focusNoTile();
    hideRing();
  }
  // clicked another tile
  else {
    updateFocusedTile();
    if (G.selectedTile.blocked) {
      hideRing();
    } else {
      showRing();
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
    pos: { x: 0, y: 0 },
    spawned: false,
    rotation: -90,
    percProgress: 0,
    speed: 1,
    progress: 0,
    init() {
      this.shape = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polygon"
      );
      // this.pos.x = getMiddleX(sceneRect);

      this.shape.setAttribute("id", `enemy-${G.tick}`);
      this.shape.setAttribute("points", this.getPoints());
      this.shape.setAttribute("data-hp", this.hp);
      this.shape.setAttribute("data-entity", "enemy");
      this.shape.setAttribute("fill", "blue");
      this.shape.setAttribute("stroke", "purple");
      enemiesG.append(this.shape);
    },
    getPoints() {
      const { x, y } = this.pos;
      const points = [
        { x: x + 12, y },
        { x: x - 6, y: y + 6 },
        { x: x - 6, y: y - 6 },
        { x: x + 12, y },
      ];

      return points.map((p) => `${parseInt(p.x)} ${parseInt(p.y)} `).join("");
    },
    move() {
      const enemyPath = enemyLaneCenter;
      const prog =
        enemyPath.getTotalLength() -
        (enemyPath.getTotalLength() -
          (this.progress + this.speed * G.gameSpeed));

      const nextPos = enemyPath.getPointAtLength(
        enemyPath.getTotalLength() - prog
      );

      // get enemy facing angle: find angle considering pos and nextPos
      // prettier-ignore
      const angle = getAngle(this.pos.x, this.pos.y, nextPos.x, nextPos.y );

      // // update enemies' progress
      this.percProgress = (prog / enemyPath.getTotalLength()) * 100;
      this.progress = prog;
      this.pos.x = nextPos.x;
      this.pos.y = nextPos.y;
      // this.rotation = angle;
      this.shape.setAttribute(
        "transform",
        `translate(${nextPos.x},${nextPos.y})
        rotate(${angle})
        `
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

    if (enemy.hp <= 0 || enemy.percProgress >= 100) {
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
  if (waveInterval < 0 && G.inBattle) {
    spawnEnemy();
    waveInterval = 120;
  }

  
  if (G.isPlaying) {
    update();
    requestAnimationFrame(runAnimation);
  }
}



// auto-play
// setTimeout(() => {
//   G.isPlaying = true;
//   playPauseIcon = "⏸";
//   playPauseBtn.innerHTML = playPauseIcon;
//   G.frameId = requestAnimationFrame(runAnimation);
//   console.log("auto-play");
// }, 1000);
