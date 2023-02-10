import { handlePlayPause } from "../main";
import { MARGIN, STAGES_AND_WAVES } from "./constants";
import {
  castleHPDisplay,
  goldDisplay,
  toastsArea,
  waveDisplay,
} from "./dom-selects";
import { G } from "./G";

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
  G.selectedTile?.blur && G.selectedTile.blur();
  G.selectedTile = null;
  G.lastSelectedTile?.blur && G.lastSelectedTile.blur();
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

export function updateGoldDisplay(amount = 0) {
  if (amount) {
    G.gold += amount;
    addToast(`+${amount} 💰`, "info", 1000);
  }
  goldDisplay.textContent = G.gold;
}

export function updateCastleHPDisplay(amount = 0) {
  if (amount) {
    G.castleHP -= amount;
    addToast(`-${amount} 💔`, "danger", 3000);
  }
  if (G.castleHP <= 0) {
    handlePlayPause();
    addToast("you lose!", "danger", 3000);
  }
  castleHPDisplay.textContent = G.castleHP;
}

export function updateWaveDisplay(wave = 0) {
  if (
    wave &&
    G.waveNumber &&
    wave === STAGES_AND_WAVES[G.waveNumber]?.waves.length - 1
  ) {
    waveDisplay.textContent = "Final Wave";
    addToast("Final Wave");
  } else if (wave) {
    addToast(`wave ${wave}`);
  }
  waveDisplay.textContent = wave;
}

export function canAfford(value) {
  return G.gold >= value;
}

export function addToast(
  message = "Hello World",
  type = "info",
  duration = 2000
) {
  const toastColor = {
    success: "green",
    danger: "red",
    info: "#eee",
  };

  const toast = document.createElement("div");

  toast.classList.add("toast");
  toast.style.color = toastColor[type];
  toast.style.opacity = 0;

  toast.textContent = message;
  toastsArea.append(toast);

  setTimeout(() => {
    toast.style.opacity = 1;
  }, 0);

  setTimeout(() => {
    toast.style.opacity = 0;
  }, duration);

  setTimeout(() => {
    toast.remove();
  }, duration + 1000);
}
