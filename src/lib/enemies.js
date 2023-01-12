import { enemiesG, enemyLanes } from "../lib/dom-selects";
import { getAngle, updateCastleHPDisplay, updateGoldDisplay } from "./helpers";
import { G } from "./G";
import { ENEMIES, STAGE_WAVES } from "./constants";

const getCurrWave = () => STAGE_WAVES[G.stageNumber].waves[G.waveNumber] || [];

export function spawnEnemy(waveEnemy) {
  // const initialPos =
  const newEnemy = {
    id: null,
    type: null,
    lane: null,
    shape: null,
    text: null,
    hp: null,
    fill: null,
    gold: null,
    size: null,
    pos: { x: 0, y: 0 },
    done: false,
    rotation: -90,
    percProgress: 0,
    speed: 1,
    progress: 0,
    init() {
      this.shape = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polygon"
      );
      this.text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );

      this.type = waveEnemy.type;
      this.lane = enemyLanes[waveEnemy.lane];
      this.speed = ENEMIES[this.type].speed;
      this.fill = ENEMIES[this.type].fill;
      this.hp = ENEMIES[this.type].hp;
      this.size = ENEMIES[this.type].size;
      this.gold = ENEMIES[this.type].gold;

      this.id = `enemy-${this.type}-${G.tick}-${Math.random() * 100}`;
      waveEnemy.id = this.id;
      waveEnemy.spawned = true;
      // const enemyPath = this.lane;
      // this.pos = enemyPath.getPointAtLength(0)

      this.shape.setAttribute("id", this.id);
      this.shape.setAttribute("points", this.getPoints());
      this.shape.setAttribute("data-hp", this.hp);
      this.shape.setAttribute("data-entity", "enemy");
      this.shape.setAttribute("fill", this.fill);

      this.text.setAttribute("x", this.pos.x);
      this.text.setAttribute("y", this.pos.y + 15);
      this.text.textContent = this.hp.toFixed(0);

      enemiesG.append(this.shape);
      enemiesG.append(this.text);
      this.move();
    },
    getPoints() {
      const { x, y } = this.pos;
      const points = [
        { x: x + this.size * 2, y },
        { x: x - this.size, y: y + this.size },
        { x: x - this.size, y: y - this.size },
        { x: x + this.size * 2, y },
      ];
      return points.map((p) => `${parseInt(p.x)} ${parseInt(p.y)} `).join("");
    },
    move() {
      const prog =
        this.lane.getTotalLength() -
        (this.lane.getTotalLength() -
          (this.progress + this.speed * G.gameSpeed * 0.05));

      const nextPos = this.lane.getPointAtLength(
        this.lane.getTotalLength() - prog
      );

      // get enemy facing angle: find angle considering pos and nextPos
      this.rotation = getAngle(this.pos.x, this.pos.y, nextPos.x, nextPos.y);

      // update enemies' progress
      this.percProgress = (prog / this.lane.getTotalLength()) * 100;
      this.progress = prog;
      this.pos.x = nextPos.x;
      this.pos.y = nextPos.y;
      this.text.setAttribute("x", nextPos.x);
      this.text.setAttribute("y", nextPos.y + 15);
      this.text.textContent = this.hp.toFixed(0);

      this.shape.setAttribute(
        "transform",
        `translate(${nextPos.x},${nextPos.y})
        rotate(${this.rotation})`
      );
    },
    die() {
      this.done = true;
      const waveEnemy = getCurrWave().find((we) => we.id === this.id);
      waveEnemy.done = true;
      G.enemies = G.enemies.filter((e) => e.id !== this.id);
      this.text.remove();
      this.shape.remove();
      updateGoldDisplay(this.gold)
    },
    finish() {
      this.done = true;
      const waveEnemy = getCurrWave().find((we) => we.id === this.id);
      waveEnemy.done = true;
      G.enemies = G.enemies.filter((e) => e.id !== this.id);
      this.text.remove();
      this.shape.remove();
      updateCastleHPDisplay(1)
    },
  };

  newEnemy.init();
  G.enemies.push(newEnemy);
}
