import {
  COLS,
  ROWS,
  FIRST_WAVE_AT_ROW,
  MARGIN,
  sceneRect,
  menuIcons,
  tileWidth,
  TOWERS,
  STAGE_WAVES,
} from "./lib/constants";
import {
  pre,
  enemiesG,
  bulletsG,
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
} from "./lib/helpers";
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
import { getTowerType, resetTowers } from "./lib/towers";

let playPauseIcon = "▶️";
export const G = {
  frameId: 0,
  tick: 0,
  clock: 0,
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
  handlePlayPause();
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

const getCurrWave = () => G.wavesTimes[G.waveNumber];

function handlePlayPause() {
  G.isPlaying = !G.isPlaying;
  playPauseIcon = G.isPlaying ? "⏸" : "▶️";
  playPauseBtn.innerHTML = playPauseIcon;

  if (G.isPlaying) {
    G.frameId = requestAnimationFrame(runAnimation);
  } else {
    cancelAnimationFrame(G.frameId);
  }
}

function updateClock() {
  G.tick += G.gameSpeed;
  G.clock = G.tick / 60;
}

function addNewToWavesTimes(tile) {
  const newWaveInfo = { start: G.clock, end: null };
  G.waveNumber = tile.pos.y / tileWidth - FIRST_WAVE_AT_ROW;
  G.wavesTimes[G.waveNumber] = newWaveInfo;
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
      iconImg.setAttribute("href", "/assets/check.svg");
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
    addNewToWavesTimes(newTile);
    playPauseBtn.removeAttribute("disabled");
    G.inBattle = true;
    console.log("barrier broken! CALL WAVE", {
      waveNumber: G.waveNumber,
      clock: G.clock,
      wavesTimes: G.wavesTimes,
    });

    updateVisibleTiles(1);
    handlePlayPause();
  }

  const newTileChain = [...G.tileChain];
  const prevTile = newTileChain.pop();
  prevTile.connected = true;

  G.tiles[prevTile.index] = prevTile;
  G.tiles[newTile.index] = newTile;
  G.tileChain = [...newTileChain, prevTile, newTile];

  drawNewPathTile(newTile);
}

function handleDisplayTileMenu(e, tile) {
  // console.log("handleDisplayTileMenu", { tile, inBattle: G.inBattle });

  removeRingIcons();

  if (!tile?.visible) {
    return;
  }
  if (tile?.blocked) {
    return;
  }

  const menuType = getMenuType(tile);
  if (G.inBattle && menuType === "newPath") {
    return;
  }
  const icons = drawRingIcons(menuType, tile);
  console.log(icons, menuType, { icons });
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
  console.log("handleTileSelect", e);
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
    let elapsedSinceLastShot;

    elapsedSinceLastShot = G.clock - tower.lastShot;
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
    const diff = tower.cooldown - elapsedSinceLastShot;
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
    } else if (tower.cooldown <= 0 && targetEnemy) {
      // } else if (targetEnemy?.spawned) {
      tower.cooldown = freshCooldown;
      tower.lastShot = G.clock;

      const newBullet = createBullet(tower, targetEnemy);
      G.bullets.push(newBullet);

      // console.log("SHOOT!", tower.type, {
      //   targetEnemy,
      //   bullet: newBullet,
      //   bullets: G.bullets,
      // });
    }
  }

  for (let [b, bullet] of G.bullets.entries()) {
    bullet.move();
    // prettier-ignore
    const distance = getDistance(bullet.pos.x, bullet.pos.y, bullet.enemy.pos.x, bullet.enemy.pos.y);

    if (distance < bullet.enemy.size) {
      // console.log("HIT!", bullet);
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

function runAnimation(frame) {
  const wave = getCurrWave();

  // spawning enemies
  const nextWave = STAGE_WAVES[G.stageNumber].waves[G.waveNumber] || [];
  console.log();

  const spawningEnemies = nextWave.filter(
    (waveEnemy) => !waveEnemy.spawned && G.clock - wave.start > waveEnemy.delay
  );

  spawningEnemies.forEach((waveEnemy) => {
    spawnEnemy(waveEnemy);
  });

  // loop running
  if (G.isPlaying) {
    updateClock();
    update();
    requestAnimationFrame(runAnimation);

    if (nextWave.every((we) => we.done)) {
      console.log("wave terminated");

      const entryTile = G.tileChain.at(-1);
      delete entryTile.enemyEntrance;
      entryTile.visible = true;
      G.tileChain[G.tileChain.length - 1] = entryTile;
      G.tiles[entryTile.index] = entryTile;

      wave.end = G.clock;
      G.inBattle = false;
      handlePlayPause();
      resetTowers();
      playPauseBtn.setAttribute("disabled", true);

      if (G.waveNumber === STAGE_WAVES[G.stageNumber].waves.length - 1) {
        alert("you won!");
        location.assign("/pages/stage-select.html");
      }
    }
  } else {
    // loop paused

    // simple pause
    if (G.inBattle) {
      if (nextWave.some((we) => !we.done)) {
        console.log("paused", {
          clock: G.clock,
          tick: G.tick,
          wavesTimes: G.wavesTimes,
        });
      }
    }
  }
}

// setInterval(() => {
//   const {
//     isPlaying,
//     inBattle,
//     tick,
//     selectedTile,
//     waveNumber,
//     gameSpeed,
//     clock,
//     towers,
//     wavesTimes,
//   } = G;
//   pre.innerHTML = JSON.stringify(
//     {
//       tick,
//       clock,
//       gameSpeed,
//       waveNumber,
//       isPlaying,
//       inBattle,
//       wavesTimes,
//       towers,
//     },
//     null,
//     2
//   );
// }, 200);
