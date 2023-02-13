import { TILE_WIDTH, TOWERS } from "./constants";
import {
  focusNoTile,
  getDistanceBetweenAngles,
  updateGoldDisplay,
} from "./helpers";
import { G } from "./G";
import { hideRing, removePreviewTower } from "./tile-menu";
import { scene } from "./dom-selects";

const imagePaths = {
  upgrade: "/assets/icons/upgrade.svg",
  sell: "/assets/icons/sack-dollar.svg",
  info: "/assets/icons/book.svg",
};

const uncheckOtherIcons = () => {
  const allIcons = document.querySelectorAll(`#selection-ring-g .defs image`);

  allIcons.forEach((icon) => {
    if (icon.getAttribute("href").match(/check-(.)+\.svg/)) {
      const imgType = icon.id.split("-")[1];
      icon.setAttribute("href", imagePaths[imgType]);
    }
  });
};

const towerActions = {
  upgrade(e, tower, towerIdx) {
    console.log("upgrade", { tower, towerIdx });

    const iconImg = document.querySelector(`#image-${e.target.id}`);
    const imgHref = iconImg.getAttribute("href");

    // confirm upgrade?
    if (imgHref.includes("upgrade.svg")) {
      uncheckOtherIcons();
      iconImg.setAttribute("href", "/assets/icons/check-green.svg");
    }
    // upgrade confirmed!
    else {
      console.log("confirm tower upgrade!");
      focusNoTile();
      hideRing();
      // updateGoldDisplay(tower.price / 2);
    }
  },
  sell(e, tower, towerIdx) {
    console.log("sell", { tower, towerIdx });

    const iconImg = document.querySelector(`#image-${e.target.id}`);
    const imgHref = iconImg.getAttribute("href");

    // confirm sell?
    if (imgHref.includes("sack-dollar.svg")) {
      uncheckOtherIcons();
      iconImg.setAttribute("href", "/assets/icons/check-gold.svg");
    }
    // sell confirmed!
    else {
      G.towers.splice(towerIdx, 1);
      G.tiles[G.selectedTile.index].hasTower = false;
      tower.g.remove();
      focusNoTile();
      hideRing();
      updateGoldDisplay(tower.price / 2);
    }
  },
  info(e, tower, towerIdx) {
    console.log("info", { tower, towerIdx });

    uncheckOtherIcons();
  },
};

export function handleTowerActions(e) {
  const [_, tileY, tileX] = G.selectedTile.id.split("-");
  const towerId = `tower-${tileY * TILE_WIDTH + 50}-${tileX * TILE_WIDTH + 50}`;

  const towerIdx = G.towers.findIndex((tower) => tower.id === towerId);

  // trigger tower action!
  towerActions[e.target.dataset.type](e, G.towers[towerIdx], towerIdx);
}

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
      this.shotsPerSecond = 60 / this.rate_of_fire / 60;

      this.id = tower_id;
      const patternId = `pattern-${this.id}`;
      const translations = {
        fire: "translate(-36, -50)",
        ice: "translate(-36, -50)",
        lightning: "translate(-36, -50)",
        earth: "translate(-49, -50)",
      };

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
      this.shape.setAttribute("width", TILE_WIDTH);
      this.shape.setAttribute("height", TILE_WIDTH);

      this.shape.setAttribute("fill", `url(#${patternId})`);
      this.shape.setAttribute("transform", translations[type]);

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
      image.setAttribute("width", TILE_WIDTH);
      image.setAttribute("height", TILE_WIDTH);

      this.applyRotation(90);

      pattern.append(image);
      defs.append(pattern);
      this.g.append(defs);
      this.g.append(rangeCircle);
      this.g.append(this.shape);
      scene.append(this.g);
    },
    rotateTowardsEnemy(angle) {
      const distanceToNextAngle = getDistanceBetweenAngles(
        this.rotation,
        angle
      );

      const towerWantsToLeap = distanceToNextAngle >= 5;
      const leapOver180 = distanceToNextAngle > 180;

      if (towerWantsToLeap && leapOver180) {
        angle =
          angle > this.rotation
            ? this.rotation + 4.5 + 360
            : this.rotation - 4.5 - 360;
      } else if (towerWantsToLeap) {
        angle =
          angle > this.rotation ? this.rotation + 4.5 : this.rotation - 4.5;
      }

      this.applyRotation(angle);
    },
    applyRotation(angle) {
      this.rotation = angle;
      this.g.setAttribute(
        "transform",
        `rotate(${this.rotation}, ${this.pos.x}, ${this.pos.y})`
      );
    },
  };

  newTower.init();

  G.towers.push(newTower);

  G.towerPreviewActive = false;
  G.selectedTile = { ...G.selectedTile, hasTower: true };
  G.tiles[G.selectedTile.index] = {
    ...G.tiles[G.selectedTile.index],
    hasTower: true,
  };

  focusNoTile();
  hideRing();
  updateGoldDisplay(-newTower.price);
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
