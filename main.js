import {
  COLS,
  ROWS,
  FIRST_WAVE_AT_ROW,
  MARGIN,
  sceneRect,
  menuIcons,
  tileWidth,
  TOWERS,
} from "./constants";
import {
  pre,
  enemiesG,
  bulletsG,
  enemyLaneLeft,
  enemyLaneCenter,
  enemyLaneRight,
  svg,
  scene,
  playPauseBtn,
  gameSpeedForm,
  selectionRing,
  selectionRingG,
} from "./lib/dom-selects";

import {
  focusNoTile,
  getAngle,
  getDistance,
  getIconDirection,
  getMenuType,
  updateFocusedTile,
} from "./helpers";
import { createBullet } from "./lib/bullets";
import { spawnEnemy } from "./lib/enemies";
import {
  appendIconsListeners,
  drawRingIcons,
  drawTowerPreview,
  hideRing,
  removePreviewTower,
  removeRingIcons,
  showRing,
} from "./lib/tile-menu";
import {
  createGrid,
  drawNewPathTile,
  getAdjacentTile,
  getTileExits,
  updateVisibleTiles,
} from "./lib/tiles";
import { getTowerType } from "./lib/towers";

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
  bulletCount: 0,
  tileChain: [],
  selectedTile: null,
  lastSelectedTile: null,
  isPlaying: false,
  inBattle: false,
  towerPreviewActive: false,
  stageNumber: 1,
  waveNumber: null,
  wavesTimes: [{ start: 0, end: null }],
  gameSpeed: 2,
};
G.tiles = createGrid(COLS, ROWS);
updateVisibleTiles();

export const menuActions = {
  trap: function () {},
  newPath: handleCreateNewPath,
  newTower: handleShowTowerPreview,
  tower: function () {},
};

scene.setAttribute("transform", `translate(${MARGIN},${MARGIN})`);

svg.onpointermove = (e) => {
  G.mouse = { x: e.offsetX, y: e.offsetY };
};
document.onclick = (e) => {
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

    if (e.target.closest(`[data-entity="tile"]`) && G.tiles[e.target.closest(`[data-entity="tile"]`).dataset.index].hasTower) {
      // console.log('clicked tile with a tower')
      const { x, y } = G.selectedTile.pos;
      const rangeCircle = document.querySelector(
        `#range-tower-${y + 50}-${x + 50}`
      );
      rangeCircle.classList.add("locked");
      rangeCircle.setAttribute("opacity", .1);
      return
    }
    Array.from(document.querySelectorAll(".tower-range")).forEach((range) => {
      range.classList.remove("locked");
      range.setAttribute('opacity', 0)
    });
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

function updateClock() {
  G.clock =
    G.tick / 60 +
    (G.wavesTimes[G.waveNumber]?.end || 0) -
    (G.wavesTimes[G.waveNumber]?.start || 0);
}

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

  const newTile = {
    ...adj,
    type: "path",
    exits,
    ...(barrierBroken && { enemyEntrance: true }),
  };

  if (barrierBroken) {
    const newWaveInfo = { start: G.clock, end: null };
    G.waveNumber = adj.pos.y / tileWidth - FIRST_WAVE_AT_ROW;
    G.wavesTimes[G.waveNumber] = newWaveInfo;
    G.inBattle = true;
    console.log("barrier broken!", G);
    updateVisibleTiles(1);
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
  // console.log("handleTowerSelect", { e, G });
  Array.from(document.querySelectorAll(".tower-range")).forEach((range) => {
    range.classList.remove("locked");
    range.setAttribute("opacity", 0);
  });

  if (G.lastSelectedTile?.id === G.selectedTile?.id) {
    // console.log("selected same tower");
    if (G.towerPreviewActive) removePreviewTower();
    focusNoTile();
    hideRing();
  } else {
    // console.log("selected different tower");
    removePreviewTower();
    const { x, y } = G.selectedTile.pos;
    const rangeCircle = document.querySelector(
      `#range-tower-${y + 50}-${x + 50}`
    );
    rangeCircle.classList.add("locked");
    rangeCircle.setAttribute("opacity", 0.1);
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

function update() {
  for (let tower of G.towers) {
    const elapsed = G.clock - tower.lastShot;
    let farthestEnemy = null,
      greatestProgress = -Infinity;

    for (let enemy of G.enemies) {
      // prettier-ignore
      const d = getDistance(tower.pos.x, tower.pos.y, enemy.pos.x, enemy.pos.y);
      const enemyInRange = d < tower.range;

      if (enemyInRange) {
        if (enemy.progress > greatestProgress) {
          greatestProgress = enemy.progress;
          farthestEnemy = enemy;
        }
      }
    }

    const targetEnemy = farthestEnemy; // or others
    const diff = tower.cooldown - elapsed;
    const freshCooldown = tower.shotsPerSecond * 60;

    if (targetEnemy) {
      const angle = getAngle(
        tower.pos.x,
        tower.pos.y,
        targetEnemy.pos.x,
        targetEnemy.pos.y
      );
      tower.rotate(angle);
    }

    if (tower.cooldown > 0) {
      tower.cooldown = diff;
    } else if (targetEnemy) {
      // } else if (targetEnemy?.spawned) {
      tower.cooldown = freshCooldown;
      tower.lastShot = G.clock;

      const newBullet = createBullet(tower, targetEnemy);
      G.bullets.push(newBullet);

      console.log("SHOOT!", tower.type, {
        targetEnemy,
        bullet: newBullet,
        bullets: G.bullets,
      });
    }
  }

  for (let [b, bullet] of G.bullets.entries()) {
    bullet.move();
    // prettier-ignore
    const distance = getDistance(bullet.pos.x, bullet.pos.y, bullet.enemy.pos.x, bullet.enemy.pos.y);

    if (distance < bullet.enemy.size / 2) {
      console.log("HIT!", bullet);
      bullet.hit(bullet.enemy);
    }
    if (bullet.enemy.done) {
      bullet.remove();
    }
  }

  for (let enemy of G.enemies) {
    enemy.move();

    if (enemy.hp <= 0) {
      enemy.die();
    }
    if (enemy.percProgress >= 100) {
      enemy.finish();
    }
  }
}

let spawnInterval = 100;
function runAnimation(frame) {
  spawnInterval -= G.gameSpeed;
  G.tick += G.gameSpeed;

  // spawning enemies
  if (spawnInterval < 0 && G.inBattle) {
    const randomLane = [enemyLaneLeft, enemyLaneCenter, enemyLaneRight][
      Math.floor(Math.random() * 3)
    ];
    spawnEnemy("goblin", randomLane);
    spawnInterval = 600;
  }

  // loop running
  if (G.isPlaying && G.inBattle) {
    updateClock();
    update();
    requestAnimationFrame(runAnimation);
  } else {
    // loop paused

    // simple pause
    if (G.inBattle && G.enemies.length) {
      console.log("paused");
    } else {
      console.log("wave terminated");
      G.isPlaying = false;
      G.inBattle = false;
    }

    // G.wavesTimes[G.waveNumber].end = G.clock + G.wavesTimes[G.waveNumber].end;
    G.wavesTimes[G.waveNumber].end = G.clock;
    console.log({ wave: G.waveNumber, wavesTimes: G.wavesTimes });
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

// setInterval(() => {
//   const {
//     isPlaying,
//     inBattle,
//     selectedTile,
//     lastSelectedTile,
//     towerPreviewActive,
//     stageNumber,
//     waveNumber,
//     gameSpeed,
//     clock,
//   } = G;
//   pre.innerHTML = JSON.stringify(
//     {
//       isPlaying,
//       inBattle,
//       selectedTile: selectedTile?.id ?? null,
//       lastSelectedTile: lastSelectedTile?.id ?? null,
//       towerPreviewActive,
//       stageNumber,
//       waveNumber,
//       gameSpeed,
//       clock,
//     },
//     null,
//     2
//   );
// }, 1000);
