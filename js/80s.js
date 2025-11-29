const canvas = document.getElementById('gameCanvas80s');

const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileSize = canvas.width / gridSize;

let score = 0;
let gameOver = false;
let gameWon = false;

let maze = [];
let totalDots = 0;
let dotsRemaining = 0;

let pacman = {
    x: 1,
    y: 1,
    direction: 'right',
    mouthAngle: 0
};

let ghost = {
    x: 9,
    y: 9,
    direction: 'left'
};

let pacmanMoveTimer = 0;
let ghostMoveTimer = 0;
const moveInterval = 200;
const ghostMoveInterval = 300;

let keys = {
    up: false,
    down: false,
    left: false,
    right: false
};

let nextDirection = null;

let lastTime = 0;
let animationFrameId = null;

function initGame() {
    maze = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,2,1,1,2,1,1,2,1,1,2,1,1,1,2,1],
        [1,2,1,0,1,2,1,1,2,1,1,2,1,1,2,1,0,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,2,1,1,1,1,1,1,1,1,2,1,1,1,2,1],
        [1,2,2,2,2,2,1,1,1,1,1,1,1,1,2,2,2,2,2,1],
        [1,1,1,1,1,2,1,1,0,0,0,0,1,1,2,1,1,1,1,1],
        [0,0,0,0,1,2,1,1,0,0,0,0,1,1,2,1,0,0,0,0],
        [1,1,1,1,1,2,1,1,0,0,0,0,1,1,2,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,2,1,1,1,1,1,1,1,1,2,1,1,1,2,1],
        [1,2,2,2,1,2,2,2,2,2,2,2,2,2,2,1,2,2,2,1],
        [1,1,1,2,1,2,1,1,1,1,1,1,1,1,2,1,2,1,1,1],
        [1,2,2,2,2,2,1,1,1,1,1,1,1,1,2,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];
    
    totalDots = 0;
    for (let row of maze) {
        for (let cell of row) {
            if (cell === 2) totalDots++;
        }
    }
    dotsRemaining = totalDots;
    
    pacman = {
        x: 1,
        y: 1,
        direction: 'right',
        mouthAngle: 0
    };
    
    ghost = {
        x: 9,
        y: 9,
        direction: 'left'
    };
    
    pacmanMoveTimer = 0;
    ghostMoveTimer = 0;
}

function handleDirection(direction) {
    if (gameOver || gameWon) return;
    
    pacman.nextDirection = direction;
    pacman.direction = direction;
}

function canMove(x, y, direction) {
    let newX = x;
    let newY = y;
    
    switch(direction) {
        case 'up': newY--; break;
        case 'down': newY++; break;
        case 'left': newX--; break;
        case 'right': newX++; break;
    }
    
    if (newX < 0) newX = gridSize - 1;
    if (newX >= gridSize) newX = 0;
    if (newY < 0) newY = maze.length - 1;
    if (newY >= maze.length) newY = 0;
    
    if (newY >= 0 && newY < maze.length && 
        newX >= 0 && newX < maze[newY].length) {
        return maze[newY][newX] !== 1;
    }
    return false;
}

function getDistance(x1, y1, x2, y2) {
    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);
    
    if (dx > gridSize / 2) {
        dx = gridSize - dx;
    }
    if (dy > maze.length / 2) {
        dy = maze.length - dy;
    }
    
    return Math.sqrt(dx * dx + dy * dy);
}

function getBestDirection(ghostX, ghostY, targetX, targetY) {
    const directions = ['up', 'down', 'left', 'right'];
    const validDirections = [];
    
    for (let dir of directions) {
        if (canMove(ghostX, ghostY, dir)) {
            validDirections.push(dir);
        }
    }
    
    if (validDirections.length === 0) {
        return ghost.direction;
    }
    
    let bestDirection = validDirections[0];
    let shortestDistance = Infinity;
    
    for (let dir of validDirections) {
        let newX = ghostX;
        let newY = ghostY;
        
        switch(dir) {
            case 'up': newY--; break;
            case 'down': newY++; break;
            case 'left': newX--; break;
            case 'right': newX++; break;
        }
        
        if (newX < 0) newX = gridSize - 1;
        if (newX >= gridSize) newX = 0;
        if (newY < 0) newY = maze.length - 1;
        if (newY >= maze.length) newY = 0;
        
        const distance = getDistance(newX, newY, targetX, targetY);
        
        if (distance < shortestDistance) {
            shortestDistance = distance;
            bestDirection = dir;
        }
    }
    
    return bestDirection;
}

function update(deltaTime) {
    if (gameOver || gameWon) return;
    
    pacmanMoveTimer += deltaTime;
    ghostMoveTimer += deltaTime;
    
    if (nextDirection) {
        if (canMove(pacman.x, pacman.y, nextDirection)) {
            pacman.direction = nextDirection;
        }
        nextDirection = null;
    }
    
    if (pacmanMoveTimer >= moveInterval) {
        pacmanMoveTimer = 0;
        
        let newX = pacman.x;
        let newY = pacman.y;
        
        switch(pacman.direction) {
            case 'up': newY--; break;
            case 'down': newY++; break;
            case 'left': newX--; break;
            case 'right': newX++; break;
        }
        
        if (newX < 0) newX = gridSize - 1;
        if (newX >= gridSize) newX = 0;
        if (newY < 0) newY = maze.length - 1;
        if (newY >= maze.length) newY = 0;
        
        if (newY >= 0 && newY < maze.length &&
            newX >= 0 && newX < maze[newY].length &&
            maze[newY][newX] !== 1) {
            pacman.x = newX;
            pacman.y = newY;
            
            if (maze[newY][newX] === 2) {
                maze[newY][newX] = 0;
                score += 10;
                dotsRemaining--;
                
                if (dotsRemaining === 0) {
                    gameWon = true;
                }
            }
        }
    }
    
    if (ghostMoveTimer >= ghostMoveInterval) {
        ghostMoveTimer = 0;
        
        ghost.direction = getBestDirection(
            ghost.x, 
            ghost.y, 
            pacman.x, 
            pacman.y
        );
        
        let newX = ghost.x;
        let newY = ghost.y;
        
        switch(ghost.direction) {
            case 'up': newY--; break;
            case 'down': newY++; break;
            case 'left': newX--; break;
            case 'right': newX++; break;
        }
        
        if (newX < 0) newX = gridSize - 1;
        if (newX >= gridSize) newX = 0;
        if (newY < 0) newY = maze.length - 1;
        if (newY >= maze.length) newY = 0;
        
        if (newY >= 0 && newY < maze.length &&
            newX >= 0 && newX < maze[newY].length &&
            maze[newY][newX] !== 1) {
            ghost.x = newX;
            ghost.y = newY;
        }
    }
    
    if (pacman.x === ghost.x && pacman.y === ghost.y) {
        gameOver = true;
    }
    
    pacman.mouthAngle += 0.3;
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            const cell = maze[y][x];
            const pixelX = x * tileSize;
            const pixelY = y * tileSize;
            
            if (cell === 1) {
                ctx.fillStyle = '#0000FF';
                ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
            } else if (cell === 2) {
                ctx.fillStyle = '#FFFF00';
                ctx.beginPath();
                ctx.arc(
                    pixelX + tileSize / 2,
                    pixelY + tileSize / 2,
                    2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
    }
    
    const ghostPixelX = ghost.x * tileSize + tileSize / 2;
    const ghostPixelY = ghost.y * tileSize + tileSize / 2;
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(
        ghostPixelX,
        ghostPixelY,
        tileSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    const pacmanPixelX = pacman.x * tileSize + tileSize / 2;
    const pacmanPixelY = pacman.y * tileSize + tileSize / 2;
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    
    const radius = tileSize / 2 - 2;
    
    const mouthOpenness = (Math.sin(pacman.mouthAngle) + 1) / 2;
    const mouthAngle = mouthOpenness * Math.PI / 3;
    
    let startAngle = 0;
    let endAngle = Math.PI * 2;
    
    switch(pacman.direction) {
        case 'right':
            startAngle = mouthAngle;
            endAngle = Math.PI * 2 - mouthAngle;
            break;
        case 'left':
            startAngle = Math.PI + mouthAngle;
            endAngle = Math.PI - mouthAngle;
            break;
        case 'up':
            startAngle = -Math.PI / 2 + mouthAngle;
            endAngle = -Math.PI / 2 - mouthAngle;
            break;
        case 'down':
            startAngle = Math.PI / 2 + mouthAngle;
            endAngle = Math.PI / 2 - mouthAngle;
            break;
    }
    
    ctx.arc(pacmanPixelX, pacmanPixelY, radius, startAngle, endAngle);
    ctx.lineTo(pacmanPixelX, pacmanPixelY);
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);
    
    if (gameOver || gameWon) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        const message = gameWon ? 'You Win!' : 'Game Over!';
        ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '16px Arial';
        ctx.fillText('Press SPACE or ENTER to restart', canvas.width / 2, canvas.height / 2 + 20);
        ctx.textAlign = 'left';
    }
}

function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    update(deltaTime);
    draw();
    
    animationFrameId = requestAnimationFrame((time) => gameLoop(time));
}

function restart() {
    score = 0;
    gameOver = false;
    gameWon = false;
    initGame();
}

function setupEventListeners() {
    document.addEventListener('keydown', (e) => {
        if (gameOver || gameWon) {
            if (e.key === ' ' || e.key === 'Enter') {
                restart();
            }
            return;
        }
        
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                keys.up = true;
                nextDirection = 'up';
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                keys.down = true;
                nextDirection = 'down';
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                keys.left = true;
                nextDirection = 'left';
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                keys.right = true;
                nextDirection = 'right';
                break;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                keys.up = false;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                keys.down = false;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                keys.left = false;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                keys.right = false;
                break;
        }
    });
    
    const dpadButtons = document.querySelectorAll('.dpad-btn');
    dpadButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const direction = btn.getAttribute('data-direction');
            nextDirection = direction;
            handleDirection(direction);
        });
        
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const direction = btn.getAttribute('data-direction');
                nextDirection = direction;
                handleDirection(direction);
            }
        });
    });
}

if (canvas) {
    initGame();
    setupEventListeners();
    gameLoop(0);
}
