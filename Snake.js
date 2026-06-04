// =============================================
// MARIO SNAKE - Snake.js
// =============================================

const BOARD_SIZE = 20;
const APPLES_TO_LEVEL_UP = 5;

let Board;
let Snake;
let Direction;
let Apple;
let GameLoopTimer;
let CurrentLevel = 1;
let Score = 0;
let ApplesEatenThisLevel = 0;
let TimeLeft = 30;
let CountdownInterval;


// -----------------------------------------------
// ShowMessage
// Показывает красивый оверлей с текстом вместо alert().
// После 1.6 секунды автоматически скрывается и вызывает callback.
// -----------------------------------------------
function ShowMessage(text, callback) {
  let overlay = document.getElementById("level_overlay");
  let overlayText = document.getElementById("overlay_text");

  overlayText.textContent = text;
  overlay.style.display = "flex";

  // Перезапускаем анимацию
  overlayText.style.animation = "none";
  overlayText.offsetHeight; // принудительный reflow
  overlayText.style.animation = "popIn 1.6s forwards";

  setTimeout(function() {
    overlay.style.display = "none";
    if (callback) callback();
  }, 1600);
}


// -----------------------------------------------
// BuildBoard
// Строит доску 20x20 с толщиной стен = номеру уровня.
// Level 1 = 1 ячейка стен, Level 2 = 2 ячейки, и т.д.
// Так поле уменьшается с каждым уровнем.
// -----------------------------------------------
function BuildBoard(level) {
  let newBoard = [];
  let wallThickness = level;

  for (let y = 0; y < BOARD_SIZE; y++) {
    newBoard.push([]);
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (x < wallThickness || x >= BOARD_SIZE - wallThickness ||
          y < wallThickness || y >= BOARD_SIZE - wallThickness) {
        newBoard[y].push("W");
      } else {
        newBoard[y].push(".");
      }
    }
  }
  return newBoard;
}


// -----------------------------------------------
// CreateApple
// Ставит новую звезду (цель) на случайную пустую клетку.
// -----------------------------------------------
function CreateApple() {
  let xRandomPos = Math.floor(Math.random() * BOARD_SIZE);
  let yRandomPos = Math.floor(Math.random() * BOARD_SIZE);

  while (Board[yRandomPos][xRandomPos] != ".") {
    xRandomPos = Math.floor(Math.random() * BOARD_SIZE);
    yRandomPos = Math.floor(Math.random() * BOARD_SIZE);
  }

  Apple = [xRandomPos, yRandomPos];
}


// -----------------------------------------------
// DrawBoard
// Перерисовывает всю сетку с Mario-классами.
// Голова змейки получает класс "mario-head" (с буквой M),
// тело — "mario", стены — "brick", цель — "coin".
// -----------------------------------------------
function DrawBoard() {
  ClearGrid();

  // Записываем все сегменты змейки в массив
  for (let i in Snake) {
    Board[Snake[i][1]][Snake[i][0]] = "S";
  }

  Board[Apple[1]][Apple[0]] = "A";

  // Голова — отдельно для особого стиля
  let headX = Snake[Snake.length - 1][0];
  let headY = Snake[Snake.length - 1][1];

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if      (Board[y][x] == "W") AddBlock(x, y, "brick");
      else if (Board[y][x] == ".") AddBlock(x, y, "sky");
      else if (Board[y][x] == "S") {
        if (x == headX && y == headY) AddBlock(x, y, "mario-head");
        else                          AddBlock(x, y, "mario");
      }
      else if (Board[y][x] == "A") AddBlock(x, y, "coin");
    }
  }
}


// -----------------------------------------------
// UpdateUI
// Обновляет текст Level / Score / Timer в HTML.
// -----------------------------------------------
function UpdateUI() {
  document.getElementById("level_display").textContent = "Level: " + CurrentLevel;
  document.getElementById("score_display").textContent = "Score: " + Score;
  document.getElementById("timer_display").textContent = "Time: " + TimeLeft;
}


// -----------------------------------------------
// StartCountdown
// Запускает обратный отсчёт 30 секунд.
// При достижении 0 — Game Over с оверлеем.
// -----------------------------------------------
function StartCountdown() {
  TimeLeft = 30;
  clearInterval(CountdownInterval);

  CountdownInterval = setInterval(function() {
    TimeLeft--;
    UpdateUI();

    if (TimeLeft <= 0) {
      GameOver();
      ShowMessage("Time is up! Score: " + Score, null);
    }
  }, 1000);
}


// -----------------------------------------------
// NextLevel
// Повышает уровень: толще стены, сброс змейки до 3 сегментов,
// рестарт таймера, скорость выше. Без alert — просто оверлей!
// -----------------------------------------------
function NextLevel() {
  CurrentLevel++;
  ApplesEatenThisLevel = 0;

  clearInterval(GameLoopTimer);
  clearInterval(CountdownInterval);

  Board = BuildBoard(CurrentLevel);

  let center = Math.floor(BOARD_SIZE / 2);
  Snake = [
    [center - 2, center],
    [center - 1, center],
    [center,     center]
  ];
  Direction = "right";

  CreateApple();
  UpdateUI();
  DrawBoard();

  // Показываем оверлей, затем автоматически продолжаем игру
  ShowMessage("Level " + CurrentLevel + "!", function() {
    StartCountdown();
    let speed = Math.max(80, 200 - (CurrentLevel - 1) * 20);
    GameLoopTimer = setInterval(Tick, speed);
  });
}


// -----------------------------------------------
// StartGame
// Сбрасывает всё и начинает игру с Level 1.
// Вызывается по кнопке Start Game.
// -----------------------------------------------
function StartGame() {
  CurrentLevel = 1;
  Score = 0;
  ApplesEatenThisLevel = 0;
  Direction = "right";

  Board = BuildBoard(CurrentLevel);

  let center = Math.floor(BOARD_SIZE / 2);
  Snake = [
    [center - 2, center],
    [center - 1, center],
    [center,     center]
  ];

  CreateApple();
  UpdateUI();
  DrawBoard();

  clearInterval(GameLoopTimer);
  clearInterval(CountdownInterval);

  StartCountdown();
  GameLoopTimer = setInterval(Tick, 200);

  document.addEventListener("keydown", KeyPressed);
}


// -----------------------------------------------
// KeyPressed
// Управление стрелками. Нельзя развернуться назад.
// -----------------------------------------------
function KeyPressed(event) {
  if (event.keyCode == 38 && Direction != "down")  Direction = "up";
  if (event.keyCode == 40 && Direction != "up")    Direction = "down";
  if (event.keyCode == 37 && Direction != "right") Direction = "left";
  if (event.keyCode == 39 && Direction != "left")  Direction = "right";
}


// -----------------------------------------------
// MoveSnake
// Основная логика движения:
// 1. Вычисляет следующую позицию головы
// 2. Проверяет столкновение со стеной или собой
// 3. Проверяет съедение звезды
// 4. Двигает змейку (добавляет голову, убирает хвост)
// -----------------------------------------------
function MoveSnake() {
  let isGrowing = false;

  let xHead = Snake[Snake.length - 1][0];
  let yHead = Snake[Snake.length - 1][1];

  let xNext = xHead;
  let yNext = yHead;

  if (Direction == "right") xNext++;
  if (Direction == "left")  xNext--;
  if (Direction == "up")    yNext--;
  if (Direction == "down")  yNext++;

  // Выход за границы
  if (yNext < 0 || yNext >= BOARD_SIZE || xNext < 0 || xNext >= BOARD_SIZE) {
    GameOver();
    ShowMessage("Game Over! Score: " + Score, null);
    return null;
  }

  // Столкновение со стеной или собой
  if (Board[yNext][xNext] == "W" || Board[yNext][xNext] == "S") {
    GameOver();
    ShowMessage("Game Over! Score: " + Score, null);
    return null;
  }

  // Съели звезду
  if (Board[yNext][xNext] == "A") {
    isGrowing = true;
    Score += 10;
    ApplesEatenThisLevel++;

    Board[Apple[1]][Apple[0]] = ".";

    if (ApplesEatenThisLevel >= APPLES_TO_LEVEL_UP) {
      Snake.push([xNext, yNext]);
      NextLevel();
      return;
    }

    CreateApple();
  }

  Snake.push([xNext, yNext]);

  if (!isGrowing) {
    Board[Snake[0][1]][Snake[0][0]] = ".";
    Snake.shift();
  }

  UpdateUI();
  DrawBoard();
}


// -----------------------------------------------
// GameOver
// Останавливает все таймеры.
// -----------------------------------------------
function GameOver() {
  clearInterval(GameLoopTimer);
  clearInterval(CountdownInterval);
}


// -----------------------------------------------
// Tick
// Главный цикл игры — вызывается каждые N миллисекунд.
// -----------------------------------------------
function Tick() {
  MoveSnake();
}
