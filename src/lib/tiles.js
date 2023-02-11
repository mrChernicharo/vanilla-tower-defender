import { STAGES_AND_WAVES, TILE_WIDTH } from "./constants";
import { enemyLanes, svg } from "../lib/dom-selects";
import { focusNoTile, getChains } from "./helpers";
import { G } from "./G";
import { hideRing } from "./tile-menu";

const tileColors = {
  grass: "#052",
  dirt: "#430",
  wall: "#666",
};

export function createGrid() {
  const { stage, wallTiles, blockedTiles } = STAGES_AND_WAVES[G.stageNumber];
  const { cols, rows, entrypoint, baseTile /* wallTiles */ } = stage;

  // set scene size
  svg.setAttribute("width", (cols + 1) * TILE_WIDTH);
  svg.setAttribute("height", (rows + 1) * TILE_WIDTH);

  // define rocks and entrypointCol

  const isInitialPath = (row, col) => row == 0 && col == entrypoint;

  const isBlocked = (row, col) =>
    Boolean(blockedTiles[row] && blockedTiles[row].includes(col));

  const isWall = (row, col) =>
    Boolean(wallTiles[row] && wallTiles[row].includes(col));

  const getTileType = (isStartingPoint) => {
    if (isStartingPoint) return "path";
    else return baseTile;
  };

  const tiles = [];
  // prettier-ignore
  for (let row of Array(rows).fill().map((_, i) => i)) {
    for (let col of Array(cols).fill().map((_, i) => i)) {
      const pos = { x: col * TILE_WIDTH, y: row * TILE_WIDTH };
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
        visible: false,
        init() {
          this.shape = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
          );
          const isStartingPoint = isInitialPath(row,col);
          
          this.type = isWall(row, col) ? 'wall' : getTileType(isStartingPoint);
          this.blocked = isBlocked(row, col);
          this.startingPoint = isStartingPoint
          this.exits = isStartingPoint ? getTileExits(this): null;
          this.fill = getTileColor(this.type, this.blocked);

          this.shape.setAttribute("id", this.id);
          this.shape.setAttribute("data-entity", "tile");
          this.shape.setAttribute("data-index", this.index);
          this.shape.setAttribute("x", pos.x);
          this.shape.setAttribute("y", pos.y);
          this.shape.setAttribute("height", TILE_WIDTH);
          this.shape.setAttribute("width", TILE_WIDTH);
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

let pathTileCount = 0;
export const getTileColor = (type, blocked = false) => {
  if (blocked) return "#333";

  if (type === "path") {
    const pathColor = pathTileCount % 2 === 0 ? "#971" : "#861";
    pathTileCount++;
    return pathColor;
  }

  return tileColors[type];
};

export function getTileExits(tile) {
  // console.log("getTileExits", { tile });

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
  // console.log("getTileExits", { prevTile, left, center, right });

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
          (t) =>
            t.index === tile.index + 1 &&
            tile.pos.x / TILE_WIDTH <
              STAGES_AND_WAVES[G.stageNumber].stage.cols - 1
        );
      }
      break;
    case "bottom":
      {
        adj = tiles.find(
          (t) =>
            t.index === tile.index + STAGES_AND_WAVES[G.stageNumber].stage.cols
        );
      }
      break;
  }
  return adj || null;
}

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
        if (prevPos.y % TILE_WIDTH === 0) {
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
    entryPos.y = firstTileEntry.y + TILE_WIDTH * 0.5;

    if (lane === "left") {
      entryPos.x += TILE_WIDTH * 0.25;
    }
    if (lane === "right") {
      entryPos.x -= TILE_WIDTH * 0.25;
    }

    d += ` L ${entryPos.x} ${entryPos.y}`;
  }

  return d;
}

export function drawNewPathTile(tile) {
  // console.log("drawNewPathTile", tile);

  const tileRect = document.querySelector(`#${tile.id}`);
  const chains = getChains(G.tileChain);
  // console.log({ chains, tileChain: G.tileChain });

  enemyLanes.left.setAttribute("d", createPath(chains.left, "left"));
  enemyLanes.center.setAttribute("d", createPath(chains.center, "center"));
  enemyLanes.right.setAttribute("d", createPath(chains.right, "right"));

  tileRect.setAttribute("fill", getTileColor(tile.type));
  tileRect.setAttribute("data-type", "path");

  focusNoTile();
  hideRing();
}

export function updateVisibleTiles(sum = 0) {
  const waveLine =
    G.waveNumber + STAGES_AND_WAVES[G.stageNumber].stage.firstWaveAtRow + sum;
  for (let [i, tile] of G.tiles.entries()) {
    // console.log(tile.pos.y)
    if (tile.pos.y / TILE_WIDTH < waveLine) {
      tile.visible = true;
    } else {
      tile.visible = false;
    }

    if (tile.visible) {
      tile.shape.setAttribute("opacity", 1);
    } else {
      tile.shape.setAttribute("opacity", 0.5);
    }
  }
  console.log("updateVisibleTiles", { waveLine, tiles: G.tiles });
}
