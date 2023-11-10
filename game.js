// Constants for the board size
const BOARD_SIZE = { simple: 6, normal: 14 };
const CELL_SIZE = 500 / BOARD_SIZE.simple; // We'll use the simple size for this example

let canvas; // Declare canvas at the top level


// Use the DOMContentLoaded event to ensure the DOM is fully loaded before accessing elements
document.addEventListener('DOMContentLoaded', (event) => {
  // Initialize canvas here
  canvas = document.getElementById('gameCanvas');
  
  // Attach the event listener to the canvas
  if (canvas) {
    canvas.addEventListener('click', handleMouseClick);
  } else {
    console.error('Canvas element not found!');
  }
  
  // Any other initialization code that needs to run after the DOM is loaded can go here
});

// Define the startGame function to hide instructions and start the game
function startGame() {
  const instructionsOverlay = document.getElementById('instructionsOverlay');

  // Hide the instructions overlay
  instructionsOverlay.style.display = 'none';

  // Show the game canvas and use the globally declared 'canvas' variable
  if (canvas) {
    canvas.style.display = 'block';
  } else {
    console.error('Canvas element not found when starting game!');
  }

  // Initialize the game
  initializeGame();
}

// Helper function to create a 2D array for the board
function createBoard(size) {
  let board = [];
  for (let i = 0; i < size; i++) {
    board[i] = [];
    for (let j = 0; j < size; j++) {
      board[i][j] = null; // null indicates the cell is not yet used
    }
  }
  return board;
}

/*
// Function to draw the board using square fills
function drawBoard() {
  // Moved the declaration of 'canvas' and 'ctx' inside the function
  const ctx = canvas.getContext('2d');

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the grid
  for (let i = 0; i < BOARD_SIZE.simple; i++) {
    for (let j = 0; j < BOARD_SIZE.simple; j++) {
      ctx.strokeStyle = 'black';
      ctx.strokeRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);

      // Fill the cell with the player's color if it has been selected
      if (board[i][j]) {
        ctx.fillStyle = board[i][j];
        ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}
*/

// Filled with circles. 
function drawBoard() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the grid
  for (let i = 0; i < BOARD_SIZE.simple; i++) {
    for (let j = 0; j < BOARD_SIZE.simple; j++) {
      ctx.strokeStyle = 'black';
      ctx.strokeRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);

      // Draw a filled circle if the cell has been selected
      if (board[i][j]) {
        ctx.fillStyle = board[i][j];
        ctx.beginPath(); // Start a new path for the circle
        // Draw a circle in the middle of the cell
        ctx.arc(j * CELL_SIZE + CELL_SIZE / 2, i * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 5, 0, Math.PI * 2);
        ctx.fill(); // Fill the circle with the current fill style
      }
    }
  }
}



function displayWinner(winner) {

  const ctx = canvas.getContext('2d');

  // Display a semi-transparent overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Display the winner text
  ctx.fillStyle = 'black';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(winner + ' wins!', canvas.width / 2, canvas.height / 2);
}


function handleMouseClick(event) {
  // Moved the declaration of 'canvas' inside the function
  console.log('Canvas clicked'); // Debugging line to confirm event listener is working

  if (gameOver) {
    console.log('Game is over'); // Debugging line
    return; // Do nothing if the game is over
  }

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const gridX = Math.floor(x / CELL_SIZE);
  const gridY = Math.floor(y / CELL_SIZE);

  console.log(`Click at canvas x: ${x}, y: ${y}`); // Debugging line
  console.log(`Grid position x: ${gridX}, y: ${gridY}`); // Debugging line

  // Attempt to make a move
  if (makeMove(gridX, gridY, currentPlayer)) {
    // Redraw the board with the new state
    drawBoard();

    // Switch players
    switchPlayer();

    // Check if the new current player has valid moves left
    if (isGameOver()) {
      // If no valid moves, the last player to make a valid move wins
      switchPlayer(); // Switch back to the last player who made the valid move
      gameOver = true;

      // Update the DOM element with the winner message
      const gameOverMessageElement = document.getElementById('gameOverMessage');
      gameOverMessageElement.textContent = currentPlayer + ' wins! ' + (currentPlayer === 'Red' ? 'Blue' : 'Red') + ' has no valid moves left.';
      gameOverMessageElement.style.display = 'block';
    }
  }
}

// Utility function to check if a cell is within the board boundaries
function isWithinBoard(x, y) {
  return x >= 0 && x < BOARD_SIZE.simple && y >= 0 && y < BOARD_SIZE.simple;
}


// Function to check if the cell is bordering any of the player's own cells directly adjacent (not diagonals)
function isBorderingOwnColor(x, y, player) {
  const directions = [
    { x: -1, y: 0 }, { x: 1, y: 0 }, // Left, Right
    { x: 0, y: -1 }, { x: 0, y: 1 }  // Up, Down
  ];

  return directions.some(dir => {
    const newX = x + dir.x;
    const newY = y + dir.y;
    return isWithinBoard(newX, newY) && board[newY][newX] === player;
  });
}

// Function to check if the cell is bordering any of the player's own cells
/* Version with diagonals also forbidden
function isBorderingOwnColor(x, y, player) {
  const directions = [
    { x: -1, y: 0 }, { x: 1, y: 0 }, // Left, Right
    { x: 0, y: -1 }, { x: 0, y: 1 }, // Up, Down
    { x: -1, y: -1 }, { x: 1, y: 1 }, // Diagonals
    { x: -1, y: 1 }, { x: 1, y: -1 }
  ];

  return directions.some(dir => {
    const newX = x + dir.x;
    const newY = y + dir.y;
    return isWithinBoard(newX, newY) && board[newY][newX] === player;
  });
}
*/

// Function to make a move
function makeMove(x, y, player) {
  if (!isWithinBoard(x, y) || board[y][x] || isBorderingOwnColor(x, y, player)) {
    return false; // Invalid move
  }
  board[y][x] = player; // Set the player's color to the cell
  return true; // Valid move
}

// Function to switch the current player
function switchPlayer() {
  currentPlayer = currentPlayer === 'Red' ? 'Blue' : 'Red';
}

// Function to check if the game is over
function isGameOver() {
  for (let i = 0; i < BOARD_SIZE.simple; i++) {
    for (let j = 0; j < BOARD_SIZE.simple; j++) {
      // Check if the cell is empty and not bordering the player's own color
      if (!board[i][j] && !isBorderingOwnColor(j, i, currentPlayer)) {
        console.log(`Found a valid move for ${currentPlayer} at x: ${j}, y: ${i}`); // Debugging line
        return false; // Found a valid move
      }
    }
  }
  console.log(`${currentPlayer} has no valid moves left.`); // Debugging line
  return true; // No valid moves left
}



// Function to initialize the game state
function initializeGame() {
  board = createBoard(BOARD_SIZE.simple); // Initialize the board when the game starts
  currentPlayer = 'Red'; // Red starts first
  gameOver = false;
  drawBoard(); // Draw the initial board
}


// Attach the startGame function to the window object to make it accessible from the HTML button's onclick event
// window.startGame = startGame;


// Draw the board on startup, but now let's comment this out so the board is only drawn after clicking 'Start Game'
// drawBoard();


