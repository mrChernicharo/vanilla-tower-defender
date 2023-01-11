import { TOWERS } from "../constants";
import { focusNoTile } from "../helpers";
import { G } from "../main";
import { hideRing, removePreviewTower } from "./tile-menu";

export function getTowerType(icon) {
  return icon.dataset.type;
}

export function createTower(pos, type) {
  removePreviewTower();

  // console.log("createTower!", { pos, type });
  const tower_id = `tower-${pos.y}-${pos.x}`;

  const newTower = {
    id: tower_id,
    shape: null,
    pos,
    cooldown: 0,
    lastShot: 0,
    shotsPerSecond: 0,
    rotation: 0,
    r: 25,
    type,
    xp: TOWERS[type].xp,
    fill: TOWERS[type].fill,
    range: TOWERS[type].range,
    damage: TOWERS[type].damage,
    bullet_speed: TOWERS[type].bullet_speed,
    rate_of_fire: TOWERS[type].rate_of_fire,
    g: null,
    init() {
      this.shotsPerSecond = 60 / this.rate_of_fire / 60;

      this.g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      this.shape = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      this.shape.setAttribute("id", tower_id);
      this.shape.setAttribute("cx", this.pos.x);
      this.shape.setAttribute("cy", this.pos.y);
      this.shape.setAttribute("data-entity", "tower");
      this.shape.setAttribute("data-type", type);
      this.shape.setAttribute("r", this.r);
      this.shape.setAttribute("fill", this.fill);

      const barrel = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      barrel.setAttribute("x", this.pos.x);
      barrel.setAttribute("y", this.pos.y);
      barrel.setAttribute("width", this.r + 10);
      barrel.setAttribute("height", 3);
      barrel.setAttribute("fill", this.fill);

      const rangeCircle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      rangeCircle.setAttribute("id", `range-${tower_id}`);
      rangeCircle.classList.add("tower-range");

      rangeCircle.setAttribute("cx", this.pos.x);
      rangeCircle.setAttribute("cy", this.pos.y);
      rangeCircle.setAttribute("r", this.range);
      rangeCircle.setAttribute("fill", this.fill);
      rangeCircle.setAttribute("opacity", 0);
      rangeCircle.setAttribute("pointer-events", "none");

      this.shape.onpointerover = (e) => {
        if (!rangeCircle.classList.contains("locked")) {
          rangeCircle.setAttribute("opacity", 0.1);
        }
      };
      this.shape.onpointerout = (e) => {
        if (!rangeCircle.classList.contains("locked")) {
          rangeCircle.setAttribute("opacity", 0);
        }
      };

      // this.rotation = getAngle(this.pos.x, this.pos.y, nextPos.x, nextPos.y);

      this.g.append(barrel);
      this.g.append(rangeCircle);
      this.g.append(this.shape);
      scene.append(this.g);
    },
    rotate(angle) {
      this.rotation = angle;
      this.g.setAttribute(
        "transform",
        `rotate(${this.rotation}, ${this.pos.x}, ${this.pos.y})`
      );
    },
  };
  newTower.init();

  G.towers.push(newTower);
  // G.tiles
  // mark tile hasTower
  G.towerPreviewActive = false;
  G.selectedTile = { ...G.selectedTile, hasTower: true };
  G.tiles[G.selectedTile.index] = {
    ...G.tiles[G.selectedTile.index],
    hasTower: true,
  };

  focusNoTile();
  hideRing();
}

export function resetTowers() {
  G.towers = G.towers.map((t) => ({ ...t, cooldown: 0, lastShot: 0 }));
}
