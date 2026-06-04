// =============================================
// MARIO SNAKE - Snake.js
// =============================================

// --- CONSTANTS ---
const BOARD_SIZE = 20;        // Grid is always 20x20 cells
const APPLES_TO_LEVEL_UP = 5; // How many coins to collect before next level

// --- GAME STATE VARIABLES ---
let Board;                  // 2D array representing the grid ("W", ".", "S", "A")
let Snake;                  // Array of [x,y] pairs — index 0 is tail, last is head
let Direction;              // Current direction: "up", "down", "left", "right"
let Apple;                  // [x, y] position of the current apple (coin)
let GameLoopTimer;          // Interval that calls Tick() every few milliseconds
let CurrentLevel = 1;       // Current level number
let Score = 0;              // Player's total score
let ApplesEatenThisLevel = 0; // Counts apples eaten to trigger level up
let TimeLeft = 30;          // Seconds remaining in current level
let CountdownInterval;      // Interval that ticks down the timer every second


// -----------------------------------------------
// BuildBoard
// Creates a fresh 20x20 board where the wall border
// thickness equals the current level number.
// Level 1 = 1-cell border, Level 2 = 2-cell border, etc.
// This is how the playable area shrinks each level!
// -----------------------------------------------
function BuildBoard(level) {
  let newBoard = [];
  let wallThickness = level;

  for (let y = 0; y < BOARD_SIZE; y++) {
    newBoard.push([]);
    for (let x = 0; x < BOARD_SIZE; x++) {
      // If this cell is inside the wall border, mark it as a wall
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
// Places a new coin at a random empty spot on the board.
// Keeps trying until it finds a cell that is "." (empty).
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
// Clears the HTML grid and redraws every cell
// using Mario-themed CSS classes:
//   "brick"  = wall (W)
//   "sky"    = empty (.)
//   "mario"  = snake segment (S)
//   "coin"   = apple/collectible (A)
// -----------------------------------------------
function DrawBoard() {
  ClearGrid();

  // Write snake segments into the board array
  for (let i in Snake) {
    Board[Snake[i][1]][Snake[i][0]] = "S";
  }

  // Write apple into the board array
  Board[Apple[1]][Apple[0]] = "A";

  // Draw each cell with its correct Mario class
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if      (Board[y][x] == "W") AddBlock(x, y, "brick");
      else if (Board[y][x] == ".") AddBlock(x, y, "sky");
      else if (Board[y][x] == "S") AddBlock(x, y, "mario");
      else if (Board[y][x] == "A") AddBlock(x, y, "coin");
    }
  }
}


// -----------------------------------------------
// UpdateUI
// Refreshes the Level, Score and Timer text
// shown above the grid in the HTML.
// -----------------------------------------------
function UpdateUI() {
  document.getElementById("level_display").textContent = "Level: " + CurrentLevel;
  document.getElementById("score_display").textContent = "Score: " + Score;
  document.getElementById("timer_display").textContent = "Time: " + TimeLeft;
}


// -----------------------------------------------
// StartCountdown
// Starts the per-level countdown timer (30 seconds).
// Every second it decrements TimeLeft and updates the UI.
// If time reaches 0 → Game Over.
// -----------------------------------------------
function StartCountdown() {
  TimeLeft = 30;
  clearInterval(CountdownInterval);

  CountdownInterval = setInterval(function() {
    TimeLeft--;
    UpdateUI();

    if (TimeLeft <= 0) {
      GameOver();
      alert("Time's up! Game Over! Final Score: " + Score);
    }
  }, 1000);
}


// -----------------------------------------------
// NextLevel
// Called when the player collects enough coins.
// Increases the level, rebuilds the board with thicker walls,
// resets the snake to the center, and restarts the timer.
// The snake also moves slightly faster each level!
// -----------------------------------------------
function NextLevel() {
  CurrentLevel++;
  ApplesEatenThisLevel = 0;

  // Stop current timers
  clearInterval(GameLoopTimer);
  clearInterval(CountdownInterval);

  // Rebuild board — walls are now thicker
  Board = BuildBoard(CurrentLevel);

  // Reset snake position to the center of the smaller field
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

  alert("🍄 Level " + CurrentLevel + "! The walls are closing in!");

  // Restart countdown
  StartCountdown();

  // Speed increases by 20ms each level (minimum 80ms)
  let speed = Math.max(80, 200 - (CurrentLevel - 1) * 20);
  GameLoopTimer = setInterval(Tick, speed);
}


// -----------------------------------------------
// StartGame
// Resets everything and starts a fresh game from Level 1.
// Called when the player clicks the Start Game button.
// -----------------------------------------------
function StartGame() {
  // Reset all game state
  CurrentLevel = 1;
  Score = 0;
  ApplesEatenThisLevel = 0;
  Direction = "right";

  // Build starting board with level-1 wall thickness
  Board = BuildBoard(CurrentLevel);

  // Place snake in the center
  let center = Math.floor(BOARD_SIZE / 2);
  Snake = [
    [center - 2, center],
    [center - 1, center],
    [center,     center]
  ];

  CreateApple();
  UpdateUI();
  DrawBoard();

  // Clear old intervals to prevent duplicates
  clearInterval(GameLoopTimer);
  clearInterval(CountdownInterval);

  // Start countdown and game loop
  StartCountdown();
  GameLoopTimer = setInterval(Tick, 200);

  // Keyboard controls
  document.addEventListener("keydown", KeyPressed);
}


// -----------------------------------------------
// KeyPressed
// Reads arrow key input and updates the snake's direction.
// Prevents the snake from immediately reversing into itself.
// -----------------------------------------------
function KeyPressed(event) {
  if (event.keyCode == 38 && Direction != "down")  Direction = "up";
  if (event.keyCode == 40 && Direction != "up")    Direction = "down";
  if (event.keyCode == 37 && Direction != "right") Direction = "left";
  if (event.keyCode == 39 && Direction != "left")  Direction = "right";
}


// -----------------------------------------------
// MoveSnake
// Core movement logic called every Tick.
// 1. Calculates where the head moves next
// 2. Checks for wall or self collision → Game Over
// 3. Checks for apple collision → grow + score + level check
// 4. Moves snake forward (adds new head, removes tail)
// -----------------------------------------------
function MoveSnake() {
  let isGrowing = false;

  // Current head position
  let xHead = Snake[Snake.length - 1][0];
  let yHead = Snake[Snake.length - 1][1];

  // Next head position
  let xNext = xHead;
  let yNext = yHead;

  if (Direction == "right") xNext++;
  if (Direction == "left")  xNext--;
  if (Direction == "up")    yNext--;
  if (Direction == "down")  yNext++;

  // Boundary check (out of grid)
  if (yNext < 0 || yNext >= BOARD_SIZE || xNext < 0 || xNext >= BOARD_SIZE) {
    GameOver();
    alert("💀 Game Over! Final Score: " + Score);
    return null;
  }

  // Wall or self collision → Game Over
  if (Board[yNext][xNext] == "W" || Board[yNext][xNext] == "S") {
    GameOver();
    alert("💀 Game Over! Final Score: " + Score);
    return null;
  }

  // Apple collected → grow snake and update score
  if (Board[yNext][xNext] == "A") {
    isGrowing = true;
    Score += 10;
    ApplesEatenThisLevel++;

    // Clear apple from board
    Board[Apple[1]][Apple[0]] = ".";

    // Check if enough apples to advance to next level
    if (ApplesEatenThisLevel >= APPLES_TO_LEVEL_UP) {
      // Add new head first so snake grows correctly, then go to next level
      Snake.push([xNext, yNext]);
      NextLevel();
      return;
    }

    CreateApple();
  }

  // Add new head segment in the new position
  Snake.push([xNext, yNext]);

  // Remove tail unless snake is growing
  if (!isGrowing) {
    Board[Snake[0][1]][Snake[0][0]] = ".";
    Snake.shift();
  }

  UpdateUI();
  DrawBoard();
}


// -----------------------------------------------
// GameOver
// Stops the game loop and the countdown timer.
// -----------------------------------------------
function GameOver() {
  clearInterval(GameLoopTimer);
  clearInterval(CountdownInterval);
}


// -----------------------------------------------
// Tick
// The main game loop — called every 200ms (or faster at higher levels).
// Simply tells the snake to move one step.
// -----------------------------------------------
function Tick() {
  MoveSnake();
}
