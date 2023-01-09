import { enemiesG } from "../constants";
import { getAngle } from "../helpers";
import { G } from "../main";

export function spawnEnemy(enemyType, lane) {
  // const initialPos =
  const newEnemy = {
    id: null,
    type: null,
    lane: null,
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
      this.type = enemyType;
      this.lane = lane;

      this.id = `enemy-${this.type}-${G.tick}-${Math.random() * 100}`;
      // const enemyPath = this.lane;
      // this.pos = enemyPath.getPointAtLength(0)

      this.shape.setAttribute("id", this.id);
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
      const enemyPath = this.lane;
      const prog =
        enemyPath.getTotalLength() -
        (enemyPath.getTotalLength() -
          (this.progress + this.speed * G.gameSpeed));

      const nextPos = enemyPath.getPointAtLength(
        enemyPath.getTotalLength() - prog
      );

      // get enemy facing angle: find angle considering pos and nextPos
      this.rotation = getAngle(this.pos.x, this.pos.y, nextPos.x, nextPos.y);

      // // update enemies' progress
      this.percProgress = (prog / enemyPath.getTotalLength()) * 100;
      this.progress = prog;
      this.pos.x = nextPos.x;
      this.pos.y = nextPos.y;
      this.shape.setAttribute(
        "transform",
        `translate(${nextPos.x},${nextPos.y})
        rotate(${this.rotation})
        `
      );
    },
    die() {
      G.enemies = G.enemies.filter((e) => e.id !== this.id);
      this.shape.remove();
    },
    finish() {
      G.enemies = G.enemies.filter((e) => e.id !== this.id);
      this.shape.remove();
    },
  };

  newEnemy.init();
  G.enemies.push(newEnemy);
}
