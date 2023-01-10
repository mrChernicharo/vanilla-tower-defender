import {
  COLS,
  ROWS,
  FIRST_WAVE_AT_ROW,
  menuIcons,
  tileWidth,
  sceneRect,
  MARGIN,
  TOWERS,
  
} from "./constants";

import {
  scene,
  svg,
  playPauseBtn,
  gameSpeedForm,
  selectionRing,
  selectionRingG,
} from "./lib/dom-selects";
import { createTower } from "./lib/towers";
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

export function updateFocusedTile() {
  G.lastSelectedTile?.blur();
  G.selectedTile.focus();
}
export function focusNoTile() {
  G.selectedTile?.blur();
  G.selectedTile = null;
  G.lastSelectedTile?.blur();
}

export function getDistance(x1, y1, x2, y2) {
  let y = x2 - x1;
  let x = y2 - y1;

  return Math.sqrt(x * x + y * y);
}

export function getAngle(sx, sy, ex, ey) {
  var dy = ey - sy;
  var dx = ex - sx;
  var theta = Math.atan2(dy, dx);
  theta *= 180 / Math.PI;
  if (theta < 0) theta = 360 + theta;
  return theta;
}
