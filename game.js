// Game constants
const WIDTH = 800;
const HEIGHT = 600;
const GAME_DURATION = 60;

// Game state
let score = 0;
let gameState = "menu";
let startTime = null;
let sprites = {
  unicorns: [],
  dragons: [],
  clocks: [],
};

// Load images
const images = {
  background: new Image(),
  unicorn: new Image(),
  dragon: new Image(),
  clock: new Image(),
};

// Use correct paths to PNG assets
images.background.src = "/background.png";
images.unicorn.src = "/unicorn.png";
images.dragon.src = "/dragon.png";
images.clock.src = "/clock.png";

// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Sprite classes
class Sprite {
  constructor(image, size = 70) {
    this.x = Math.random() * (WIDTH - size);
    this.y = Math.random() * (HEIGHT - size);
    this.dx = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 2 + 2);
    this.dy = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 2 + 2);
    this.size = size;
    this.image = image;
  }

  update(speedFactor = 1) {
    this.x += this.dx * speedFactor;
    this.y += this.dy * speedFactor;

    if (this.x <= 0 || this.x >= WIDTH - this.size) this.dx *= -1;
    if (this.y <= 0 || this.y >= HEIGHT - this.size) this.dy *= -1;
  }

  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
  }

  contains(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.size &&
      y >= this.y &&
      y <= this.y + this.size
    );
  }
}

class Unicorn extends Sprite {
  constructor() {
    super(images.unicorn);
  }

  clicked() {
    score += 100;
    sprites.unicorns.push(new Unicorn());
  }
}

class Dragon extends Sprite {
  constructor() {
    super(images.dragon);
  }

  clicked() {
    score -= 10;
    for (let i = 0; i < 2; i++) {
      sprites.dragons.push(new Dragon());
    }
  }
}

class Clock extends Sprite {
  constructor() {
    super(images.clock, 50);
  }

  clicked() {
    Object.values(sprites)
      .flat()
      .forEach((sprite) => {
        sprite.dx *= 0.5;
        sprite.dy *= 0.5;
      });
  }
}

function initGame() {
  score = 0;
  sprites = {
    unicorns: Array(10)
      .fill()
      .map(() => new Unicorn()),
    dragons: Array(6)
      .fill()
      .map(() => new Dragon()),
    clocks: Array(2)
      .fill()
      .map(() => new Clock()),
  };
}

function startGame() {
  gameState = "playing";
  startTime = Date.now();
  document.getElementById("menu").style.display = "none";
  initGame();
  gameLoop();
}

function handleClick(event) {
  if (gameState !== "playing") return;

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  for (const [type, spriteList] of Object.entries(sprites)) {
    for (let i = spriteList.length - 1; i >= 0; i--) {
      if (spriteList[i].contains(x, y)) {
        spriteList[i].clicked();
        spriteList.splice(i, 1);
        break;
      }
    }
  }
}

function gameLoop() {
  if (gameState !== "playing") return;

  // Draw background
  ctx.drawImage(images.background, 0, 0, WIDTH, HEIGHT);

  // Calculate time and speed factor
  const elapsed = (Date.now() - startTime) / 1000;
  const remaining = Math.max(0, GAME_DURATION - elapsed);
  const speedFactor = 1 + elapsed / GAME_DURATION;

  if (remaining <= 0) {
    gameOver();
    return;
  }

  // Update and draw sprites
  Object.values(sprites)
    .flat()
    .forEach((sprite) => {
      sprite.update(speedFactor);
      sprite.draw();
    });

  // Update UI
  document.getElementById("score").textContent = `Score: ${score}`;
  document.getElementById("timer").textContent = `Time: ${Math.ceil(
    remaining
  )}s`;

  requestAnimationFrame(gameLoop);
}

function gameOver() {
  gameState = "menu";
  document.getElementById("menu").style.display = "block";
  document.getElementById("menu").innerHTML = `
        <h2>Game Over!</h2>
        <p>Final Score: ${score}</p>
        <button onclick="startGame()">Play Again</button>
    `;
}

// Event listeners
canvas.addEventListener("click", handleClick);
document.getElementById("menu").style.display = "block";
