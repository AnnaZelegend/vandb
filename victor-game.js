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
  pig.style.left = `${padding + Math.random() * (maxX - padding)}px`;
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
const foodGrid = document.querySelector('#food-grid');
const donkeyLabel = document.querySelector('#donkey-level-label');
const donkeyStatus = document.querySelector('#donkey-status');
const donkeyRounds = [
  [{ icon: '🥕', food: true }, { icon: '🍎', food: true }, { icon: '🔑', food: false }, { icon: '🥬', food: true }, { icon: '🧦', food: false }],
  [{ icon: '🌽', food: true }, { icon: '🧱', food: false }, { icon: '🍐', food: true }, { icon: '📱', food: false }, { icon: '🥦', food: true }, { icon: '🧼', food: false }, { icon: '🍓', food: true }],
  [{ icon: '🥕', food: true }, { icon: '💡', food: false }, { icon: '🍉', food: true }, { icon: '🪥', food: false }, { icon: '🥬', food: true }, { icon: '🧤', food: false }, { icon: '🍌', food: true }, { icon: '🔩', food: false }, { icon: '🍎', food: true }, { icon: '🪨', food: false }]
];
let donkeyRound = 0;
let edibleRemaining = 0;

document.querySelector('#start-donkey-game').addEventListener('click', () => {
  donkeyRound = 0;
  donkeyGame.hidden = false;
  donkeyGame.scrollIntoView({ behavior: 'smooth', block: 'center' });
  renderDonkeyRound();
});
document.querySelector('#close-donkey-game').addEventListener('click', () => { donkeyGame.hidden = true; });

function renderDonkeyRound() {
  foodGrid.replaceChildren();
  donkeyLabel.textContent = `Round ${donkeyRound + 1} · Choose the food`;
  donkeyStatus.textContent = '';
  const items = [...donkeyRounds[donkeyRound]].sort(() => Math.random() - .5);
  edibleRemaining = items.filter((item) => item.food).length;
  items.forEach((item) => {
    const button = document.createElement('button');
    button.className = 'food-item';
    button.type = 'button';
    button.textContent = item.icon;
    button.setAttribute('aria-label', `Feed donkey ${item.icon}`);
    button.addEventListener('click', () => feedDonkey(button, item.food));
    foodGrid.append(button);
  });
}

function feedDonkey(button, isFood) {
  if (!isFood) {
    button.classList.add('wrong');
    donkeyStatus.textContent = 'Not edible — retrying this round.';
    setTimeout(renderDonkeyRound, 850);
    return;
  }
  button.classList.add('fed');
  donkey.classList.add('chew');
  setTimeout(() => donkey.classList.remove('chew'), 220);
  edibleRemaining -= 1;
  if (edibleRemaining > 0) return;
  if (donkeyRound === 2) {
    donkeyStatus.textContent = 'Round 3 complete — message unlocked!';
    document.querySelector('#start-donkey-game').textContent = 'Play again →';
    return;
  }
  donkeyRound += 1;
  donkeyStatus.textContent = 'Good feeding! Next round...';
  setTimeout(renderDonkeyRound, 800);
}

// Memory Meadow
const memoryGame = document.querySelector('#memory-game');
const memoryTiles = [...document.querySelectorAll('.memory-tile')];
const memoryLabel = document.querySelector('#memory-level-label');
const memoryStatus = document.querySelector('#memory-status');
const patternLengths = [3, 5, 7];
let memoryRound = 0;
let memoryPattern = [];
let playerPattern = [];
let memoryLocked = true;

document.querySelector('#start-memory-game').addEventListener('click', () => {
  memoryRound = 0;
  memoryGame.hidden = false;
  memoryGame.scrollIntoView({ behavior: 'smooth', block: 'center' });
  beginMemoryRound();
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
    memoryStatus.textContent = 'Not quite — retrying this round.';
    setTimeout(beginMemoryRound, 900);
    return;
  }
  if (playerPattern.length !== memoryPattern.length) return;
  memoryLocked = true;
  if (memoryRound === 2) {
    memoryStatus.textContent = 'Round 3 complete — message unlocked!';
    document.querySelector('#start-memory-game').textContent = 'Play again →';
    return;
  }
  memoryRound += 1;
  memoryStatus.textContent = 'Correct! Next round...';
  setTimeout(beginMemoryRound, 900);
}

function flashTile(index) {
  memoryTiles[index].classList.add('active');
  setTimeout(() => memoryTiles[index].classList.remove('active'), 260);
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
