const canvas = document.getElementById('gameCanvas90s');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileSize = canvas.width / gridSize;

let score = 0;
let gameOver = false;
let paused = false;

let snake = [];
let direction = 'right';
let nextDirection = 'right';
let food = { x: 0, y: 0 };

let lastTime = 0;
let moveInterval = 150;
let lastMoveTime = 0;
let animationFrameId = null;

function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    
    direction = 'right';
    nextDirection = 'right';
    
    spawnFood();
}

function spawnFood() {
    let foodX, foodY;
    let validPosition = false;
    
    while (!validPosition) {
        foodX = Math.floor(Math.random() * gridSize);
        foodY = Math.floor(Math.random() * gridSize);
        
        validPosition = true;
        for (let segment of snake) {
            if (segment.x === foodX && segment.y === foodY) {
                validPosition = false;
                break;
            }
        }
    }
    
    food = { x: foodX, y: foodY };
}

function handleDirection(dir) {
    if (paused || gameOver) return;
    
    const oppositeDirections = {
        'up': 'down',
        'down': 'up',
        'left': 'right',
        'right': 'left'
    };
    
    if (direction !== oppositeDirections[dir]) {
        nextDirection = dir;
    }
}

function update(deltaTime) {
    if (gameOver || paused) return;
    
    lastMoveTime += deltaTime;
    
    if (lastMoveTime >= moveInterval) {
        lastMoveTime = 0;
        move();
    }
}

function move() {
    direction = nextDirection;
    
    const head = { ...snake[0] };
    
    switch(direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    if (head.x < 0 || head.x >= gridSize || 
        head.y < 0 || head.y >= gridSize) {
        gameOver = true;
        return;
    }
    
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver = true;
            return;
        }
    }
    
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        spawnFood();
        
        moveInterval = Math.max(100, 150 - Math.floor(score / 50));
    } else {
        snake.pop();
    }
}

function draw() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#1a0a2e');
    gradient.addColorStop(1, '#2a0a3e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gridSize; i++) {
        const pos = i * tileSize;
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(canvas.width, pos);
        ctx.stroke();
    }
    
    const foodX = food.x * tileSize;
    const foodY = food.y * tileSize;
    const foodCenterX = foodX + tileSize / 2;
    const foodCenterY = foodY + tileSize / 2;
    const foodRadius = tileSize / 2 - 2;
    
    const foodGradient = ctx.createRadialGradient(
        foodCenterX, foodCenterY, 0,
        foodCenterX, foodCenterY, foodRadius + 5
    );
    foodGradient.addColorStop(0, '#ff00ff');
    foodGradient.addColorStop(0.5, '#ff0080');
    foodGradient.addColorStop(1, 'rgba(255, 0, 128, 0)');
    ctx.fillStyle = foodGradient;
    ctx.beginPath();
    ctx.arc(foodCenterX, foodCenterY, foodRadius + 5, 0, Math.PI * 2);
    ctx.fill();
    
    const foodMainGradient = ctx.createRadialGradient(
        foodCenterX - 3, foodCenterY - 3, 0,
        foodCenterX, foodCenterY, foodRadius
    );
    foodMainGradient.addColorStop(0, '#ff00ff');
    foodMainGradient.addColorStop(0.7, '#ff0080');
    foodMainGradient.addColorStop(1, '#cc0066');
    ctx.fillStyle = foodMainGradient;
    ctx.beginPath();
    ctx.arc(foodCenterX, foodCenterY, foodRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(foodCenterX - 3, foodCenterY - 3, foodRadius / 3, 0, Math.PI * 2);
    ctx.fill();
    
    snake.forEach((segment, index) => {
        const x = segment.x * tileSize;
        const y = segment.y * tileSize;
        const centerX = x + tileSize / 2;
        const centerY = y + tileSize / 2;
        const size = tileSize - 2;
        
        if (index === 0) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ffff';
        } else {
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#00ff88';
        }
        
        const snakeGradient = ctx.createLinearGradient(
            x, y, x + size, y + size
        );
        
        if (index === 0) {
            snakeGradient.addColorStop(0, '#00ffff');
            snakeGradient.addColorStop(0.5, '#00ccff');
            snakeGradient.addColorStop(1, '#0099cc');
        } else {
            const intensity = Math.max(0.3, 1 - (index * 0.05));
            snakeGradient.addColorStop(0, `rgba(0, 255, 136, ${intensity})`);
            snakeGradient.addColorStop(0.5, `rgba(0, 204, 102, ${intensity})`);
            snakeGradient.addColorStop(1, `rgba(0, 153, 76, ${intensity})`);
        }
        
        ctx.fillStyle = snakeGradient;
        ctx.fillRect(x + 1, y + 1, size, size);
        
        if (index === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(x + 2, y + 2, size / 3, size / 3);
        }
        
        ctx.shadowBlur = 0;
    });
    
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeText(`SCORE: ${score}`, 10, 25);
    ctx.fillText(`SCORE: ${score}`, 10, 25);
    
    ctx.fillStyle = '#00ff88';
    ctx.strokeText(`LENGTH: ${snake.length}`, 10, 48);
    ctx.fillText(`LENGTH: ${snake.length}`, 10, 48);
    
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const time = Date.now() / 200;
        ctx.strokeStyle = `hsl(${(time * 10) % 360}, 100%, 50%)`;
        ctx.lineWidth = 4;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
        
        ctx.fillStyle = '#ff00ff';
        ctx.font = 'bold 32px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText('GAME OVER!', canvas.width / 2, canvas.height / 2 - 40);
        ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2 - 40);
        
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 18px "Courier New", monospace';
        ctx.lineWidth = 2;
        ctx.strokeText(`FINAL SCORE: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText(`FINAL SCORE: ${score}`, canvas.width / 2, canvas.height / 2);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px "Courier New", monospace';
        ctx.lineWidth = 1;
        ctx.strokeText('Press SPACE or click D-pad to restart', canvas.width / 2, canvas.height / 2 + 35);
        ctx.fillText('Press SPACE or click D-pad to restart', canvas.width / 2, canvas.height / 2 + 35);
        ctx.textAlign = 'left';
    } else if (paused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const pulse = Math.sin(Date.now() / 300) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(255, 0, 255, ${pulse})`;
        ctx.font = 'bold 28px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText('PAUSED', canvas.width / 2, canvas.height / 2);
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        
        ctx.fillStyle = '#00ffff';
        ctx.font = '14px "Courier New", monospace';
        ctx.lineWidth = 1;
        ctx.strokeText('Press SPACE to resume', canvas.width / 2, canvas.height / 2 + 35);
        ctx.fillText('Press SPACE to resume', canvas.width / 2, canvas.height / 2 + 35);
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
    paused = false;
    moveInterval = 150;
    lastMoveTime = 0;
    initGame();
}

function setupEventListeners() {
    document.addEventListener('keydown', (e) => {
        if (gameOver) {
            if (e.key === ' ' || e.key === 'Enter') {
                restart();
            }
            return;
        }
        
        if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
            paused = !paused;
            return;
        }
        
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                if (direction !== 'down') {
                    nextDirection = 'up';
                }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                if (direction !== 'up') {
                    nextDirection = 'down';
                }
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                if (direction !== 'right') {
                    nextDirection = 'left';
                }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                if (direction !== 'left') {
                    nextDirection = 'right';
                }
                break;
        }
    });
    
    const dpadButtons = document.querySelectorAll('.dpad-btn');
    dpadButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (gameOver) {
                restart();
                return;
            }
            
            const direction = btn.getAttribute('data-direction');
            handleDirection(direction);
        });
        
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (gameOver) {
                    restart();
                    return;
                }
                
                const direction = btn.getAttribute('data-direction');
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
