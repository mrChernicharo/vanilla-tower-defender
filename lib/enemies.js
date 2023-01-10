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
    text: null,
    hp: Math.random() * 800 + 100,
    size: 12,
    pos: { x: 0, y: 0 },
    spawned: false,
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

      this.text.setAttribute("x", this.pos.x);
      this.text.setAttribute("y", this.pos.y + 15);
      this.text.textContent = this.hp.toFixed(0);

      enemiesG.append(this.shape);
      enemiesG.append(this.text);
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
      const prog =
      this.lane.getTotalLength() -
        (this.lane.getTotalLength() -
          (this.progress + this.speed * G.gameSpeed * 0.1));

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
        rotate(${this.rotation})
        `
      );
    },
    die() {
      this.done = true;
      G.enemies = G.enemies.filter((e) => e.id !== this.id);
      this.text.remove()
      this.shape.remove();
    },
    finish() {
      this.done = true;
      G.enemies = G.enemies.filter((e) => e.id !== this.id);
      this.text.remove()
      this.shape.remove();
    },
  };

  newEnemy.init();
  G.enemies.push(newEnemy);
}
