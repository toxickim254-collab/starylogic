// Game Canvas and Elements
const gameBoard = document.getElementById('gameBoard');
const ball = document.getElementById('ball');
const playerPaddle = document.getElementById('playerPaddle');
const computerPaddle = document.getElementById('computerPaddle');
const playerScoreDisplay = document.getElementById('playerScore');
const computerScoreDisplay = document.getElementById('computerScore');
const startBtn = document.getElementById('startBtn');
const gameStatus = document.getElementById('gameStatus');

// Game Variables
let gameRunning = false;
let ballX, ballY;
let ballSpeedX = 5;
let ballSpeedY = 5;
let ballRadius = 6;

let playerY = 0;
let computerY = 0;
let paddleHeight = 80;
let paddleWidth = 15;

let playerScore = 0;
let computerScore = 0;
const WINNING_SCORE = 11;

let boardWidth, boardHeight;
let mouseY = 0;
let keysPressed = {};

// Initialize Game
function init() {
    boardWidth = gameBoard.clientWidth;
    boardHeight = gameBoard.clientHeight;
    
    ballX = boardWidth / 2;
    ballY = boardHeight / 2;
    ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * 5;
    ballSpeedY = (Math.random() * 4 - 2);
    
    playerY = boardHeight / 2 - paddleHeight / 2;
    computerY = boardHeight / 2 - paddleHeight / 2;
    
    playerScore = 0;
    computerScore = 0;
    updateScoreboard();
}

// Event Listeners
startBtn.addEventListener('click', toggleGame);
gameBoard.addEventListener('mousemove', (e) => {
    const rect = gameBoard.getBoundingClientRect();
    mouseY = e.clientY - rect.top - paddleHeight / 2;
});

document.addEventListener('keydown', (e) => {
    keysPressed[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keysPressed[e.key] = false;
});

// Toggle Game Start/Pause
function toggleGame() {
    if (!gameRunning) {
        init();
        gameRunning = true;
        startBtn.textContent = 'PAUSE GAME';
        gameStatus.textContent = 'Game Running...';
        gameLoop();
    } else {
        gameRunning = false;
        startBtn.textContent = 'RESUME GAME';
        gameStatus.textContent = 'Game Paused';
    }
}

// Update Paddles Position
function updatePaddles() {
    // Player Paddle - Mouse Control
    if (mouseY > 0) {
        playerY = Math.max(0, Math.min(mouseY, boardHeight - paddleHeight));
    }

    // Player Paddle - Keyboard Control (Arrow Keys)
    if (keysPressed['ArrowUp']) {
        playerY = Math.max(0, playerY - 6);
    }
    if (keysPressed['ArrowDown']) {
        playerY = Math.min(boardHeight - paddleHeight, playerY + 6);
    }

    // Computer Paddle - AI Control
    const computerCenter = computerY + paddleHeight / 2;
    const difficulty = 0.08; // Adjust AI difficulty (0-1)
    const aiSpeed = 4;
    
    if (Math.random() > difficulty) {
        if (computerCenter < ballY - 35) {
            computerY = Math.min(boardHeight - paddleHeight, computerY + aiSpeed);
        } else if (computerCenter > ballY + 35) {
            computerY = Math.max(0, computerY - aiSpeed);
        }
    }

    // Apply positions to DOM
    playerPaddle.style.top = playerY + 'px';
    computerPaddle.style.top = computerY + 'px';
}

// Update Ball Position
function updateBall() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Wall collision (top and bottom)
    if (ballY - ballRadius < 0 || ballY + ballRadius > boardHeight) {
        ballSpeedY = -ballSpeedY;
        ballY = Math.max(ballRadius, Math.min(boardHeight - ballRadius, ballY));
    }

    // Paddle collision detection
    // Player paddle collision
    if (
        ballX - ballRadius < paddleWidth + 20 &&
        ballY > playerY &&
        ballY < playerY + paddleHeight &&
        ballSpeedX < 0
    ) {
        ballSpeedX = -ballSpeedX;
        ballX = paddleWidth + 20 + ballRadius;
        // Add spin based on where ball hits paddle
        const hitPos = (ballY - (playerY + paddleHeight / 2)) / (paddleHeight / 2);
        ballSpeedY += hitPos * 3;
    }

    // Computer paddle collision
    if (
        ballX + ballRadius > boardWidth - paddleWidth - 20 &&
        ballY > computerY &&
        ballY < computerY + paddleHeight &&
        ballSpeedX > 0
    ) {
        ballSpeedX = -ballSpeedX;
        ballX = boardWidth - paddleWidth - 20 - ballRadius;
        // Add spin based on where ball hits paddle
        const hitPos = (ballY - (computerY + paddleHeight / 2)) / (paddleHeight / 2);
        ballSpeedY += hitPos * 3;
    }

    // Score Detection (ball out of bounds)
    if (ballX < 0) {
        computerScore++;
        resetBall();
    } else if (ballX > boardWidth) {
        playerScore++;
        resetBall();
    }

    // Update ball position in DOM
    ball.style.left = ballX + 'px';
    ball.style.top = ballY + 'px';
}

// Reset Ball to Center
function resetBall() {
    ballX = boardWidth / 2;
    ballY = boardHeight / 2;
    ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * 5;
    ballSpeedY = (Math.random() * 4 - 2);
    updateScoreboard();
    checkWinner();
}

// Update Scoreboard
function updateScoreboard() {
    playerScoreDisplay.textContent = playerScore;
    computerScoreDisplay.textContent = computerScore;
}

// Check for Winner
function checkWinner() {
    if (playerScore >= WINNING_SCORE) {
        gameRunning = false;
        gameStatus.textContent = '🎉 PLAYER WINS! 🎉';
        startBtn.textContent = 'START NEW GAME';
        return true;
    } else if (computerScore >= WINNING_SCORE) {
        gameRunning = false;
        gameStatus.textContent = '💻 COMPUTER WINS! 💻';
        startBtn.textContent = 'START NEW GAME';
        return true;
    }
    return false;
}

// Main Game Loop
function gameLoop() {
    if (gameRunning) {
        updatePaddles();
        updateBall();
        requestAnimationFrame(gameLoop);
    }
}

// Initial Setup
init();