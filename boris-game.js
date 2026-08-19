function showBorisBanner(overlay, title, message, next) {
  title.textContent = message;
  overlay.classList.add('show');
  setTimeout(() => {
    overlay.classList.remove('show');
    if (next) setTimeout(next, 220);
  }, 1050);
}

// Is it bullish or bearish?
const stockGame = document.querySelector('#stock-game');
const stockLine = document.querySelector('#stock-line');
const stockPrice = document.querySelector('#stock-price');
const profitZone = document.querySelector('#profit-zone');
const stockStatus = document.querySelector('#stock-status');
const stockLabel = document.querySelector('#stock-round-label');
const stockOverlay = document.querySelector('#stock-overlay');
const stockOverlayTitle = document.querySelector('#stock-overlay-title');
const stockMessage = document.querySelector('#stock-message');
const stockSpeeds = [140, 115, 95];
const stockTargets = [
  { min: 48, max: 108 },
  { min: 58, max: 94 },
  { min: 64, max: 88 }
];
let stockRound = 0;
let stockPoints = [];
let currentPrice = 100;
let stockTimer;
let stockPlaying = false;

document.querySelector('#start-stock-game').addEventListener('click', () => {
  stockRound = 0;
  stockMessage.hidden = true;
  stockGame.hidden = false;
  stockGame.scrollIntoView({ behavior: 'smooth', block: 'center' });
  showBorisBanner(stockOverlay, stockOverlayTitle, 'Round 1', beginStockRound);
});
document.querySelector('#close-stock-game').addEventListener('click', () => { stopStock(); stockGame.hidden = true; });
document.querySelector('#sell-stock').addEventListener('click', sellStock);

function beginStockRound() {
  clearInterval(stockTimer);
  stockPlaying = true;
  currentPrice = 100;
  stockPoints = [{ x: 0, y: 240 }];
  stockLabel.textContent = `Round ${stockRound + 1}`;
  const target = stockTargets[stockRound];
  profitZone.style.top = `${target.min / 3}%`;
  profitZone.style.height = `${(target.max - target.min) / 3}%`;
  stockStatus.textContent = 'Click SELL while the line is inside the green zone.';
  drawStock();
  stockTimer = setInterval(tickStock, stockSpeeds[stockRound]);
}

function tickStock() {
  const last = stockPoints.at(-1);
  const nextX = last.x + 12;
  const climb = 10 + stockRound * 2.5;
  const volatility = 7 + stockRound * 8;
  const nextY = last.y <= 30 ? 245 : Math.max(24, last.y - climb + (Math.random() - .5) * volatility);
  stockPoints.push({ x: nextX, y: nextY });
  if (nextX > 800) stockPoints = stockPoints.map((point) => ({ ...point, x: point.x - 12 })).filter((point) => point.x >= 0);
  currentPrice = 100 + (240 - nextY) / 3;
  drawStock();
}

function drawStock() {
  stockLine.setAttribute('points', stockPoints.map((point) => `${point.x},${point.y}`).join(' '));
  stockPrice.textContent = `$${currentPrice.toFixed(2)}`;
}

function sellStock() {
  if (!stockPlaying) return;
  stockPlaying = false;
  clearInterval(stockTimer);
  const y = stockPoints.at(-1).y;
  const target = stockTargets[stockRound];
  if (y <= target.max && y >= target.min) {
    showBorisBanner(stockOverlay, stockOverlayTitle, 'Perfect sell!', advanceStockRound);
  } else {
    showBorisBanner(stockOverlay, stockOverlayTitle, 'Too early — try again!', () => showBorisBanner(stockOverlay, stockOverlayTitle, `Round ${stockRound + 1}`, beginStockRound));
  }
}

function advanceStockRound() {
  if (stockRound === 2) {
    stockStatus.textContent = 'Message unlocked!';
    document.querySelector('#start-stock-game').textContent = 'Play again →';
    stockMessage.hidden = false;
    stockMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  stockRound += 1;
  showBorisBanner(stockOverlay, stockOverlayTitle, `Round ${stockRound + 1}`, beginStockRound);
}

function stopStock() {
  stockPlaying = false;
  clearInterval(stockTimer);
}

// Save the NPC
const npcGame = document.querySelector('#npc-game');
const npcWorld = document.querySelector('#npc-world');
const borisPlayer = document.querySelector('#boris-player');
const npcPerson = document.querySelector('#npc-person');
const npcImage = document.querySelector('#npc-image');
const npcQuestion = document.querySelector('#npc-question');
const questionText = document.querySelector('#question-text');
const answerOptions = document.querySelector('#answer-options');
const npcStatus = document.querySelector('#npc-status');
const npcLabel = document.querySelector('#npc-round-label');
const npcOverlay = document.querySelector('#npc-overlay');
const npcOverlayTitle = document.querySelector('#npc-overlay-title');
const npcMessage = document.querySelector('#npc-message');
const npcQuestions = [
  { subject: 'Math', question: 'Solve: 3x + 5 = 20. What is x?', answers: ['3', '5', '8'], correct: 1 },
  { subject: 'Science', question: 'Which part of a cell controls its activities?', answers: ['Cell wall', 'Nucleus', 'Cytoplasm'], correct: 1 },
  { subject: 'History', question: 'Which ancient civilization developed democracy in Athens?', answers: ['Greece', 'Egypt', 'Rome'], correct: 0 }
];
const npcSprites = ['assets/npc-fullbody.png', 'assets/npc-girl-fullbody.png', 'assets/npc-fullbody.png'];
let npcRound = 0;
let playerPosition = 7;

document.querySelector('#start-npc-game').addEventListener('click', () => {
  npcRound = 0;
  npcMessage.hidden = true;
  npcGame.hidden = false;
  npcGame.scrollIntoView({ behavior: 'smooth', block: 'center' });
  showBorisBanner(npcOverlay, npcOverlayTitle, 'Round 1', beginNpcRound);
});
document.querySelector('#close-npc-game').addEventListener('click', () => { npcGame.hidden = true; });
document.querySelector('#walk-left').addEventListener('click', () => walkBoris(-8));
document.querySelector('#walk-right').addEventListener('click', () => walkBoris(8));
document.addEventListener('keydown', (event) => {
  if (npcGame.hidden) return;
  if (event.key === 'ArrowLeft') walkBoris(-8);
  if (event.key === 'ArrowRight') walkBoris(8);
});
npcPerson.addEventListener('click', tryNpc);

function beginNpcRound() {
  playerPosition = 7;
  borisPlayer.style.left = `${playerPosition}%`;
  npcImage.src = npcSprites[npcRound];
  npcQuestion.hidden = true;
  npcLabel.textContent = `Round ${npcRound + 1} · ${npcQuestions[npcRound].subject}`;
  npcStatus.textContent = 'Walk to the NPC using the arrows.';
}

function walkBoris(amount) {
  playerPosition = Math.max(2, Math.min(82, playerPosition + amount));
  borisPlayer.style.left = `${playerPosition}%`;
  borisPlayer.classList.remove('walking');
  void borisPlayer.offsetWidth;
  borisPlayer.classList.add('walking');
  if (playerPosition >= 56) tryNpc();
}

function tryNpc() {
  if (playerPosition < 52) {
    npcStatus.textContent = 'Move closer to the NPC.';
    return;
  }
  const data = npcQuestions[npcRound];
  questionText.textContent = data.question;
  answerOptions.replaceChildren();
  data.answers.forEach((answer, index) => {
    const button = document.createElement('button');
    button.className = 'answer-button';
    button.type = 'button';
    button.textContent = answer;
    button.addEventListener('click', () => answerNpc(index));
    answerOptions.append(button);
  });
  npcQuestion.hidden = false;
  npcStatus.textContent = '';
}

function answerNpc(answerIndex) {
  if (answerIndex !== npcQuestions[npcRound].correct) {
    npcQuestion.hidden = true;
    showBorisBanner(npcOverlay, npcOverlayTitle, 'Try that question again!', tryNpc);
    return;
  }
  npcQuestion.hidden = true;
  showBorisBanner(npcOverlay, npcOverlayTitle, 'NPC saved!', () => {
    if (npcRound === 2) {
      npcStatus.textContent = 'Message unlocked!';
      document.querySelector('#start-npc-game').textContent = 'Play again →';
      npcMessage.hidden = false;
      npcMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    npcRound += 1;
    showBorisBanner(npcOverlay, npcOverlayTitle, `Round ${npcRound + 1}`, beginNpcRound);
  });
}

// Market Lock sliding puzzle
const sliderGame = document.querySelector('#slider-game');
const sliderBoard = document.querySelector('#slider-board');
const sliderStatus = document.querySelector('#slider-status');
const sliderLabel = document.querySelector('#slider-round-label');
const sliderOverlay = document.querySelector('#slider-overlay');
const sliderOverlayTitle = document.querySelector('#slider-overlay-title');
const sliderMessage = document.querySelector('#slider-message');
const sliderScrambles = [3, 5, 8];
let sliderRound = 0;
let tiles = [];

document.querySelector('#start-slider-game').addEventListener('click', () => {
  sliderRound = 0;
  sliderMessage.hidden = true;
  sliderGame.hidden = false;
  sliderGame.scrollIntoView({ behavior: 'smooth', block: 'center' });
  showBorisBanner(sliderOverlay, sliderOverlayTitle, 'Round 1', beginSliderRound);
});
document.querySelector('#close-slider-game').addEventListener('click', () => { sliderGame.hidden = true; });

function beginSliderRound() {
  tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  let previousBlank = -1;
  for (let move = 0; move < sliderScrambles[sliderRound]; move += 1) {
    const blank = tiles.indexOf(0);
    const choices = adjacentTiles(blank).filter((index) => index !== previousBlank);
    const chosen = choices[Math.floor(Math.random() * choices.length)];
    previousBlank = blank;
    [tiles[blank], tiles[chosen]] = [tiles[chosen], tiles[blank]];
  }
  sliderLabel.textContent = `Round ${sliderRound + 1} · ${sliderScrambles[sliderRound]}-move scramble`;
  sliderStatus.textContent = 'Put the numbers in order.';
  renderSlider();
}

function renderSlider() {
  sliderBoard.replaceChildren();
  tiles.forEach((number, index) => {
    const button = document.createElement('button');
    button.className = `slider-tile${number === 0 ? ' blank' : ''}`;
    button.type = 'button';
    button.textContent = number || '';
    button.addEventListener('click', () => moveSliderTile(index));
    sliderBoard.append(button);
  });
}

function moveSliderTile(index) {
  const blank = tiles.indexOf(0);
  if (!adjacentTiles(blank).includes(index)) return;
  [tiles[blank], tiles[index]] = [tiles[index], tiles[blank]];
  renderSlider();
  if (!tiles.every((number, tileIndex) => number === (tileIndex + 1) % 9)) return;
  showBorisBanner(sliderOverlay, sliderOverlayTitle, 'Lock opened!', () => {
    if (sliderRound === 2) {
      sliderStatus.textContent = 'Message unlocked!';
      document.querySelector('#start-slider-game').textContent = 'Play again →';
      sliderMessage.hidden = false;
      sliderMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    sliderRound += 1;
    showBorisBanner(sliderOverlay, sliderOverlayTitle, `Round ${sliderRound + 1}`, beginSliderRound);
  });
}

function adjacentTiles(index) {
  const row = Math.floor(index / 3);
  const column = index % 3;
  const neighbors = [];
  if (row > 0) neighbors.push(index - 3);
  if (row < 2) neighbors.push(index + 3);
  if (column > 0) neighbors.push(index - 1);
  if (column < 2) neighbors.push(index + 1);
  return neighbors;
}
