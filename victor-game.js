const startButton = document.querySelector('#start-pig-game');
const closeGameButton = document.querySelector('#close-pig-game');
const game = document.querySelector('#pig-game');
const arena = document.querySelector('#game-arena');
const pig = document.querySelector('#running-pig');
const hand = document.querySelector('#player-hand');
const levelLabel = document.querySelector('#level-label');
const gameStatus = document.querySelector('#game-status');
const unlockedMessage = document.querySelector('#victor-message');
const roundOverlay = document.querySelector('#round-overlay');
const roundOverlayTitle = document.querySelector('#round-overlay-title');

const levels = [
  { name: 'The pen', speed: 900 },
  { name: 'The field', speed: 650 },
  { name: 'The big plot', speed: 430 }
];

let level = 0;
let pigTimer;
let bannerTimer;
let transitionTimer;
let gamePaused = true;

startButton.addEventListener('click', startGame);
closeGameButton.addEventListener('click', stopGame);
pig.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  event.stopPropagation();
  catchPig();
});

arena.addEventListener('pointermove', (event) => {
  const bounds = arena.getBoundingClientRect();
  hand.style.left = `${event.clientX - bounds.left}px`;
  hand.style.top = `${event.clientY - bounds.top}px`;
});

arena.addEventListener('pointerdown', (event) => {
  hand.classList.remove('tap');
  void hand.offsetWidth;
  hand.classList.add('tap');
  if (gamePaused) return;
  const pigBounds = pig.getBoundingClientRect();
  const pigCenterX = pigBounds.left + pigBounds.width / 2;
  const pigCenterY = pigBounds.top + pigBounds.height / 2;
  const distance = Math.hypot(event.clientX - pigCenterX, event.clientY - pigCenterY);
  if (distance <= 62) catchPig();
});

function startGame() {
  clearTimeout(bannerTimer);
  clearTimeout(transitionTimer);
  level = 0;
  unlockedMessage.hidden = true;
  game.hidden = false;
  game.scrollIntoView({ behavior: 'smooth', block: 'center' });
  showRoundBanner();
}

function beginLevel() {
  clearInterval(pigTimer);
  gamePaused = false;
  pig.disabled = false;
  pig.style.transform = '';
  arena.className = `game-arena level-${level + 1}`;
  levelLabel.textContent = `Level ${level + 1} · ${levels[level].name}`;
  gameStatus.textContent = 'Move your hand and click the pig.';
  movePig();
  pigTimer = setInterval(movePig, levels[level].speed);
}

function movePig() {
  const padding = 45;
  const maxX = Math.max(padding, arena.clientWidth - padding);
  const maxY = Math.max(padding, arena.clientHeight - padding);
  const currentX = Number.parseFloat(pig.style.left) || arena.clientWidth / 2;
  const nextX = padding + Math.random() * (maxX - padding);
  pig.dataset.direction = nextX < currentX ? 'left' : 'right';
  pig.style.left = `${nextX}px`;
  pig.style.top = `${padding + Math.random() * (maxY - padding)}px`;
}

function catchPig() {
  if (gamePaused) return;
  gamePaused = true;
  pig.disabled = true;
  clearInterval(pigTimer);
  pig.style.transform = 'translate(-50%, -50%) scale(.78)';
  showOverlay('You caught that pig!');

  if (level === levels.length - 1) {
    transitionTimer = setTimeout(() => {
      hideOverlay();
      gameStatus.textContent = 'All three levels complete!';
      startButton.textContent = 'Play again →';
      unlockedMessage.hidden = false;
      unlockedMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1300);
    return;
  }

  transitionTimer = setTimeout(() => {
    level += 1;
    showRoundBanner();
  }, 1300);
}

function stopGame() {
  clearInterval(pigTimer);
  clearTimeout(bannerTimer);
  clearTimeout(transitionTimer);
  gamePaused = true;
  hideOverlay();
  game.hidden = true;
}

function showRoundBanner() {
  arena.className = `game-arena level-${level + 1}`;
  levelLabel.textContent = `Level ${level + 1} · ${levels[level].name}`;
  showOverlay(`Round ${level + 1}`);
  bannerTimer = setTimeout(() => {
    hideOverlay();
    beginLevel();
  }, 1050);
}

function showOverlay(message) {
  roundOverlayTitle.textContent = message;
  roundOverlay.classList.add('show');
}

function hideOverlay() {
  roundOverlay.classList.remove('show');
}

// Edible and Unedible
const donkeyGame = document.querySelector('#donkey-game');
const donkey = document.querySelector('#donkey');
const donkeyStage = document.querySelector('#donkey-stage');
const fallingItems = document.querySelector('#falling-items');
const donkeyLabel = document.querySelector('#donkey-level-label');
const donkeyStatus = document.querySelector('#donkey-status');
const donkeyOverlay = document.querySelector('#donkey-overlay');
const donkeyOverlayTitle = document.querySelector('#donkey-overlay-title');
const donkeyMessage = document.querySelector('#donkey-message');
const edibleItems = ['🥕', '🍎', '🥬', '🌽', '🍐', '🥦', '🍓', '🍉', '🍌'];
const inedibleItems = ['🔑', '🧦', '🧱', '📱', '🧼', '💡', '🪥', '🧤', '🔩', '🪨'];
const donkeyRounds = [
  { target: 4, spawnEvery: 900, fallSpeed: 105 },
  { target: 6, spawnEvery: 680, fallSpeed: 145 },
  { target: 8, spawnEvery: 490, fallSpeed: 190 }
];
let donkeyRound = 0;
let foodCaught = 0;
let donkeyPlaying = false;
let donkeyItems = [];
let donkeySpawnTimer;
let donkeyFrame;
let lastDonkeyFrame = 0;

document.querySelector('#start-donkey-game').addEventListener('click', () => {
  donkeyRound = 0;
  donkeyMessage.hidden = true;
  donkeyGame.hidden = false;
  donkeyGame.scrollIntoView({ behavior: 'smooth', block: 'center' });
  showGameBanner(donkeyOverlay, donkeyOverlayTitle, 'Round 1', renderDonkeyRound);
});
document.querySelector('#close-donkey-game').addEventListener('click', () => {
  stopDonkeyRound();
  donkeyGame.hidden = true;
});

donkeyStage.addEventListener('pointermove', moveDonkey);
donkeyStage.addEventListener('pointerdown', moveDonkey);

function renderDonkeyRound() {
  stopDonkeyRound();
  fallingItems.replaceChildren();
  donkeyItems = [];
  foodCaught = 0;
  donkeyPlaying = true;
  donkeyLabel.textContent = `Round ${donkeyRound + 1} · 0/${donkeyRounds[donkeyRound].target} food`;
  donkeyStatus.textContent = 'Move the donkey with your pointer.';
  donkeySpawnTimer = setInterval(spawnDonkeyItem, donkeyRounds[donkeyRound].spawnEvery);
  spawnDonkeyItem();
  lastDonkeyFrame = performance.now();
  donkeyFrame = requestAnimationFrame(updateDonkeyItems);
}

function moveDonkey(event) {
  const bounds = donkeyStage.getBoundingClientRect();
  const x = Math.max(44, Math.min(bounds.width - 44, event.clientX - bounds.left));
  const y = Math.max(70, Math.min(bounds.height - 44, event.clientY - bounds.top));
  donkey.style.left = `${x}px`;
  donkey.style.top = `${y}px`;
}

function spawnDonkeyItem() {
  if (!donkeyPlaying) return;
  const isFood = Math.random() > .4;
  const icons = isFood ? edibleItems : inedibleItems;
  const element = document.createElement('span');
  element.className = 'falling-item';
  element.textContent = icons[Math.floor(Math.random() * icons.length)];
  const item = { element, isFood, x: 35 + Math.random() * (donkeyStage.clientWidth - 70), y: -30 };
  element.style.left = `${item.x}px`;
  element.style.top = `${item.y}px`;
  fallingItems.append(element);
  donkeyItems.push(item);
}

function updateDonkeyItems(time) {
  if (!donkeyPlaying) return;
  const elapsed = Math.min(40, time - lastDonkeyFrame) / 1000;
  lastDonkeyFrame = time;
  const donkeyBounds = donkey.getBoundingClientRect();
  const stageBounds = donkeyStage.getBoundingClientRect();
  const donkeyX = donkeyBounds.left - stageBounds.left + donkeyBounds.width / 2;
  const donkeyY = donkeyBounds.top - stageBounds.top + donkeyBounds.height / 2;

  donkeyItems = donkeyItems.filter((item) => {
    item.y += donkeyRounds[donkeyRound].fallSpeed * elapsed;
    item.element.style.top = `${item.y}px`;
    if (Math.hypot(item.x - donkeyX, item.y - donkeyY) < 55) {
      item.element.remove();
      catchDonkeyItem(item.isFood);
      return false;
    }
    if (item.y > donkeyStage.clientHeight + 35) {
      item.element.remove();
      return false;
    }
    return true;
  });
  donkeyFrame = requestAnimationFrame(updateDonkeyItems);
}

function catchDonkeyItem(isFood) {
  if (!donkeyPlaying) return;
  if (!isFood) {
    stopDonkeyRound();
    donkeyStatus.textContent = '';
    showGameBanner(donkeyOverlay, donkeyOverlayTitle, 'Not food — try again!', () => {
      showGameBanner(donkeyOverlay, donkeyOverlayTitle, `Round ${donkeyRound + 1}`, renderDonkeyRound);
    });
    return;
  }
  donkey.classList.add('chew');
  setTimeout(() => donkey.classList.remove('chew'), 220);
  foodCaught += 1;
  donkeyLabel.textContent = `Round ${donkeyRound + 1} · ${foodCaught}/${donkeyRounds[donkeyRound].target} food`;
  if (foodCaught < donkeyRounds[donkeyRound].target) return;
  stopDonkeyRound();
  if (donkeyRound === 2) {
    showGameBanner(donkeyOverlay, donkeyOverlayTitle, 'Round complete!', () => {
      donkeyStatus.textContent = 'Message unlocked!';
      document.querySelector('#start-donkey-game').textContent = 'Play again →';
      donkeyMessage.hidden = false;
      donkeyMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    return;
  }
  donkeyStatus.textContent = '';
  showGameBanner(donkeyOverlay, donkeyOverlayTitle, 'Round complete!', () => {
    donkeyRound += 1;
    showGameBanner(donkeyOverlay, donkeyOverlayTitle, `Round ${donkeyRound + 1}`, renderDonkeyRound);
  });
}

function stopDonkeyRound() {
  donkeyPlaying = false;
  clearInterval(donkeySpawnTimer);
  cancelAnimationFrame(donkeyFrame);
}

// Memory Meadow
const memoryGame = document.querySelector('#memory-game');
const memoryTiles = [...document.querySelectorAll('.memory-tile')];
const memoryLabel = document.querySelector('#memory-level-label');
const memoryStatus = document.querySelector('#memory-status');
const memoryOverlay = document.querySelector('#memory-overlay');
const memoryOverlayTitle = document.querySelector('#memory-overlay-title');
const memoryMessage = document.querySelector('#memory-message');
const patternLengths = [3, 5, 7];
let memoryRound = 0;
let memoryPattern = [];
let playerPattern = [];
let memoryLocked = true;

document.querySelector('#start-memory-game').addEventListener('click', () => {
  memoryRound = 0;
  memoryMessage.hidden = true;
  memoryGame.hidden = false;
  memoryGame.scrollIntoView({ behavior: 'smooth', block: 'center' });
  showGameBanner(memoryOverlay, memoryOverlayTitle, 'Round 1', beginMemoryRound);
});
document.querySelector('#close-memory-game').addEventListener('click', () => { memoryGame.hidden = true; });
memoryTiles.forEach((tile) => tile.addEventListener('click', () => chooseMemoryTile(Number(tile.dataset.tile))));

async function beginMemoryRound() {
  memoryLocked = true;
  playerPattern = [];
  memoryPattern = Array.from({ length: patternLengths[memoryRound] }, () => Math.floor(Math.random() * 4));
  memoryLabel.textContent = `Round ${memoryRound + 1} · ${memoryPattern.length} steps`;
  memoryStatus.textContent = 'Watch the pattern.';
  await wait(600);
  for (const tileIndex of memoryPattern) {
    flashTile(tileIndex);
    await wait(Math.max(320, 620 - memoryRound * 130));
  }
  memoryLocked = false;
  memoryStatus.textContent = 'Your turn.';
}

function chooseMemoryTile(tileIndex) {
  if (memoryLocked) return;
  flashTile(tileIndex);
  playerPattern.push(tileIndex);
  const position = playerPattern.length - 1;
  if (tileIndex !== memoryPattern[position]) {
    memoryLocked = true;
    memoryStatus.textContent = '';
    showGameBanner(memoryOverlay, memoryOverlayTitle, 'Not quite — try again!', () => {
      showGameBanner(memoryOverlay, memoryOverlayTitle, `Round ${memoryRound + 1}`, beginMemoryRound);
    });
    return;
  }
  if (playerPattern.length !== memoryPattern.length) return;
  memoryLocked = true;
  if (memoryRound === 2) {
    showGameBanner(memoryOverlay, memoryOverlayTitle, 'Round complete!', () => {
      memoryStatus.textContent = 'Message unlocked!';
      document.querySelector('#start-memory-game').textContent = 'Play again →';
      memoryMessage.hidden = false;
      memoryMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    return;
  }
  memoryStatus.textContent = '';
  showGameBanner(memoryOverlay, memoryOverlayTitle, 'Round complete!', () => {
    memoryRound += 1;
    showGameBanner(memoryOverlay, memoryOverlayTitle, `Round ${memoryRound + 1}`, beginMemoryRound);
  });
}

function flashTile(index) {
  memoryTiles[index].classList.add('active');
  setTimeout(() => memoryTiles[index].classList.remove('active'), 260);
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function showGameBanner(overlay, title, message, next) {
  title.textContent = message;
  overlay.classList.add('show');
  setTimeout(() => {
    overlay.classList.remove('show');
    if (next) setTimeout(next, 220);
  }, 1050);
}
