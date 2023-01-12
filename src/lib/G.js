import { COLS, ROWS,initialGold , initialCastleHP} from "./constants";
import { updateGoldDisplay, updateCastleHPDisplay,updateWaveDisplay } from "./helpers";
import { createGrid, updateVisibleTiles } from "./tiles";

const G = {
  frameId: 0,
  tick: 0,
  clock: 0,
  gold: initialGold,
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
G.tiles = createGrid(COLS, ROWS);
updateVisibleTiles();
updateGoldDisplay()
updateCastleHPDisplay()
updateWaveDisplay(0)
export { G };
