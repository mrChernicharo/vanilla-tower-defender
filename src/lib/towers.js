import { tileWidth, TOWERS } from "./constants";
import { focusNoTile, updateGoldDisplay } from "./helpers";
import { G } from "./G";
import { hideRing, removePreviewTower } from "./tile-menu";
import { scene } from "./dom-selects";

export function getTowerType(icon) {
  return icon.dataset.type;
}

export function createTower(pos, type) {
  removePreviewTower();

  // console.log("createTower!", { pos, type });
  const tower_id = `tower-${pos.y}-${pos.x}`;

  const newTower = {
    id: null,
    shape: null,
    pos,
    cooldown: 0,
    lastShot: 0,
    shotsPerSecond: 0,
    rotation: 0,
    // r: 50,
    type,
    xp: TOWERS[type].xp,
    fill: TOWERS[type].fill,
    range: TOWERS[type].range,
    damage: TOWERS[type].damage,
    bullet_speed: TOWERS[type].bullet_speed,
    rate_of_fire: TOWERS[type].rate_of_fire,
    price: TOWERS[type].price,
    g: null,
    init() {
      this.id = tower_id;
      const patternId = `pattern-${this.id}`;
      this.shotsPerSecond = 60 / this.rate_of_fire / 60;

      this.g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      this.shape = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      this.shape.setAttribute("id", this.id);
      this.shape.setAttribute("x", this.pos.x);
      this.shape.setAttribute("y", this.pos.y);
      this.shape.setAttribute("data-entity", "tower");
      this.shape.setAttribute("data-type", type);
      this.shape.setAttribute("width", tileWidth);
      this.shape.setAttribute("height", tileWidth);
      this.shape.setAttribute("fill", this.fill);

      this.shape.setAttribute("fill", `url(#${patternId})`);
      this.shape.setAttribute("transform", "translate(-36, -50)");

      const rangeCircle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      rangeCircle.setAttribute("id", `range-${this.id}`);
      rangeCircle.classList.add("tower-range");

      rangeCircle.setAttribute("cx", this.pos.x);
      rangeCircle.setAttribute("cy", this.pos.y);
      rangeCircle.setAttribute("r", this.range);
      rangeCircle.setAttribute("fill", this.fill);
      rangeCircle.setAttribute("opacity", 0);
      rangeCircle.setAttribute("pointer-events", "none");

      this.shape.onpointerover = () => handlePointerOver(rangeCircle);
      this.shape.onpointerout = () => handlePointerOut(rangeCircle);

      const defs = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "defs"
      );
      const pattern = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "pattern"
      );
      const image = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "image"
      );
      defs.setAttribute("id", `defs-${this.id}`);
      defs.setAttribute("class", "defs tower-defs");
      pattern.setAttribute("id", patternId);
      pattern.setAttribute("width", 1);
      pattern.setAttribute("height", 1);
      image.setAttribute("href", TOWERS[this.type].img);
      image.setAttribute("id", `image-${this.id}`);

      pattern.append(image);
      defs.append(pattern);
      this.g.append(defs);
      this.g.append(rangeCircle);
      this.g.append(this.shape);
      scene.append(this.g);
    },
    rotate(angle) {
      const distanceToNextAngle = Math.abs(
        Math.min(
          2 * Math.PI - Math.abs(this.rotation - angle),
          Math.abs(this.rotation - angle)
        )
      );

      const towerWantsToLeap = distanceToNextAngle >= 8;
      const leapOver180 = distanceToNextAngle > 180;
      if (towerWantsToLeap && leapOver180) {
        angle =
          angle > this.rotation
            ? this.rotation + 7.5 + 360
            : this.rotation - 7.5 - 360;
      } else if (towerWantsToLeap) {
        angle = angle > this.rotation ? this.rotation + 7.5 : this.rotation - 7.5;
      } 

      this.rotation = angle;
      this.g.setAttribute(
        "transform",
        `rotate(${this.rotation}, ${this.pos.x}, ${this.pos.y})`
      );
    },
  };

  newTower.init();

  G.towers.push(newTower);

  G.gold -= newTower.price;
  G.towerPreviewActive = false;
  G.selectedTile = { ...G.selectedTile, hasTower: true };
  G.tiles[G.selectedTile.index] = {
    ...G.tiles[G.selectedTile.index],
    hasTower: true,
  };

  focusNoTile();
  hideRing();
  updateGoldDisplay();
}

export function resetTowers() {
  G.towers = G.towers.map((t) => ({ ...t, cooldown: 0, lastShot: 0 }));
}

function handlePointerOver(rangeCircle) {
  if (!rangeCircle.classList.contains("locked")) {
    rangeCircle.setAttribute("opacity", 0.1);
  }
}

function handlePointerOut(rangeCircle) {
  if (!rangeCircle.classList.contains("locked")) {
    rangeCircle.setAttribute("opacity", 0);
  }
}
