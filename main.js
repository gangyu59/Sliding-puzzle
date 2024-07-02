document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const context = canvas.getContext('2d');
    const startButton = document.getElementById('start-button');
    const difficultySlider = document.getElementById('difficulty-slider');
    const difficultyLabel = document.getElementById('difficulty-label');
    const messageDiv = document.getElementById('message');
    const moveCounter = document.getElementById('move-counter');
    const rulesButton = document.getElementById('rules-button');
    const modal = document.getElementById('rules-modal');
    const closeButton = document.querySelector('.close-button');

    let boardSize = 3;
    let board = [];
    let emptyTile = { x: 2, y: 2 };
    let moveCount = 0;
    let isGameActive = false;

    const difficulties = ['3x3', '4x4', '5x5'];

    difficultySlider.addEventListener('input', (event) => {
        difficultyLabel.textContent = difficulties[event.target.value - 3];
        boardSize = parseInt(event.target.value);
        resizeCanvas();
    });

    startButton.addEventListener('click', () => {
        messageDiv.textContent = '';
        moveCount = 0;
        isGameActive = true;
        moveCounter.textContent = `移动次数 = ${moveCount}`;
        initializeBoard();
        shuffleBoard();
        drawBoard();
    });

    canvas.addEventListener('click', (event) => {
        if (!isGameActive) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const col = Math.floor(x / (rect.width / boardSize));
        const row = Math.floor(y / (rect.height / boardSize));

        if (isValidMove(row, col)) {
            moveTile(row, col);
            moveCount++;
            moveCounter.textContent = `移动次数 = ${moveCount}`;
            drawBoard();

            if (isSolved()) {
                messageDiv.style.color = 'green';
                messageDiv.textContent = `恭喜成功！一共用了${moveCount}步。`;
                isGameActive = false;
            }
        }
    });

    function initializeBoard() {
        board = [];
        for (let i = 0; i < boardSize; i++) {
            board.push([]);
            for (let j = 0; j < boardSize; j++) {
                board[i].push(i * boardSize + j + 1);
            }
        }
        board[boardSize - 1][boardSize - 1] = 0; // Set the last tile as empty
        emptyTile = { x: boardSize - 1, y: boardSize - 1 };
    }

    function shuffleBoard() {
        for (let i = 0; i < 1000; i++) {
            const moves = getValidMoves();
            const move = moves[Math.floor(Math.random() * moves.length)];
            moveTile(move.y, move.x);
        }
        moveCount = 0;
    }

    function getValidMoves() {
        const moves = [];
        if (emptyTile.y > 0) moves.push({ x: emptyTile.x, y: emptyTile.y - 1 });
        if (emptyTile.y < boardSize - 1) moves.push({ x: emptyTile.x, y: emptyTile.y + 1 });
        if (emptyTile.x > 0) moves.push({ x: emptyTile.x - 1, y: emptyTile.y });
        if (emptyTile.x < boardSize - 1) moves.push({ x: emptyTile.x + 1, y: emptyTile.y });
        return moves;
    }

    function isValidMove(row, col) {
        return (
            (Math.abs(emptyTile.x - col) === 1 && emptyTile.y === row) ||
            (Math.abs(emptyTile.y - row) === 1 && emptyTile.x === col)
        );
    }

    function moveTile(row, col) {
        board[emptyTile.y][emptyTile.x] = board[row][col];
        board[row][col] = 0;
        emptyTile = { x: col, y: row };
    }

    function isSolved() {
        let count = 1;
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (board[i][j] !== count % (boardSize * boardSize)) {
                    return false;
                }
                count++;
            }
        }
        return true;
    }

    function drawBoard() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        const cellSize = Math.min(canvas.width / boardSize, canvas.height / boardSize);

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (board[row][col] !== 0) {
                    context.fillStyle = 'lightblue';
                    context.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                    context.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
                    context.fillStyle = 'black';
                    context.font = `${cellSize / 2}px Arial`;
                    context.textAlign = 'center';
                    context.textBaseline = 'middle';
                    context.fillText(board[row][col], col * cellSize + cellSize / 2, row * cellSize + cellSize / 2);
                }
            }
        }
    }

    function resizeCanvas() {
        const minDimension = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8);
        canvas.width = minDimension;
        canvas.height = minDimension;
        drawBoard();
    }

    // Initialize game
    resizeCanvas();

    // Rules modal
    rulesButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    window.addEventListener('resize', resizeCanvas);
});