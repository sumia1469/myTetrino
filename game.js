const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const tetrominoes = [
    [[1, 1, 1], [0, 1, 0]],  // T
    [[1, 1, 0], [0, 1, 1]],  // Z
    [[0, 1, 1], [1, 1, 0]],  // S
    [[1, 1, 1, 1]],          // I
    [[1, 1], [1, 1]]         // O
];

let currentTetromino = getRandomTetromino();
let pos = { x: 4, y: 0 };
let score = 0;
let level = 0;
let linesCleared = 0;
let dropInterval = 500; // 초기 블록 낙하 속도 (밀리초)
let dropTimer = null;

function getRandomTetromino() {
    return tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
}

function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(x, y, 'white');
            }
        }
    }
}

function drawTetromino() {
    currentTetromino.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) drawBlock(pos.x + x, pos.y + y, 'cyan');
        });
    });
}

function isCollision(offsetX, offsetY, newTetromino = currentTetromino) {
    return newTetromino.some((row, y) =>
        row.some((cell, x) => {
            if (cell) {
                let newX = pos.x + x + offsetX;
                let newY = pos.y + y + offsetY;
                return (
                    newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board[newY][newX])
                );
            }
            return false;
        })
    );
}

function mergeTetromino() {
    currentTetromino.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                board[pos.y + y][pos.x + x] = 1;
            }
        });
    });
}

function clearLines() {
    let lines = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            lines++;
        }
    }
    if (lines > 0) {
        linesCleared += lines;
        score += getScore(lines);
        level = Math.floor(linesCleared / 5); // 5줄마다 레벨업
        updateScore();
        updateDropInterval();
    }
}

function getScore(lines) {
    const lineScores = [0, 100, 300, 500, 800];
    return lineScores[lines] * (level + 1);
}

function updateScore() {
    document.getElementById('score').innerText = `Score: ${score}`;
    document.getElementById('level').innerText = `Level: ${level}`;
}

function updateDropInterval() {
    dropInterval = Math.max(50, 500 - level * 100); // 레벨에 따라 속도 증가, 최소 50ms
    if (dropTimer) {
        clearInterval(dropTimer);
        dropTimer = setInterval(gameLoop, dropInterval);
    }
}

function moveDown() {
    if (!isCollision(0, 1)) {
        pos.y++;
    } else {
        mergeTetromino();
        clearLines();
        currentTetromino = getRandomTetromino();
        pos = { x: 4, y: 0 };

        if (isCollision(0, 0)) {
            alert("Game Over!");
            board.forEach(row => row.fill(0));
            score = 0;
            level = 0;
            linesCleared = 0;
            updateScore();
            updateDropInterval();
        }
    }
}

function rotateTetromino() {
    const rotatedTetromino = currentTetromino[0].map((_, x) =>
        currentTetromino.map(row => row[x]).reverse()
    );

    if (!isCollision(0, 0, rotatedTetromino)) {
        currentTetromino = rotatedTetromino;
    }
}

function hardDrop() {
    while (!isCollision(0, 1)) {
        pos.y++;
    }
    moveDown();
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' && !isCollision(-1, 0)) pos.x -= 1;
    if (event.key === 'ArrowRight' && !isCollision(1, 0)) pos.x += 1;
    if (event.key === 'ArrowDown') moveDown();
    if (event.key === 'ArrowUp') rotateTetromino();
    if (event.key === ' ') hardDrop();
    drawBoard();
    drawTetromino();
});

function gameLoop() {
    moveDown();
    drawBoard();
    drawTetromino();
}

// 게임 루프 시작
dropTimer = setInterval(gameLoop, dropInterval);