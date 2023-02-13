import { runAnimation } from "../main";
import { MARGIN, STAGES_AND_WAVES, TILE_WIDTH } from "./constants";
import { G } from "./G";
import { focusNoTile, updateFocusedTile } from "./helpers";
import {
  pre,
  enemiesG,
  bulletsG,
  svg,
  scene,
  playPauseBtn,
  gameSpeedForm,
  selectionRing,
  selectionRingG,
} from "./dom-selects";
import {
  handleDisplayTileMenu,
  hideRing,
  removePreviewTower,
  showRing,
} from "./tile-menu";
let playPauseIcon = "▶️";

export function appendGameEvents() {
  scene.setAttribute("transform", `translate(${MARGIN},${MARGIN})`);

  svg.onpointermove = (e) => {
    G.mouse = { x: e.offsetX, y: e.offsetY };
  };

  document.onclick = (e) => {
    if (!e.target.closest("svg")) {
      selectionRingG.setAttribute("style", "opacity: 0; display: none");
      selectionRing.setAttribute("style", "opacity: 0; display: none");
      G.lastSelectedTile = G.selectedTile;
      focusNoTile();
    }

    // prettier-ignore
    if (e.target.closest(`.ring-icon`) || e.target.closest(`[data-entity="tower"]`)) {
  //   console.log("clicked towerIcon or tower");
  }
    // prettier-ignore
    if (e.target.closest(`[data-entity="tower"]`)) {
    // console.log("clicked tower", { e, towerPreviewActive: G.towerPreviewActive });
  }
    // prettier-ignore
    if (!e.target.closest(`.ring-icon`) && !e.target.closest(`[data-entity="tower"]`)) {
    // console.log("clicked anywhere but not at a towerIcon neither at a tower");

    if (e.target.closest(`[data-entity="tile"]`) && G.tiles[e.target.closest(`[data-entity="tile"]`).dataset.index].hasTower) {
      // console.log('clicked tile with a tower')
      const { x, y } = G.selectedTile.pos;
      const rangeCircle = document.querySelector(
        `#range-tower-${y + 50}-${x + 50}`
      );
      rangeCircle.classList.add("locked");
      rangeCircle.setAttribute("opacity", .1);
      return
    }
    Array.from(document.querySelectorAll(".tower-range")).forEach((range) => {
      range.classList.remove("locked");
      range.setAttribute('opacity', 0)
    });
    removePreviewTower();
    G.towerPreviewActive = false;
  }
  };
  svg.onclick = (e) => {
    G.lastClick = { x: e.offsetX - MARGIN, y: e.offsetY - MARGIN };
    // console.log(G.lastClick);
  };

  scene.onclick = (e) => {
    // console.log(e);
    const entity = e.target.dataset.entity;
    if (!entity) return;

    // console.log(`clicked ${entity}`);
    const entityActions = {
      enemy(e) {},
      tile(e) {
        const { index } = e.target.dataset;
        G.lastSelectedTile = G.selectedTile;
        G.selectedTile = G.tiles[index];

        // otherwise, animation wouldn't catch
        hideRing();
        setTimeout(() => {
          handleTileSelect(e);
        }, 0);
      },
      tower(e) {
        const towerId = e.target.id;
        const [_, y, x] = towerId.split("-").map((v) => Number(v) - 50);
        const tileIdx =
          x / TILE_WIDTH +
          (y / TILE_WIDTH) * STAGES_AND_WAVES[G.stageNumber].stage.cols;
        const tile = G.tiles[tileIdx];
        G.lastSelectedTile = G.selectedTile;
        G.selectedTile = tile;
        handleTowerSelect(e);
      },
    };
    entityActions[entity](e);
  };

  playPauseBtn.onclick = (e) => {
    handlePlayPause();
  };

  gameSpeedForm.onchange = (e) => {
    e.preventDefault();
    // console.log(e.target.value);
    let speed;
    switch (e.target.value) {
      case "normal":
        speed = 1;
        break;
      case "fast":
        speed = 2;
        break;
      case "faster":
        speed = 4;
        break;
    }
    G.gameSpeed = speed;
  };
}

export function handlePlayPause() {
  G.isPlaying = !G.isPlaying;
  playPauseIcon = G.isPlaying ? "⏸" : "▶️";
  playPauseBtn.innerHTML = playPauseIcon;

  if (G.isPlaying) {
    G.frameId = requestAnimationFrame(runAnimation);
  } else {
    cancelAnimationFrame(G.frameId);
  }
}

export function handleTowerSelect(e) {
  // console.log("handleTowerSelect", { e, G });
  Array.from(document.querySelectorAll(".tower-range")).forEach((range) => {
    range.classList.remove("locked");
    range.setAttribute("opacity", 0);
  });

  if (G.lastSelectedTile?.id === G.selectedTile?.id) {
    // console.log("selected same tower");
    if (G.towerPreviewActive) {
      removePreviewTower();
    }
    focusNoTile();
    hideRing();
  } else {
    // console.log("selected different tower");
    removePreviewTower();
    const { x, y } = G.selectedTile.pos;
    const rangeCircle = document.querySelector(
      `#range-tower-${y + 50}-${x + 50}`
    );
    rangeCircle.classList.add("locked");
    rangeCircle.setAttribute("opacity", 0.1);
    updateFocusedTile();
    showRing();
    handleDisplayTileMenu(e, G.selectedTile);
  }
}

export function handleTileSelect(e) {
  // console.log("handleTileSelect", e);
  if (G.selectedTile.hasTower) {
    return handleTowerSelect(e);
  }

  // clicked same tile as before
  if (G.lastSelectedTile?.id === G.selectedTile?.id) {
    focusNoTile();
    hideRing();
  }
  // clicked another tile
  else {
    updateFocusedTile();
    if (G.selectedTile.blocked) {
      hideRing();
    } else {
      showRing();
    }
    handleDisplayTileMenu(e, G.selectedTile);
  }
}
