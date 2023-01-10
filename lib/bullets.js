import { TOWERS } from "../constants";
import { bulletsG } from "../lib/dom-selects";
import { G } from "../main";

export function createBullet(tower, enemy) {
  const newBullet = {
    id: G.bulletCount++,
    type: tower.type,
    speed: tower.bullet_speed,
    damage: tower.damage,
    towerPos: tower.pos,
    pos: tower.pos,
    shape: null,
    path: null,
    enemy,
    init() {
      this.path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      this.path.setAttribute(
        "d",
        `M ${this.pos.x} ${this.pos.y} L ${this.enemy.pos.x} ${this.enemy.pos.y}`
      );
      this.path.setAttribute("stroke-width", 2);
      this.path.setAttribute("stroke", "gray");

      this.shape = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      this.shape.setAttribute("r", 6);
      this.shape.setAttribute("cx", this.pos.x);
      this.shape.setAttribute("fill", TOWERS[this.type].fill);
      this.shape.setAttribute("cy", this.pos.y);
      bulletsG.append(this.path);
      bulletsG.append(this.shape);
    },
    move() {
      const nextPos = this.path.getPointAtLength(
        this.speed * G.gameSpeed * 0.01
      );
      this.pos = nextPos;
      this.path.setAttribute(
        "d",
        `M ${this.pos.x} ${this.pos.y} L ${this.enemy.pos.x} ${this.enemy.pos.y}`
      );
      this.shape.setAttribute("cx", this.pos.x);
      this.shape.setAttribute("cy", this.pos.y);
    },
    hit(enemy) {
      enemy.hp -= this.damage;
      this.remove();
    },
    remove() {
      this.shape.remove();
      this.path.remove();
      G.bullets = G.bullets.filter((b) => b.id !== this.id);
      // const idx = G.bullets.findIndex((b) => b.id === this.id);
      // G.bullets.splice(idx, 1);
    },
  };
  newBullet.init();
  return newBullet;
}
