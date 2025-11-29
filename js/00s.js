const canvas = document.getElementById('gameCanvas00s');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score00s');

const GRID_SIZE = 4;
const CELL_SIZE = 82;
const CELL_PADDING = 10;
const GRID_PADDING = 20;

let grid = [];
let score = 0;
let gameOver = false;
let gameWon = false;

const tileColors = {
    2: { bg: '#eee4da', text: '#776e65' },
    4: { bg: '#ede0c8', text: '#776e65' },
    8: { bg: '#f2b179', text: '#f9f6f2' },
    16: { bg: '#f59563', text: '#f9f6f2' },
    32: { bg: '#f67c5f', text: '#f9f6f2' },
    64: { bg: '#f65e3b', text: '#f9f6f2' },
    128: { bg: '#edcf72', text: '#f9f6f2' },
    256: { bg: '#edcc61', text: '#f9f6f2' },
    512: { bg: '#edc850', text: '#f9f6f2' },
    1024: { bg: '#edc53f', text: '#f9f6f2' },
    2048: { bg: '#edc22e', text: '#f9f6f2' }
};

function initGrid() {
    grid = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        grid[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            grid[i][j] = 0;
        }
    }
    score = 0;
    gameOver = false;
    gameWon = false;
    updateScore();
    addRandomTile();
    addRandomTile();
    draw();
}

function addRandomTile() {
    const emptyCells = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] === 0) {
                emptyCells.push({ row: i, col: j });
            }
        }
    }
    
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
    }
}

function moveLeft() {
    let moved = false;
    for (let i = 0; i < GRID_SIZE; i++) {
        const row = grid[i].filter(val => val !== 0);
        const merged = [];
        let mergedIndex = -1;
        
        for (let j = 0; j < row.length; j++) {
            if (j > 0 && row[j] === row[j - 1] && mergedIndex !== j - 1) {
                row[j - 1] *= 2;
                score += row[j - 1];
                merged.push(j - 1);
                mergedIndex = j - 1;
                row[j] = 0;
                moved = true;
            }
        }
        
        const newRow = row.filter(val => val !== 0);
        while (newRow.length < GRID_SIZE) {
            newRow.push(0);
        }
        
        if (JSON.stringify(grid[i]) !== JSON.stringify(newRow)) {
            moved = true;
        }
        grid[i] = newRow;
    }
    return moved;
}

function moveRight() {
    let moved = false;
    for (let i = 0; i < GRID_SIZE; i++) {
        const row = grid[i].filter(val => val !== 0);
        const merged = [];
        let mergedIndex = -1;
        
        for (let j = row.length - 1; j >= 0; j--) {
            if (j < row.length - 1 && row[j] === row[j + 1] && mergedIndex !== j + 1) {
                row[j + 1] *= 2;
                score += row[j + 1];
                merged.push(j + 1);
                mergedIndex = j + 1;
                row[j] = 0;
                moved = true;
            }
        }
        
        const newRow = row.filter(val => val !== 0);
        while (newRow.length < GRID_SIZE) {
            newRow.unshift(0);
        }
        
        if (JSON.stringify(grid[i]) !== JSON.stringify(newRow)) {
            moved = true;
        }
        grid[i] = newRow;
    }
    return moved;
}

function moveUp() {
    let moved = false;
    for (let j = 0; j < GRID_SIZE; j++) {
        const column = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            if (grid[i][j] !== 0) {
                column.push(grid[i][j]);
            }
        }
        
        const merged = [];
        let mergedIndex = -1;
        for (let i = 0; i < column.length; i++) {
            if (i > 0 && column[i] === column[i - 1] && mergedIndex !== i - 1) {
                column[i - 1] *= 2;
                score += column[i - 1];
                merged.push(i - 1);
                mergedIndex = i - 1;
                column[i] = 0;
                moved = true;
            }
        }
        
        const newColumn = column.filter(val => val !== 0);
        while (newColumn.length < GRID_SIZE) {
            newColumn.push(0);
        }
        
        for (let i = 0; i < GRID_SIZE; i++) {
            if (grid[i][j] !== newColumn[i]) {
                moved = true;
            }
            grid[i][j] = newColumn[i];
        }
    }
    return moved;
}

function moveDown() {
    let moved = false;
    for (let j = 0; j < GRID_SIZE; j++) {
        const column = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            if (grid[i][j] !== 0) {
                column.push(grid[i][j]);
            }
        }
        
        const merged = [];
        let mergedIndex = -1;
        for (let i = column.length - 1; i >= 0; i--) {
            if (i < column.length - 1 && column[i] === column[i + 1] && mergedIndex !== i + 1) {
                column[i + 1] *= 2;
                score += column[i + 1];
                merged.push(i + 1);
                mergedIndex = i + 1;
                column[i] = 0;
                moved = true;
            }
        }
        
        const newColumn = column.filter(val => val !== 0);
        while (newColumn.length < GRID_SIZE) {
            newColumn.unshift(0);
        }
        
        for (let i = 0; i < GRID_SIZE; i++) {
            if (grid[i][j] !== newColumn[i]) {
                moved = true;
            }
            grid[i][j] = newColumn[i];
        }
    }
    return moved;
}

function checkGameOver() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] === 0) {
                return false;
            }
        }
    }
    
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const current = grid[i][j];
            if ((i < GRID_SIZE - 1 && grid[i + 1][j] === current) ||
                (j < GRID_SIZE - 1 && grid[i][j + 1] === current)) {
                return false;
            }
        }
    }
    
    return true;
}

function checkWin() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] === 2048) {
                return true;
            }
        }
    }
    return false;
}

function handleMove(direction) {
    if (gameOver) return;
    
    let moved = false;
    switch (direction) {
        case 'left':
            moved = moveLeft();
            break;
        case 'right':
            moved = moveRight();
            break;
        case 'up':
            moved = moveUp();
            break;
        case 'down':
            moved = moveDown();
            break;
    }
    
    if (moved) {
        addRandomTile();
        updateScore();
        
        if (checkWin() && !gameWon) {
            gameWon = true;
        }
        
        if (checkGameOver()) {
            gameOver = true;
        }
        
        draw();
    }
}

function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

function draw() {
    ctx.fillStyle = '#bbada0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const x = GRID_PADDING + j * (CELL_SIZE + CELL_PADDING);
            const y = GRID_PADDING + i * (CELL_SIZE + CELL_PADDING);
            
            ctx.fillStyle = '#cdc1b4';
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            
            if (grid[i][j] !== 0) {
                const value = grid[i][j];
                const colors = tileColors[value] || { bg: '#3c3a32', text: '#f9f6f2' };
                
                ctx.fillStyle = colors.bg;
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                
                ctx.fillStyle = colors.text;
                ctx.font = value >= 1000 ? 'bold 32px Arial' : 'bold 40px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(value.toString(), x + CELL_SIZE / 2, y + CELL_SIZE / 2);
            }
        }
    }
    
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#f9f6f2';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '24px Arial';
        ctx.fillText('Press B to restart', canvas.width / 2, canvas.height / 2 + 20);
    }
    
    if (gameWon && !gameOver) {
        ctx.fillStyle = 'rgba(237, 194, 46, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') handleMove('left');
    else if (e.key === 'ArrowRight') handleMove('right');
    else if (e.key === 'ArrowUp') handleMove('up');
    else if (e.key === 'ArrowDown') handleMove('down');
    else if (e.key === 'r' || e.key === 'R') initGrid();
});

document.querySelectorAll('.dpad-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const direction = btn.getAttribute('data-direction');
        handleMove(direction);
    });
});

initGrid();

