import {
  menuIcons,
  TILE_WIDTH,
  TOWERS,
  STAGES_AND_WAVES,
  FPS,
  EXPLOSION_RADIUS,
} from "./lib/constants";
import { pre, playPauseBtn, gameOverOverlay } from "./lib/dom-selects";

import {
  addToast,
  getAngle,
  getDistance,
  getDistanceBetweenAngles,
  getNearbyEnemies,
} from "./lib/helpers";
import { createBullet, resetBullets } from "./lib/bullets";
import { spawnEnemy } from "./lib/enemies";
import { handleShowTowerPreview, handleDisplayTileMenu } from "./lib/tile-menu";
import { handleCreateNewPath } from "./lib/tiles";
import { getTowerType, handleTowerActions, resetTowers } from "./lib/towers";
import { G } from "./lib/G";
import { appendGameEvents, handlePlayPause } from "./lib/game-events";

const frameInterval = 1000 / FPS;
let lastFrameTimestamp = performance.now();

export const menuActions = {
  trap: function () {},
  newPath: handleCreateNewPath,
  newTower: handleShowTowerPreview,
  tower: handleTowerActions,
};

const getCurrWave = () => G.wavesTimes[G.waveNumber];

function updateClock() {
  G.tick += G.gameSpeed;
  G.clock = G.tick / 60;
}

function handleWaveEnd() {
  const currentWave = getCurrWave();
  const entryTile = G.tileChain.at(-1);

  delete entryTile.enemyEntrance;
  entryTile.visible = true;
  G.tileChain[G.tileChain.length - 1] = entryTile;
  G.tiles[entryTile.index] = entryTile;

  currentWave.end = G.clock;
  G.inBattle = false;
  resetTowers();
  resetBullets();
  handlePlayPause();
  handleDisplayTileMenu(null, G.selectedTile); // refresh ring-menu
  playPauseBtn.setAttribute("disabled", true);

  if (
    G.waveNumber === STAGES_AND_WAVES[G.stageNumber].waves.length - 1 &&
    G.castleHP > 0
  ) {
    addToast("you won!", "success", 3000);
    setTimeout(() => {
      alert("you won!");
      location.assign("/pages/stage-select.html");
    }, 2000);
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
      tower.rotateTowardsEnemy(angle);
    }
    const enemyInSight = distanceToEnemyInDeg < 10;

    if (tower.cooldown > 0) {
      tower.cooldown = diff;
    } else if (tower.cooldown <= 0 && targetEnemy && enemyInSight) {
      // console.log("SHOOT!");
      tower.cooldown = freshCooldown;
      tower.lastShot = G.clock;

      const newBullet = createBullet(tower, targetEnemy);
      G.bullets.push(newBullet);

    }
  }

  for (let [b, bullet] of G.bullets.entries()) {
    bullet.move();
    // prettier-ignore
    const distance = getDistance(bullet.pos.x, bullet.pos.y, bullet.enemy.pos.x, bullet.enemy.pos.y);

    if (distance < bullet.enemy.size) {
      // console.log("HIT!", bullet);
      // tower.gainXp()
      bullet.hit(bullet.enemy);

      if (bullet.type === "earth") {
        const nearbyEnemies = getNearbyEnemies(bullet, EXPLOSION_RADIUS);
        bullet.handleExplosion(nearbyEnemies);
      }
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
  const currentWave = getCurrWave();

  // spawning enemies
  const nextWave = STAGES_AND_WAVES[G.stageNumber].waves[G.waveNumber] || [];

  nextWave
    .filter(
      (waveEnemy) =>
        !waveEnemy.spawned && G.clock - currentWave.start > waveEnemy.delay
    )
    .forEach((waveEnemy) => {
      spawnEnemy(waveEnemy);
    });

  // loop running
  if (G.isPlaying) {
    // TODO: control FPS here
    updateClock();
    update();
    requestAnimationFrame(runAnimation);

    if (nextWave.every((we) => we.done)) {
      console.log("wave terminated");
      handleWaveEnd();
    }
  }

  if (!G.isPlaying) {
    // loop paused
    if (G.inBattle && nextWave.some((we) => !we.done)) {
      if (G.castleHP > 0) {
        console.log("paused");
      }
      if (G.castleHP <= 0) {
        console.log("game over");
        addToast("you lose!", "danger", 3000);
        gameOverOverlay.classList.remove("hidden");
      }
    }
  }
}

appendGameEvents();

setInterval(() => {
  const { tiles, enemies, bullets, towers, ...rest } = G;
  pre.textContent = JSON.stringify(enemies, null, 2);
}, 100);
