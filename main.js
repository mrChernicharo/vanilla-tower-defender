const G = {
  frameId: 0,
  tick: 0,
  loopTimestamp: 0,
  timestamp: Date.now(),
  mouse: { x: null, y: null },
  lastClick: { x: null, y: null },
  enemies: [],
  towers: [],
  bullets: [],
  tiles: [],
  isPlaying: false,
  stageNumber: 1,
  waveNumber: null,
  wavesData: [{ s: 0, e: null }],
  sceneRect: null,
};

const scene = document.querySelector("#scene");
const g = document.querySelector("g");
const test = document.querySelector("#test");
const playPauseBtn = document.querySelector("#play-pause-btn");
const sceneRect = scene.getBoundingClientRect();

scene.onpointermove = (e) => {
  G.mouse = { x: e.offsetX, y: e.offsetY };
};
scene.onclick = (e) => {
  G.lastClick = { x: e.offsetX, y: e.offsetY };
  console.log(G);
};
playPauseBtn.onclick = (e) => {
  G.isPlaying = !G.isPlaying;
  const icon = G.isPlaying ? "⏸" : "▶️";
  playPauseBtn.innerHTML = icon;

  if (G.isPlaying) {
    G.loopTimestamp = 0;
    G.timestamp = Date.now();
    G.tick = 0;
    G.frameId = requestAnimationFrame(runAnimation);
  } else {
    cancelAnimationFrame(G.frameId);
    G.tick = 0;
  }
};

function update() {
  for(let enemy of G.enemies) {
    enemy.circle.setAttribute('cy', Number(enemy.circle.getAttribute('cy')) + 1)
  }
}

function runAnimation(frame) {
  G.tick++;
  G.loopTimestamp = Date.now() - G.timestamp;
  // console.log(G.loopTimestamp);

  // test.setAttribute('cy', Number(test.getAttribute('cy')) + 1)

  


  // spawn enemy
  if (G.tick % 60 === 0) {
    const newEnemy = {
      id: G.tick,
      enemy: "dwarf",
      circle: null,
      pos: {
        x: sceneRect.x + sceneRect.width / 2,
        y: 250 ,
      },
      init() {
        this.circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle')
        this.circle.setAttribute('cx', parseInt(this.pos.x))
        this.circle.setAttribute('cy', parseInt(this.pos.y))
        this.circle.setAttribute('r', 25)
        this.circle.setAttribute('fill', 'blue')
        scene.append(this.circle)
      },
 
    }
    
    newEnemy.init()
    G.enemies.push(newEnemy);
  }
  update()


  if (G.isPlaying) {
    requestAnimationFrame(runAnimation);
  }
}
