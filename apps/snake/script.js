export function initScript(container) {
  const boardEl = container.querySelector("#board");
  const scoreEl = container.querySelector("#score");
  const restartBtn = container.querySelector("#restart");

  const size = 12;
  let cellSize = 20;
  let snake = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
  ];
  let direction = { x: 1, y: 0 };
  let nextDirection = { x: 1, y: 0 };
  let food = { x: 8, y: 5 };
  let score = 0;
  let gameOver = false;
  let loopId = null;

  function resetGame() {
    snake = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    food = { x: 8, y: 5 };
    score = 0;
    gameOver = false;
    scoreEl.textContent = score;
    clearInterval(loopId);
    startGame();
  }

  function placeFood() {
    let candidate;
    do {
      candidate = {
        x: Math.floor(Math.random() * (size - 1)),
        y: Math.floor(Math.random() * (size - 1)),
      };
    } while (
      candidate.x === size - 1 ||
      candidate.y === size - 1 ||
      snake.some(
        (segment) => segment.x === candidate.x && segment.y === candidate.y,
      )
    );

    food = candidate;
  }

  function updateBoardSize() {
    const maxWidth = Math.max(
      220,
      Math.floor(container.clientWidth * 0.85) - 28,
    );
    const maxHeight = Math.max(
      220,
      Math.floor(container.clientHeight * 0.65) - 28,
    );
    const available = Math.min(maxWidth, maxHeight);
    cellSize = Math.max(14, Math.floor(available / size) - 2);

    const boardSize = size * cellSize + 12;

    boardEl.style.width = `${boardSize}px`;
    boardEl.style.height = `${boardSize}px`;
    boardEl.style.maxWidth = `${boardSize}px`;
    boardEl.style.maxHeight = `${boardSize}px`;
    boardEl.style.gridTemplateColumns = `repeat(${size}, ${cellSize}px)`;
    boardEl.style.gap = "2px";
  }

  function drawBoard() {
    updateBoardSize();
    boardEl.innerHTML = "";

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const cell = document.createElement("div");
        cell.className =
          "flex items-center justify-center overflow-hidden rounded-sm text-lg leading-none";
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;

        const isHead = snake[0].x === x && snake[0].y === y;
        const isBody = snake.some(
          (segment) => segment.x === x && segment.y === y,
        );

        if (isHead) {
          cell.textContent = "🟧";
        } else if (isBody) {
          cell.textContent = "🟩";
        } else if (food.x === x && food.y === y) {
          cell.textContent = "🍎";
        } else {
          cell.textContent = "⬜";
        }

        boardEl.appendChild(cell);
      }
    }
  }

  function step() {
    if (gameOver) return;

    direction = nextDirection;

    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;

    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= size - 1 ||
      head.y >= size - 1 ||
      snake.some((segment) => segment.x === head.x && segment.y === head.y)
    ) {
      gameOver = true;
      clearInterval(loopId);
      scoreEl.textContent = `${score} · Game Over`;
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 1;
      scoreEl.textContent = score;
      placeFood();
    } else {
      snake.pop();
    }

    drawBoard();
  }

  function startGame() {
    drawBoard();
    loopId = setInterval(step, 160);
  }

  document.addEventListener("keydown", (event) => {
    const key = event.key;
    const mapping = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
    };

    const next = mapping[key];
    if (!next) return;

    event.preventDefault();
    if (
      (next.x === -direction.x && next.y === -direction.y) ||
      (next.x === direction.x && next.y === direction.y)
    ) {
      return;
    }

    nextDirection = next;
  });

  restartBtn.addEventListener("click", resetGame);

  window.addEventListener("resize", drawBoard);

  startGame();
}
