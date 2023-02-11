import { menuIcons, TILE_WIDTH, TOWERS } from "./constants";
import { scene, selectionRing, selectionRingG } from "../lib/dom-selects";
import { canAfford, canBecomePath, getIconDirection } from "./helpers";
import { menuActions } from "../main";
import { getAdjacentTile } from "./tiles";
import { createTower, getTowerType } from "./towers";
import { G } from "./G";

export function drawTowerPreview(towerPos, towerType) {
  // console.log("drawTowerPreview");
  const tower_id = `tower-${towerPos.y}-${towerPos.x}`;
  const patternId = `pattern-${tower_id}`;

  const towerShape = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect"
  );
  towerShape.setAttribute("id", tower_id);
  towerShape.classList.add("preview-tower");
  towerShape.setAttribute("x", parseInt(towerPos.x));
  towerShape.setAttribute("y", parseInt(towerPos.y));
  towerShape.setAttribute("data-entity", "tower");
  towerShape.setAttribute("data-type", towerType);
  towerShape.setAttribute("width", TILE_WIDTH);
  towerShape.setAttribute("height", TILE_WIDTH);

  towerShape.setAttribute("fill", `url(#${patternId})`);
  towerShape.setAttribute(
    "transform",
    `translate(50, -40) rotate(${90}, ${towerPos.x}, ${towerPos.y})`
  );

  const rangeCircle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  rangeCircle.setAttribute("id", `range-${tower_id}`);
  rangeCircle.classList.add("preview-range");
  rangeCircle.setAttribute("cx", towerPos.x);
  rangeCircle.setAttribute("cy", towerPos.y);
  rangeCircle.setAttribute("r", TOWERS[towerType].range);
  rangeCircle.setAttribute("fill", TOWERS[towerType].fill);
  rangeCircle.setAttribute("opacity", 0.1);
  rangeCircle.setAttribute("pointer-events", "none");

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const pattern = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "pattern"
  );
  const image = document.createElementNS("http://www.w3.org/2000/svg", "image");

  defs.setAttribute("id", `defs-${tower_id}`);
  defs.setAttribute("class", "defs preview-tower-defs");
  pattern.setAttribute("id", patternId);
  pattern.setAttribute("width", 1);
  pattern.setAttribute("height", 1);
  image.setAttribute("href", TOWERS[towerType].img);
  image.setAttribute("id", `image-${tower_id}`);
  image.setAttribute("width", 100);
  image.setAttribute("height", 100);

  // this.applyRotation(90);

  pattern.append(image);
  defs.append(pattern);
  scene.append(defs);
  scene.append(rangeCircle);
  scene.append(towerShape);
}

export function removePreviewTower() {
  // console.log("removePreviewTower");
  Array.from(document.querySelectorAll(".preview-tower")).forEach((tower) =>
    tower.remove()
  );
  Array.from(document.querySelectorAll(".preview-range")).forEach((range) =>
    range.remove()
  );
  Array.from(document.querySelectorAll(".preview-tower-defs")).forEach((defs) =>
  defs.remove()
);
}

export const drawRingIcons = (menuType, tile) => {
  // console.log("drawRingIcons", { menuType, tile });
  const icons = [];
  for (const [i, menuIcon] of menuIcons[menuType].entries()) {
    if (menuType === "newPath") {
      const adjacentTile = getAdjacentTile(
        G.tiles,
        tile,
        getIconDirection(menuIcon.type)
      );
      const isBuildableAdj =
        !tile.connected &&
        adjacentTile &&
        !adjacentTile.blocked &&
        canBecomePath(adjacentTile);

      if (!isBuildableAdj) continue;
    }

    let ringColor = menuIcon.color;
    if (menuType === "newTower" && !canAfford(TOWERS[menuIcon.type].price)) {
      ringColor = "#999";
    }

    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );

    circle.setAttribute("class", `ring-icon`);
    circle.setAttribute("data-entity", `ring-icon`);
    circle.setAttribute("data-type", menuIcon.type);
    circle.setAttribute("id", menuIcon.id);
    circle.setAttribute("cx", tile.pos.x + menuIcon.x);
    circle.setAttribute("cy", tile.pos.y + menuIcon.y);
    circle.setAttribute("r", 20);
    circle.setAttribute("stroke", ringColor);
    circle.setAttribute("stroke-width", 2);

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const pattern = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "pattern"
    );
    const image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    const patternId = `pattern-${menuIcon.id}`;
    defs.setAttribute("id", `defs-${menuIcon.id}`);
    defs.setAttribute("class", "defs");
    pattern.setAttribute("id", patternId);
    pattern.setAttribute("width", 28);
    pattern.setAttribute("height", 28);
    image.setAttribute("href", menuIcon.img);
    image.setAttribute("id", `image-${menuIcon.id}`);
    image.setAttribute("x", 5);
    image.setAttribute("y", 5);
    image.setAttribute("width", 28);
    image.setAttribute("height", 28);

    if (menuType === "newTower" && !canAfford(TOWERS[menuIcon.type].price)) {
      image.setAttribute("style", "filter: grayscale(1)");
    }

    pattern.append(image);
    defs.append(pattern);
    selectionRingG.append(defs);

    circle.setAttribute("fill", `url(#${patternId})`);
    selectionRingG.append(circle);

    icons.push(circle);
  }
  return icons;
};

export const appendIconsListeners = (icons, tile, menuType) => {
  icons.forEach((icon) => {
    icon.onclick = (e) => {
      if (icon.dataset.selected) {
        const type = getTowerType(icon);

        if (!canAfford(TOWERS[type].price)) {
          console.log("not enough money!");
          return;
        }

        // console.log("create that damn tower!");
        const towerPos = {
          x: tile.pos.x + TILE_WIDTH / 2,
          y: tile.pos.y + TILE_WIDTH / 2,
        };

        createTower(towerPos, type);
        return;
      }

      menuActions[menuType](e, tile, icon);
    };
  });
};

export const removeRingIcons = () => {
  Array.from(document.querySelectorAll(".ring-icon")).forEach((icon) => {
    icon.removeEventListener("click", menuActions[icon.dataset.type]);
    icon.remove();
  });
  Array.from(document.querySelectorAll(".defs")).forEach((defs) => {
    // remove defs for ring icons, but leave tower defs
    if (!defs.classList.contains("tower-defs")) {
      defs.remove();
    }
  });
};

export function showRing() {
  const { x, y } = G.selectedTile.pos;
  selectionRing.setAttribute("transform", `translate(${x},${y})`);
  selectionRing.setAttribute("style", "opacity: .75; display: block");
  selectionRingG.setAttribute("style", "opacity: 1; display: block");
}

export function hideRing() {
  selectionRingG.setAttribute("style", "opacity: 0; display: none");
  selectionRing.setAttribute("style", "opacity: 0; display: none");
}

export function removeEnemyEntrance(entryTile) {
  delete entryTile.enemyEntrance;
  entryTile.visible = true;
  G.tileChain[G.tileChain.length - 1] = entryTile;
  G.tiles[entryTile.index] = entryTile;
}
