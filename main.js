document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const startButton = document.getElementById('start-button');
    const difficultySlider = document.getElementById('difficulty-slider');
    const difficultyLabel = document.getElementById('difficulty-label');
    const messageDiv = document.getElementById('message');
    const moveCounter = document.getElementById('move-counter');
    const rulesButton = document.getElementById('rules-button');
    const modal = document.getElementById('rules-modal');
    const closeModal = document.getElementById('close-modal');

    // Game state
    let boardSize = 3;
    let board = [];
    let emptyTile = { x: 2, y: 2 }; // x = col, y = row
    let moveCount = 0;
    let isGameActive = false;

    const difficulties = ['3×3', '4×4', '5×5'];

    // Colorful tile palette - 24 distinct colors for up to 5x5 (24 tiles)
    const TILE_COLORS = [
        ['#FF6B6B', '#ee5a5a'], // 1  - red
        ['#FF8E53', '#ee7a42'], // 2  - orange-red
        ['#FFA500', '#e09400'], // 3  - orange
        ['#FFD93D', '#ecc52c'], // 4  - yellow
        ['#C8E63C', '#b3d12a'], // 5  - yellow-green
        ['#6BCB77', '#57ba63'], // 6  - green
        ['#2ECC71', '#22bb65'], // 7  - emerald
        ['#20C997', '#14b888'], // 8  - teal
        ['#4DD8E0', '#35c8d0'], // 9  - cyan
        ['#4D96FF', '#3380f0'], // 10 - blue
        ['#5C7CFA', '#4566e8'], // 11 - indigo-blue
        ['#748FFC', '#5c7aec'], // 12 - periwinkle
        ['#845EC2', '#6e4aaa'], // 13 - purple
        ['#9775FA', '#7f5de8'], // 14 - violet
        ['#CC5DE8', '#b845d4'], // 15 - purple-pink
        ['#F783AC', '#e56898'], // 16 - pink
        ['#FF6B9D', '#ee5687'], // 17 - hot-pink
        ['#FF6B6B', '#ee5a5a'], // 18 - red (cycle)
        ['#FF8E53', '#ee7a42'], // 19
        ['#FFD93D', '#ecc52c'], // 20
        ['#6BCB77', '#57ba63'], // 21
        ['#4D96FF', '#3380f0'], // 22
        ['#845EC2', '#6e4aaa'], // 23
        ['#F783AC', '#e56898'], // 24
    ];

    function getTileStyle(num) {
        const idx = (num - 1) % TILE_COLORS.length;
        const [c1, c2] = TILE_COLORS[idx];
        return `linear-gradient(145deg, ${c1}, ${c2})`;
    }

    // ─── Difficulty slider ───────────────────────────────────────────────────
    difficultySlider.addEventListener('input', (event) => {
        const val = parseInt(event.target.value);
        difficultyLabel.textContent = difficulties[val - 3];
        boardSize = val;
        // Update empty tile reference if board size changed while not in a game
        if (!isGameActive) {
            emptyTile = { x: boardSize - 1, y: boardSize - 1 };
            renderPlaceholder();
        }
    });

    // ─── Start / Restart ─────────────────────────────────────────────────────
    startButton.addEventListener('click', () => {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
        moveCount = 0;
        moveCounter.textContent = '0';
        isGameActive = true;
        startButton.textContent = '重新开始';

        initializeBoard();
        shuffleBoard();
        renderBoard();
    });

    // ─── Board logic ─────────────────────────────────────────────────────────
    function initializeBoard() {
        board = [];
        for (let i = 0; i < boardSize; i++) {
            board.push([]);
            for (let j = 0; j < boardSize; j++) {
                board[i].push(i * boardSize + j + 1);
            }
        }
        // Bottom-right is empty (0)
        board[boardSize - 1][boardSize - 1] = 0;
        emptyTile = { x: boardSize - 1, y: boardSize - 1 };
    }

    function shuffleBoard() {
        // 1000 random valid moves guarantee a solvable shuffle
        for (let i = 0; i < 1000; i++) {
            const moves = getValidMoves();
            const move = moves[Math.floor(Math.random() * moves.length)];
            moveTile(move.y, move.x);
        }
        moveCount = 0;
    }

    function getValidMoves() {
        const moves = [];
        // Tiles that can slide into the empty space
        if (emptyTile.y > 0)             moves.push({ x: emptyTile.x, y: emptyTile.y - 1 });
        if (emptyTile.y < boardSize - 1) moves.push({ x: emptyTile.x, y: emptyTile.y + 1 });
        if (emptyTile.x > 0)             moves.push({ x: emptyTile.x - 1, y: emptyTile.y });
        if (emptyTile.x < boardSize - 1) moves.push({ x: emptyTile.x + 1, y: emptyTile.y });
        return moves;
    }

    function isValidMove(row, col) {
        // Valid if directly adjacent (horizontally or vertically) to the empty tile
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
        // Tiles should run 1, 2, … n²-1, then 0 at the end
        let expected = 1;
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                const shouldBe = expected % (boardSize * boardSize); // last cell → 0
                if (board[i][j] !== shouldBe) return false;
                expected++;
            }
        }
        return true;
    }

    // ─── Rendering ───────────────────────────────────────────────────────────
    function getBoardPx() {
        // Match what CSS gives the .game-board element
        return gameBoard.getBoundingClientRect().width;
    }

    function getFontSize() {
        const px = getBoardPx();
        const cellPx = (px - (boardSize - 1) * 6 - 16) / boardSize;
        return Math.floor(cellPx * 0.4);
    }

    function renderPlaceholder() {
        gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
        gameBoard.innerHTML = '';
        const total = boardSize * boardSize;
        for (let i = 0; i < total; i++) {
            const tile = document.createElement('div');
            tile.className = 'tile placeholder';
            gameBoard.appendChild(tile);
        }
    }

    function renderBoard() {
        gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
        gameBoard.innerHTML = '';
        const fs = getFontSize();

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const num = board[row][col];
                const tile = document.createElement('div');

                if (num === 0) {
                    tile.className = 'tile empty';
                } else {
                    tile.className = 'tile';
                    tile.textContent = num;
                    tile.style.background = getTileStyle(num);
                    tile.style.fontSize = `${fs}px`;
                    tile.dataset.row = row;
                    tile.dataset.col = col;
                    tile.addEventListener('click', handleTileClick);
                    // Touch support: treat touchend as click (prevents 300ms delay)
                    tile.addEventListener('touchend', handleTileClick, { passive: true });
                }

                gameBoard.appendChild(tile);
            }
        }
    }

    function handleTileClick(event) {
        if (!isGameActive) return;
        // Avoid double-firing on tap (both touchend and click fire)
        if (event.type === 'touchend') event.stopPropagation();

        const tile = event.currentTarget;
        const row = parseInt(tile.dataset.row);
        const col = parseInt(tile.dataset.col);

        if (isValidMove(row, col)) {
            moveTile(row, col);
            moveCount++;
            moveCounter.textContent = moveCount;
            renderBoard();

            if (isSolved()) {
                showWinMessage();
            }
        }
    }

    function showWinMessage() {
        isGameActive = false;
        messageDiv.className = 'message win';
        messageDiv.innerHTML = `🎉 恭喜！共用了 <strong>${moveCount}</strong> 步！`;
        startButton.textContent = '再来一局';
    }

    // ─── Modal ───────────────────────────────────────────────────────────────
    rulesButton.addEventListener('click', () => {
        modal.classList.add('active');
    });

    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });

    // ─── Initialise ──────────────────────────────────────────────────────────
    // Show placeholder board at startup (slider is at leftmost = 3×3)
    renderPlaceholder();
});
