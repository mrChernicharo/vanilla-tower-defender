import {
  COLS,
  ROWS,
  FIRST_WAVE_AT_ROW,
  MARGIN,
  sceneRect,
  menuIcons,
  tileWidth,
  TOWERS,
  STAGES_AND_WAVES,
  FPS,
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
  addToast,
  focusNoTile,
  getAngle,
  getDistance,
  getDistanceBetweenAngles,
  getIconDirection,
  getMenuType,
  updateFocusedTile,
  updateGoldDisplay,
  updateWaveDisplay,
} from "./lib/helpers";
import { createBullet, resetBullets } from "./lib/bullets";
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
import { G } from "./lib/G";
import { appendGameEvents, handlePlayPause } from "./lib/game-events";

const frameInterval = 1000 / FPS;
let lastFrameTimestamp = performance.now();

export const menuActions = {
  trap: function () {},
  newPath: handleCreateNewPath,
  newTower: handleShowTowerPreview,
  tower: handleTowerOptions,
};

const towerActions = {
  upgrade(tower, towerIdx) {
    console.log("upgrade", { tower, towerIdx });
  },
  sell(tower, towerIdx) {
    console.log("sell", { tower, towerIdx });
    
    G.gold += tower.price;
    G.towers.splice(towerIdx, 1);
    tower.g.remove();
    G.tiles[G.selectedTile.index].hasTower = false;
    focusNoTile();
    hideRing();
    updateGoldDisplay();
  },
  info(tower, towerIdx) {
    console.log("info", { tower, towerIdx });
  },
};

const getCurrWave = () => G.wavesTimes[G.waveNumber];

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

    if (e.target.id === icon.id) {
      // prettier-ignore
      const imagePath = `/assets/icons/check-${TOWERS[getTowerType(icon)].fill}.svg`;

      iconImg.setAttribute("href", imagePath);
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
    updateWaveDisplay(G.waveNumber + 1);
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
  appendIconsListeners(icons, tile, menuType);
}

export function handleTowerSelect(e) {
  // console.log("handleTowerSelect", { e, G });
  Array.from(document.querySelectorAll(".tower-range")).forEach((range) => {
    range.classList.remove("locked");
    range.setAttribute("opacity", 0);
  });

  if (G.lastSelectedTile?.id === G.selectedTile?.id) {
    // console.log("selected same tower");
    if (G.towerPreviewActive) {
      removePreviewTower();
    }
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

export function handleTowerOptions(e) {
  const [_, tileY, tileX] = G.selectedTile.id.split("-");
  const towerId = `tower-${tileY * 100 + 50}-${tileX * 100 + 50}`;

  const towerIdx = G.towers.findIndex((tower) => tower.id === towerId);

  towerActions[e.target.dataset.type](G.towers[towerIdx], towerIdx);
}

export function handleTileSelect(e) {
  // console.log("handleTileSelect", e);
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
    let elapsedSinceLastShot = G.clock - tower.lastShot;
    let farthestEnemy = null;
    let greatestProgress = -Infinity;
    let angle = null;
    let distanceToEnemyInDeg = null;

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

    const targetEnemy = farthestEnemy; // or other strategies?
    const diff = tower.cooldown - elapsedSinceLastShot;
    const freshCooldown = tower.shotsPerSecond * 60;

    if (targetEnemy) {
      angle = getAngle(
        tower.pos.x,
        tower.pos.y,
        targetEnemy.pos.x,
        targetEnemy.pos.y
      );
      distanceToEnemyInDeg = getDistanceBetweenAngles(tower.rotation, angle);
      tower.rotate(angle);
    }
    const enemyInSight = distanceToEnemyInDeg < 10;

    if (tower.cooldown > 0) {
      tower.cooldown = diff;
    } else if (tower.cooldown <= 0 && targetEnemy && enemyInSight) {
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

export function runAnimation(frame) {
  const wave = getCurrWave();

  // spawning enemies
  const nextWave = STAGES_AND_WAVES[G.stageNumber].waves[G.waveNumber] || [];

  nextWave
    .filter(
      (waveEnemy) =>
        !waveEnemy.spawned && G.clock - wave.start > waveEnemy.delay
    )
    .forEach((waveEnemy) => {
      spawnEnemy(waveEnemy);
    });

  // loop running
  if (G.isPlaying) {
    updateClock();
    // TODO: control FPS here
    // console.log({
    //   clock: G.clock,
    //   tick: G.tick,
    //   frameInterval,
    // });

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
      resetTowers();
      resetBullets();
      handlePlayPause();
      playPauseBtn.setAttribute("disabled", true);

      if (G.waveNumber === STAGES_AND_WAVES[G.stageNumber].waves.length - 1) {
        addToast("you won!", "success", 3000);
        setTimeout(() => {
          alert("you won!");
          location.assign("/pages/stage-select.html");
        }, 2000);
      }
    }
  } else {
    // loop paused
    if (G.inBattle && nextWave.some((we) => !we.done)) {
      if (G.castleHP > 0) {
        console.log("paused", {
          clock: G.clock,
          tick: G.tick,
          wavesTimes: G.wavesTimes,
        });
      }
    }
  }
}

appendGameEvents();

setInterval(() => {
  const { tiles, enemies, bullets, ...rest } = G;
  pre.textContent = JSON.stringify(tiles, null, 2);
}, 500);
