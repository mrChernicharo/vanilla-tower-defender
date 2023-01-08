import {
  COLS,
  ROWS,
  FIRST_WAVE_AT_ROW,
  menuIcons,
  svg,
  scene,
  playPauseBtn,
  gameSpeedForm,
  selectionRing,
  tileWidth,
  selectionRingG,
  sceneRect,
  MARGIN,
  TOWERS,
  enemyLaneLeft,
  enemyLaneCenter,
  enemyLaneRight,
} from "./constants";
import { G, menuActions } from "./main";

export const canBecomePath = (tile) => {
  return tile.type === "grass" && !tile.hasTower;
};

export const getMenuType = (tile) => {
  if (tile.type === "path") {
    if (tile.connected) {
      return "trap";
    } else {
      return "newPath";
    }
  } else {
    if (tile.hasTower) {
      return "tower";
    } else {
      return "newTower";
    }
  }
};

export const getMiddleX = (sceneRect) => sceneRect.width / 2 - MARGIN;

export const getTileColor = (type, blocked = false) => {
  if (blocked) return "#444";
  if (type === "path") return "#971";
  const random = Math.floor(Math.random() * 4);
  const greens = ["#005a22", "#051", "#041", "#042"];
  return greens[random];
};

export function createGrid(cols = COLS, rows = ROWS) {
  const tiles = [];
  const isInitialPath = (row, col) => row == 0 && col == 2;
  const isBlocked = (row, col) =>
    (row == 3 && col == 2) || (row == 4 && col == 1);

  // prettier-ignore
  for (let row of Array(rows).fill().map((_, i) => i)) {
    for (let col of Array(cols).fill().map((_, i) => i)) {
      const pos = { x: col * tileWidth, y: row * tileWidth };
      const newTile = {
        index: row * cols + col,
        id: `tile-${row}-${col}`,
        pos,
        shape: null,
        fill: null,
        type: null,
        connected: false,
        hasTower: false,
        blocked: false,
        startingPoint: false,
        exits: null,
        init() {
          this.shape = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
          );
          const isStartingPoint = isInitialPath(row,col);
          this.type = isStartingPoint ? 'path' : 'grass';
          this.blocked = isBlocked(row, col);
          this.startingPoint = isStartingPoint
          this.exits = isStartingPoint ? getTileExits(this): null;
          this.fill = getTileColor(this.type, this.blocked);
          this.shape.setAttribute("id", this.id);
          this.shape.setAttribute("data-entity", "tile");
          this.shape.setAttribute("data-index", this.index);
          this.shape.setAttribute("x", pos.x);
          this.shape.setAttribute("y", pos.y);
          this.shape.setAttribute("height", tileWidth);
          this.shape.setAttribute("width", tileWidth);
          this.shape.setAttribute("fill", this.fill);
          this.shape.setAttribute("opacity", 1);
          scene.append(this.shape);
        },
        focus() {
          this.shape.setAttribute("opacity", 0.4);
          this.shape.setAttribute('style', `filter: drop-shadow(0 0 1rem #04f);`)
        },
        blur() {
          this.shape.setAttribute("opacity", 1);
          this.shape.setAttribute('style', `filter: drop-shadow(0 0 0 #04f);`)
        },
      };
      newTile.init();
      tiles.push(newTile);
    }
  }
  return tiles;
}

export function getTileExits(tile) {
  console.log("getTileExits", { tile });

  if (tile.startingPoint) {
    // console.log("hey", tile, G.tiles, G.tileChain);
    const exits = {
      left: { x: tile.pos.x + 25, y: 0 },
      center: { x: tile.pos.x + 50, y: 0 },
      right: { x: tile.pos.x + 75, y: 0 },
    };
    G.tileChain.push({ ...tile, exits });
    return exits;
  }

  const prevTile = G.tileChain.at(-1);

  const left = { x: 0, y: 0 };
  const center = { x: 0, y: 0 };
  const right = { x: 0, y: 0 };

  // newTile below
  if (prevTile.pos.y < tile.pos.y) {
    left.x = tile.pos.x + 25;
    left.y = tile.pos.y;
    center.x = tile.pos.x + 50;
    center.y = tile.pos.y;
    right.x = tile.pos.x + 75;
    right.y = tile.pos.y;
  }

  // newTile to the left
  if (prevTile.pos.x > tile.pos.x) {
    left.x = tile.pos.x + 100;
    left.y = tile.pos.y + 25;
    center.x = tile.pos.x + 100;
    center.y = tile.pos.y + 50;
    right.x = tile.pos.x + 100;
    right.y = tile.pos.y + 75;
  }

  // newTile to the right
  if (prevTile.pos.x < tile.pos.x) {
    left.x = tile.pos.x;
    left.y = tile.pos.y + 75;
    center.x = tile.pos.x;
    center.y = tile.pos.y + 50;
    right.x = tile.pos.x;
    right.y = tile.pos.y + 25;
  }
  console.log("getTileExits", { prevTile, left, center, right });

  return { left, center, right };
}

export function getAdjacentTile(tiles, tile, direction) {
  // console.log("getAdjacentTile", { direction, tile });
  let adj;
  switch (direction) {
    case "left":
      {
        adj = tiles.find((t) => t.index === tile.index - 1 && tile.pos.x > 0);
      }
      break;
    case "right":
      {
        adj = tiles.find(
          (t) => t.index === tile.index + 1 && tile.pos.x / tileWidth < COLS - 1
        );
      }
      break;
    case "bottom":
      {
        adj = tiles.find((t) => t.index === tile.index + COLS);
      }
      break;
  }
  return adj || null;
}

export const getIconDirection = (iconType) => iconType.split("-")[1];

export const getChains = (tileChain) => {
  return tileChain.reduce(
    (acc, tile) => {
      acc.left.push(tile.exits.left);
      acc.center.push(tile.exits.center);
      acc.right.push(tile.exits.right);
      return acc;
    },
    {
      left: [],
      center: [],
      right: [],
    }
  );
};

export function createPath(points, lane) {
  let d = "";
  let prevPos = null;

  for (const [i, pos] of points.entries()) {
    if (i === 0) {
      // moveTo
      d = `M ${pos.x} ${pos.y}`;
    } else {
      // line
      if (prevPos.x === pos.x || prevPos.y === pos.y) {
        d += ` L ${pos.x} ${pos.y}`;
      }
      // arc
      else {
        let sweep = "0";
        if (prevPos.y % tileWidth === 0) {
          // "from the top to the right"
          if (prevPos.x < pos.x) {
            sweep = "0";
          }

          // "from the top to the left"
          if (prevPos.x > pos.x) {
            sweep = "1";
          }
        } else {
          // "from the left to the bottom"
          if (prevPos.x < pos.x) {
            sweep = "1";
          }
          // "from the right to the bottom"
          if (prevPos.x > pos.x) {
            sweep = "0";
          }
        }
        d += ` A 75 75 0 0 ${sweep} ${pos.x} ${pos.y}`;
      }
    }
    prevPos = pos;
  }

  const hasEnemyEntrance = G.tileChain.at(-1)?.enemyEntrance;
  if (hasEnemyEntrance) {
    let entryPos = { x: 0, y: 0 };
    const firstTileEntry = points.at(-1);

    entryPos.x = firstTileEntry.x;
    entryPos.y = firstTileEntry.y + tileWidth * 0.5;

    if (lane === "left") {
      entryPos.x += tileWidth * 0.25;
    }
    if (lane === "right") {
      entryPos.x -= tileWidth * 0.25;
    }

    d += ` L ${entryPos.x} ${entryPos.y}`;
  }

  return d;
}

export function getTowerType(icon) {
  return icon.dataset.type;
}

export function drawTowerPreview(towerPos, towerType) {
  // console.log("drawTowerPreview");
  const tower_id = `tower-${towerPos.y}-${towerPos.x}`;

  const towerShape = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  towerShape.setAttribute("id", tower_id);
  towerShape.setAttribute("cx", parseInt(towerPos.x));
  towerShape.setAttribute("cy", parseInt(towerPos.y));
  towerShape.setAttribute("data-entity", "tower");
  towerShape.setAttribute("data-type", towerType);
  towerShape.setAttribute("r", 25);

  towerShape.setAttribute("fill", TOWERS[towerType].fill);
  towerShape.classList.add("preview-tower");
  scene.append(towerShape);
}

export function removePreviewTower() {
  Array.from(document.querySelectorAll(".preview-tower")).forEach((tower) =>
    tower.remove()
  );
}

export const drawRingIcons = (menuType, tile) => {
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
    circle.setAttribute("stroke", menuIcon.color);
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
        // console.log("create that damn tower!");
        const towerPos = {
          x: tile.pos.x + tileWidth / 2,
          y: tile.pos.y + tileWidth / 2,
        };
        createTower(towerPos, getTowerType(icon));
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
  Array.from(document.querySelectorAll(".defs")).forEach((defs) =>
    defs.remove()
  );
};
export function drawNewPathTile(tile) {
  // console.log("drawNewPathTile", tile);

  const tileRect = document.querySelector(`#${tile.id}`);
  const chains = getChains(G.tileChain);
  console.log({ chains, tileChain: G.tileChain });
  // if barrierBroken

  enemyLaneLeft.setAttribute("d", createPath(chains.left, "left"));
  enemyLaneCenter.setAttribute("d", createPath(chains.center, "center"));
  enemyLaneRight.setAttribute("d", createPath(chains.right, "right"));

  tileRect.setAttribute("fill", getTileColor(tile.type));
  tileRect.setAttribute("data-type", "path");

  focusNoTile();
  hideRing();
}

function createTower(pos, type) {
  removePreviewTower();

  // console.log("createTower!", { pos, type });
  const tower_id = `tower-${pos.y}-${pos.x}`;

  const newTower = {
    id: tower_id,
    shape: null,
    pos,
    fill: TOWERS[type].fill,
    init() {
      this.shape = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      this.shape.setAttribute("id", tower_id);
      this.shape.setAttribute("cx", parseInt(this.pos.x));
      this.shape.setAttribute("cy", parseInt(this.pos.y));
      this.shape.setAttribute("data-entity", "tower");
      this.shape.setAttribute("data-type", type);
      this.shape.setAttribute("r", 25);

      this.shape.setAttribute("fill", this.fill);
      scene.append(this.shape);
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
export function updateFocusedTile() {
  G.lastSelectedTile?.blur();
  G.selectedTile.focus();
}
export function focusNoTile() {
  G.selectedTile.blur();
  G.selectedTile = null;
  G.lastSelectedTile?.blur();

}
