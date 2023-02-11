import { initialGold, initialCastleHP, initialEmeralds } from "./constants";
import {
  updateGoldDisplay,
  updateEmeraldDisplay,
  updateCastleHPDisplay,
  updateWaveDisplay,
  getStageNumberFromUrl,
} from "./helpers";
import { createGrid, updateVisibleTiles } from "./tiles";

const G = {
  frameId: 0,
  tick: 0,
  clock: 0,
  gold: initialGold,
  emeralds: initialEmeralds,
  castleHP: initialCastleHP,
  mouse: { x: null, y: null },
  lastClick: { x: null, y: null },
  enemies: [],
  towers: [],
  bullets: [],
  tiles: null,
  bulletCount: 0,
  tileChain: [],
  selectedTile: null,
  lastSelectedTile: null,
  isPlaying: false,
  inBattle: false,
  towerPreviewActive: false,
  stageNumber: 1,
  waveNumber: null,
  wavesTimes: [{ start: 0, end: null }],
  gameSpeed: 2,
};

G.stageNumber = getStageNumberFromUrl();
G.tiles = createGrid();

updateVisibleTiles();
updateGoldDisplay();
updateEmeraldDisplay();
updateCastleHPDisplay();
updateWaveDisplay(0);

export { G };
