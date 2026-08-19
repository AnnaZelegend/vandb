const startButton = document.querySelector('#start-pig-game');
const closeGameButton = document.querySelector('#close-pig-game');
const game = document.querySelector('#pig-game');
const arena = document.querySelector('#game-arena');
const pig = document.querySelector('#running-pig');
const hand = document.querySelector('#player-hand');
const levelLabel = document.querySelector('#level-label');
const gameStatus = document.querySelector('#game-status');
const unlockedMessage = document.querySelector('#victor-message');

const levels = [
  { name: 'The pen', speed: 900 },
  { name: 'The field', speed: 650 },
  { name: 'The big plot', speed: 430 }
];

let level = 0;
let pigTimer;

startButton.addEventListener('click', startGame);
closeGameButton.addEventListener('click', stopGame);
pig.addEventListener('click', catchPig);

arena.addEventListener('pointermove', (event) => {
  const bounds = arena.getBoundingClientRect();
  hand.style.left = `${event.clientX - bounds.left}px`;
  hand.style.top = `${event.clientY - bounds.top}px`;
});

function startGame() {
  level = 0;
  unlockedMessage.hidden = true;
  game.hidden = false;
  game.scrollIntoView({ behavior: 'smooth', block: 'center' });
  beginLevel();
}

function beginLevel() {
  clearInterval(pigTimer);
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
  clearInterval(pigTimer);
  pig.style.transform = 'translate(-50%, -50%) scale(.78)';

  if (level === levels.length - 1) {
    gameStatus.textContent = 'You caught him — all three levels complete!';
    startButton.textContent = 'Play again →';
    unlockedMessage.hidden = false;
    setTimeout(() => unlockedMessage.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
    return;
  }

  gameStatus.textContent = `Caught! Level ${level + 2} is faster.`;
  level += 1;
  setTimeout(() => {
    pig.style.transform = '';
    beginLevel();
  }, 850);
}

function stopGame() {
  clearInterval(pigTimer);
  game.hidden = true;
}
