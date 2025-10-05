let count = 0;
let gameOver = false;
let currentPlayer = '○';
let turnCount = 1;

// 音効果のための関数（Web Audio API使用）
function playSound(frequency, duration) {
  try {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + duration
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {
    // ブラウザが音声をサポートしていない場合は無視
  }
}

// パーティクルエフェクト
function createParticles() {
  const container = document.querySelector('.particles-container');
  const particleCount = 20;

  for (let i = 0; i < particleCount; i++) {
    setTimeout(() => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 2 + 's';
      particle.style.animationDuration = Math.random() * 3 + 5 + 's';
      container.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 8000);
    }, i * 100);
  }
}

// セル爆発エフェクト
function createCellExplosion(cell) {
  const rect = cell.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 12; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = centerX + 'px';
    particle.style.top = centerY + 'px';
    particle.style.width = '8px';
    particle.style.height = '8px';
    particle.style.backgroundColor =
      currentPlayer === '○' ? '#ff6b6b' : '#1e90ff';
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '1000';

    const angle = (i / 12) * Math.PI * 2;
    const velocity = 50 + Math.random() * 30;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;

    document.body.appendChild(particle);

    let x = 0,
      y = 0;
    const gravity = 0.5;
    let vy_current = vy;

    const animate = () => {
      x += vx * 0.02;
      y += vy_current * 0.02;
      vy_current += gravity;

      particle.style.transform = `translate(${x}px, ${y}px)`;
      particle.style.opacity = Math.max(0, 1 - y / 100);

      if (y < 200) {
        requestAnimationFrame(animate);
      } else {
        particle.remove();
      }
    };

    requestAnimationFrame(animate);
  }
}

function updateTurn() {
  const turnElem = document.getElementById('turn');
  const turnCountElem = document.getElementById('turn-count');

  if (gameOver) return;

  currentPlayer = count % 2 === 0 ? '○' : '×';

  if (currentPlayer === '○') {
    turnElem.innerHTML = `<span style="color: #ff6b6b; text-shadow: 0 0 15px rgba(255, 107, 107, 0.6);">○</span> の番`;
    turnElem.style.background =
      'linear-gradient(45deg, rgba(255, 107, 107, 0.2), rgba(255, 107, 107, 0.1))';
  } else {
    turnElem.innerHTML = `<span style="color: #1e90ff; text-shadow: 0 0 20px rgba(30, 144, 255, 0.8); font-size: 1.6rem; font-weight: 900;">×</span> の番`;
    turnElem.style.background =
      'linear-gradient(45deg, rgba(30, 144, 255, 0.2), rgba(30, 144, 255, 0.1))';
  }

  turnCountElem.textContent = turnCount;

  // ターン表示のアニメーション
  turnElem.style.transform = 'scale(1.1)';
  setTimeout(() => {
    turnElem.style.transform = 'scale(1)';
  }, 200);
}

function init() {
  const board = document.getElementById('board');
  board.innerHTML = '';

  for (let i = 0; i < 3; i++) {
    const tr = document.createElement('tr');
    for (let j = 0; j < 3; j++) {
      const td = document.createElement('td');
      td.className = 'cell';
      td.id = 'cell' + (i * 3 + j);
      td.onclick = clicked;
      tr.appendChild(td);
    }
    board.appendChild(tr);
  }

  document.getElementById('resetButton').onclick = resetGame;
  document.getElementById('new-game-btn').onclick = resetGame;

  // パーティクル効果を開始
  createParticles();
  setInterval(createParticles, 10000);

  resetGame();
}

function clicked(event) {
  if (gameOver) return;
  if (event.target.textContent !== '') return;

  // 音効果
  playSound(currentPlayer === '○' ? 800 : 600, 0.1);

  // セル爆発エフェクト
  createCellExplosion(event.target);

  // マークを配置
  event.target.textContent = currentPlayer;
  event.target.className += currentPlayer === '○' ? ' cell-o' : ' cell-x';

  count++;
  turnCount = Math.ceil(count / 2) + 1;

  const winner = checkWinner();
  if (winner) {
    gameOver = true;
    setTimeout(() => showWinnerModal(winner), 500);
  } else {
    updateTurn();
  }
}

function showWinnerModal(winner) {
  const modal = document.getElementById('winner-modal');
  const winnerText = document.getElementById('winner-text');

  if (winner === 'draw') {
    winnerText.textContent = '引き分け！';
    playSound(400, 0.5);
  } else {
    winnerText.textContent = `${winner} の勝ち！`;
    playSound(1000, 0.3);
    setTimeout(() => playSound(1200, 0.3), 200);
    setTimeout(() => playSound(1400, 0.3), 400);

    // 勝利セルのハイライト
    highlightWinningCells(winner);
  }

  modal.classList.remove('hidden');

  // 追加のパーティクル効果
  for (let i = 0; i < 3; i++) {
    setTimeout(createParticles, i * 500);
  }
}

function highlightWinningCells(winner) {
  const cells = [...document.getElementsByClassName('cell')].map(
    (cell) => cell.textContent
  );
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (
      cells[a] &&
      cells[a] === cells[b] &&
      cells[a] === cells[c] &&
      cells[a] === winner
    ) {
      const cellElements = [a, b, c].map((index) =>
        document.getElementById(`cell${index}`)
      );
      cellElements.forEach((cell) => {
        cell.style.background =
          'linear-gradient(45deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.1))';
        cell.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.6)';
        cell.style.animation = 'winningPulse 1s ease-in-out infinite';
      });
      break;
    }
  }
}

function resetGame() {
  count = 0;
  turnCount = 1;
  gameOver = false;
  currentPlayer = '○';

  const cells = document.getElementsByClassName('cell');
  for (const cell of cells) {
    cell.textContent = '';
    cell.className = 'cell';
    cell.style.background = '';
    cell.style.boxShadow = '';
    cell.style.animation = '';
  }

  const modal = document.getElementById('winner-modal');
  modal.classList.add('hidden');

  updateTurn();

  // リセット音
  playSound(500, 0.2);
}

function checkWinner() {
  const cells = [...document.getElementsByClassName('cell')].map(
    (cell) => cell.textContent
  );
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return cells[a];
    }
  }

  if (cells.every((cell) => cell !== '')) return 'draw';
  return null;
}

// CSS アニメーションをJavaScriptで追加
const style = document.createElement('style');
style.textContent = `
    @keyframes winningPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
`;
document.head.appendChild(style);
