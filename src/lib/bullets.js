import { EXPLOSION_RADIUS } from "./constants";
import { bulletsG } from "../lib/dom-selects";
import { G } from "./G";
import { getAngle } from "./helpers";

export function createBullet(tower, enemy) {
  const newBullet = {
    id: G.bulletCount++,
    type: tower.type,
    speed: tower.bullet_speed,
    damage: tower.damage,
    towerPos: tower.pos,
    pos: tower.pos,
    shape: null,
    path: null,
    defs: null,
    enemy,
    init() {
      this.path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      this.path.setAttribute(
        "d",
        `M ${this.pos.x} ${this.pos.y} L ${this.enemy.pos.x} ${this.enemy.pos.y}`
      );

      if (this.type === "lightning") {
        this.path.setAttribute("stroke-width", 2);
        this.path.setAttribute("stroke", "gold");

        bulletsG.append(this.path);
      }

      if (this.type !== "lightning") {
        this.shape = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        this.shape.setAttribute("r", 24);
        this.shape.setAttribute("stroke", "green");
        this.shape.setAttribute("stroke-width", 1);
        this.shape.setAttribute("cx", this.pos.x);
        this.shape.setAttribute("cy", this.pos.y);
        // this.shape.setAttribute("transform", 'translate(30,50)');
        // this.shape.setAttribute("fill", TOWERS[this.type].fill);

        const patternId = `bullet-pattern-${this.id}`;
        const bulletImgs = {
          fire: "/assets/sprites/bullet.svg",
          ice: "/assets/sprites/ice-bullet.svg",
          earth: "/assets/sprites/earth-bullet.svg",
        };
        const translations = {
          fire: "4px, 4px",
          ice: "4px, 4px",
          earth: "4px, 10px",
        };
        const angle = getAngle(
          tower.pos.x,
          tower.pos.y,
          enemy.pos.x,
          enemy.pos.y
        );

        const bulletImg = bulletImgs[this.type];
        const imgTransform = `translate(${
          translations[this.type]
        }) rotate(${angle}deg)`;

        // this.shape.setAttribute("fill", TOWERS[this.type].fill);
        this.shape.setAttribute("fill", `url(#${patternId})`);

        this.defs = document.createElementNS(
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
        this.defs.setAttribute("id", `bullet-defs-${this.id}`);
        this.defs.setAttribute("class", "defs bullet-defs");
        pattern.setAttribute("id", patternId);
        pattern.setAttribute("width", 1);
        pattern.setAttribute("height", 1);
        image.setAttribute("href", bulletImg);
        image.setAttribute("id", `bullet-image-${this.id}`);
        image.setAttribute("class", `bullet-image`);
        image.setAttribute("width", 40);
        image.setAttribute("height", 40);

        image.style.transform = imgTransform;

        pattern.append(image);
        this.defs.append(pattern);
        bulletsG.append(this.defs);
        bulletsG.append(this.shape);
      }
    },
    move() {
      const nextPos = this.path.getPointAtLength(
        this.speed * G.gameSpeed * 0.05
      );
      this.pos = nextPos;
      this.path.setAttribute(
        "d",
        `M ${this.pos.x} ${this.pos.y} L ${this.enemy.pos.x} ${this.enemy.pos.y}`
      );

      if (this.type !== "lightning") {
        this.shape.setAttribute("cx", this.pos.x);
        this.shape.setAttribute("cy", this.pos.y);
      }
    },
    hit(enemy) {
      enemy.hp -= this.damage;
      this.remove();
    },
    remove() {
      if (this.type !== "lightning") {
        this.shape.remove();
        this.defs.remove();
      }
      this.path.remove();
      G.bullets = G.bullets.filter((b) => b.id !== this.id);
      // const idx = G.bullets.findIndex((b) => b.id === this.id);
      // G.bullets.splice(idx, 1);
    },
    handleExplosion(nearbyEnemies) {
      const splashDamage = this.damage / 4;

      const explosion = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );

      explosion.setAttribute("r", EXPLOSION_RADIUS);
      explosion.setAttribute("cx", this.pos.x);
      explosion.setAttribute("cy", this.pos.y);
      explosion.classList.add("explosion");

      bulletsG.append(explosion);

      nearbyEnemies.forEach((enemy) => {
        enemy.hp -= splashDamage;
      });

      setTimeout(() => {
        explosion.remove();
      }, 1000);
    },
  };
  newBullet.init();
  return newBullet;
}

export function resetBullets() {
  console.log("reset bullets now!", {
    bulletsG,
    childCount: bulletsG.childElementCount,
  });

  bulletsG.innerHTML = "";
}
