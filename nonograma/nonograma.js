/**
 * NONOGRAMA - Lógica do Jogo
 */

const MAX_HINTS = 4;

const PATTERNS = {
    5: [
        { name: "Coração", grid: [[0,1,0,1,0],[1,1,1,1,1],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]] },
        { name: "Pato", grid: [[0,1,1,0,0],[1,1,1,0,0],[0,1,1,1,1],[0,1,1,1,1],[0,0,1,1,0]] },
        { name: "Sorriso", grid: [[1,0,0,0,1],[1,0,0,0,1],[0,0,0,0,0],[1,0,0,0,1],[0,1,1,1,0]] },
        { name: "Casa", grid: [[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[1,0,1,0,1],[1,1,1,1,1]] }
    ],
    10: [
        { name: "Fantasma", grid: [
            [0,0,0,1,1,1,1,0,0,0],
            [0,0,1,1,1,1,1,1,0,0],
            [0,1,1,0,1,1,0,1,1,0],
            [0,1,1,0,1,1,0,1,1,0],
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,1,0,1,1,0,1,0,1]
        ]},
        { name: "Árvore", grid: [
            [0,0,0,0,1,1,0,0,0,0],
            [0,0,0,1,1,1,1,0,0,0],
            [0,0,1,1,1,1,1,1,0,0],
            [0,0,1,1,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,1,1,0],
            [0,1,1,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1],
            [0,0,0,0,1,1,0,0,0,0],
            [0,0,0,0,1,1,0,0,0,0]
        ]},
        { name: "Foguete", grid: [
            [0,0,0,0,1,1,0,0,0,0],
            [0,0,0,1,1,1,1,0,0,0],
            [0,0,1,1,1,1,1,1,0,0],
            [0,0,1,1,1,1,1,1,0,0],
            [0,0,1,1,1,1,1,1,0,0],
            [0,0,1,1,1,1,1,1,0,0],
            [0,0,1,1,0,0,1,1,0,0],
            [0,1,1,1,0,0,1,1,1,0],
            [0,1,1,1,1,1,1,1,1,0],
            [0,0,1,0,1,1,0,1,0,0]
        ]}
    ],
    15: [
        { name: "Crânio", grid: [
            [0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
            [0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [1,1,0,0,1,1,1,1,1,0,0,1,1,0,0],
            [1,1,0,0,1,1,1,1,1,0,0,1,1,0,0],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,1,1,1,1,1,0,1,1,1,1,1,0,0,0],
            [0,0,1,1,1,1,0,1,1,1,1,0,0,0,0],
            [0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],
            [0,0,0,1,1,0,1,0,1,1,0,0,0,0,0],
            [0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],
            [0,0,0,1,0,1,0,1,0,1,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ]},
        { name: "Espada", grid: [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
            [0,0,0,0,0,0,0,0,0,0,0,1,1,1,0],
            [0,0,0,0,0,0,0,0,0,0,1,1,1,0,0],
            [0,0,0,0,0,0,0,0,0,1,1,1,0,0,0],
            [0,0,0,0,0,0,0,0,1,1,1,0,0,0,0],
            [0,0,0,0,0,0,0,1,1,1,0,0,0,0,0],
            [0,0,0,0,0,0,1,1,1,0,0,0,0,0,0],
            [0,0,0,0,0,1,1,1,0,0,0,0,0,0,0],
            [0,0,0,0,1,1,1,0,0,0,0,0,0,0,0],
            [0,0,0,1,1,1,0,0,0,0,0,0,0,0,0],
            [0,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
            [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
            [0,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ]}
    ]
};

class NonogramaGame {
    constructor() {
        this.difficulty = 'easy';
        this.size = 5;
        this.grid = []; // Solution
        this.playerGrid = []; // 0: empty, 1: filled, 2: crossed, 3: wrong
        this.rowHints = [];
        this.colHints = [];
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.gameStarted = false;
        this.isGameOver = false;
        this.currentTool = 'fill'; // 'fill' or 'x'
        this.lives = 3;
        this.isDragging = false;
        this.dragStateToApply = null; // State to set during current drag (1, 2, or 0)
        this.dragDirection = null; // 'row' or 'col'
        this.dragStartPos = null; // {r, c}

        this.config = {
            easy: { size: 5 },
            medium: { size: 10 },
            hard: { size: 15 }
        };

        this.themes = [
            { hue: 235, name: 'indigo' },
            { hue: 160, name: 'emerald' },
            { hue: 340, name: 'rose' },
            { hue: 200, name: 'cyan' },
            { hue: 35, name: 'amber' },
            { hue: 270, name: 'violet' },
            { hue: 15, name: 'orange' }
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPanZoom();
        this.startNewGame();
    }

    setupPanZoom() {
        this.boardScale = 1;
        this.boardPanX = 0;
        this.boardPanY = 0;
        
        const playArea = document.getElementById('nonograma-play-area');
        const gridEl = document.getElementById('nonograma-grid-wrapper');
        
        this.updateBoardTransform = () => {
            gridEl.style.transform = `translate(${this.boardPanX}px, ${this.boardPanY}px) scale(${this.boardScale})`;
        };

        const zoomInBtn = document.getElementById('btn-zoom-in');
        const zoomOutBtn = document.getElementById('btn-zoom-out');
        const zoomResetBtn = document.getElementById('btn-zoom-reset');

        if(zoomInBtn) zoomInBtn.addEventListener('click', () => {
            this.boardScale = Math.min(2.5, this.boardScale + 0.2);
            this.updateBoardTransform();
        });
        
        if(zoomOutBtn) zoomOutBtn.addEventListener('click', () => {
            this.boardScale = Math.max(0.4, this.boardScale - 0.2);
            this.updateBoardTransform();
        });
        
        if(zoomResetBtn) zoomResetBtn.addEventListener('click', () => {
            this.boardScale = 1;
            this.boardPanX = 0;
            this.boardPanY = 0;
            this.updateBoardTransform();
        });

        playArea.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.boardScale = Math.min(Math.max(0.4, this.boardScale + delta), 2.5);
            this.updateBoardTransform();
        }, { passive: false });

        let isPanning = false;
        let startX = 0, startY = 0;
        let initialPanX = 0, initialPanY = 0;

        playArea.addEventListener('pointerdown', (e) => {
            if (e.target.closest('.nonograma-grid-wrapper') || e.target.closest('.zoom-controls')) return;
            if (e.button && e.button !== 0) return;
            
            isPanning = true;
            startX = e.clientX;
            startY = e.clientY;
            initialPanX = this.boardPanX;
            initialPanY = this.boardPanY;
            playArea.style.cursor = 'grabbing';
            e.preventDefault();
        });

        window.addEventListener('pointermove', (e) => {
            if (!isPanning) return;
            this.boardPanX = initialPanX + (e.clientX - startX);
            this.boardPanY = initialPanY + (e.clientY - startY);
            this.updateBoardTransform();
        });

        window.addEventListener('pointerup', () => {
            if (isPanning) {
                isPanning = false;
                playArea.style.cursor = 'default';
            }
        });
    }

    setupEventListeners() {
        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('.diff-btn');
            if (btn) {
                this.difficulty = btn.dataset.level;
                this.startNewGame();
            }
        });

        document.getElementById('tool-fill').addEventListener('click', () => this.setTool('fill'));
        document.getElementById('tool-x').addEventListener('click', () => this.setTool('x'));
        document.getElementById('btn-persistent-new-game').addEventListener('click', () => this.startNewGame());
        document.getElementById('btn-new-game-modal').addEventListener('click', () => {
            document.getElementById('game-modal').classList.remove('active');
            this.startNewGame();
        });

        document.getElementById('btn-help-trigger').addEventListener('click', () => {
            document.getElementById('help-modal').classList.add('active');
        });
        document.getElementById('btn-stats-trigger').addEventListener('click', () => {
            this.updateStatsDisplay();
            document.getElementById('stats-modal').classList.add('active');
        });

        document.querySelectorAll('.modal-close, #btn-close-help-confirm').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal-overlay');
                if (modal) modal.classList.remove('active');
            });
        });

        window.addEventListener('keydown', (e) => {
            if (this.isGameOver) return;
            if (e.code === 'Space') {
                e.preventDefault();
                this.setTool('fill');
            } else if (e.key.toLowerCase() === 'x') {
                this.setTool('x');
            }
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.dragStateToApply = null;
            this.dragDirection = null;
        });

        // Touch support using pointer events
        window.addEventListener('pointerup', () => {
            this.isDragging = false;
            this.dragStateToApply = null;
            this.dragDirection = null;
        });
    }

    startNewGame() {
        this.isGameOver = false;
        this.moves = 0;
        this.timer = 0;
        this.lives = 3;
        this.gameStarted = false;
        this.size = this.config[this.difficulty].size;
        this.stopTimer();
        this.updateTimerDisplay();
        this.updateLivesDisplay();
        document.getElementById('moves-count').textContent = '0';
        
        this.applyRandomTheme();

        const btnHeaderNew = document.getElementById("btn-persistent-new-game");
        if (btnHeaderNew) btnHeaderNew.classList.remove("visible");

        this.generatePuzzle();
        this.renderBoard();
        
        // Reset Pan/Zoom
        this.boardScale = 1;
        this.boardPanX = 0;
        this.boardPanY = 0;
        if (this.updateBoardTransform) this.updateBoardTransform();
    }

    generateProceduralGrid(size) {
        let grid = Array(size).fill().map(() => 
            Array(size).fill().map(() => Math.random() > 0.55 ? 1 : 0)
        );

        const applyCA = (g) => {
            let nextG = Array(size).fill().map(() => Array(size).fill(0));
            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    let neighbors = 0;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            if (dr === 0 && dc === 0) continue;
                            let nr = r + dr, nc = c + dc;
                            if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
                                neighbors += g[nr][nc];
                            }
                        }
                    }
                    if (neighbors > 4) nextG[r][c] = 1;
                    else if (neighbors < 4) nextG[r][c] = 0;
                    else nextG[r][c] = g[r][c];
                }
            }
            return nextG;
        };

        for (let i = 0; i < 3; i++) {
            grid = applyCA(grid);
        }

        if (Math.random() > 0.4) {
            for (let r = 0; r < size; r++) {
                for (let c = 0; c < Math.floor(size / 2); c++) {
                    grid[r][size - 1 - c] = grid[r][c];
                }
            }
        }

        for (let r = 0; r < size; r++) {
            if (!grid[r].includes(1)) {
                let center = Math.floor(size/2);
                grid[r][center] = 1;
                if (center > 0) grid[r][center-1] = 1;
            }
        }
        for (let c = 0; c < size; c++) {
            let hasFilled = false;
            for (let r = 0; r < size; r++) {
                if (grid[r][c] === 1) { hasFilled = true; break; }
            }
            if (!hasFilled) {
                let center = Math.floor(size/2);
                grid[center][c] = 1;
                if (center > 0) grid[center-1][c] = 1;
            }
        }

        return grid;
    }

    generatePuzzle() {
        let attempts = 0;
        let valid = false;

        while (!valid && attempts < 100) {
            attempts++;
            const patterns = PATTERNS[this.size] || [];
            
            // Reduzida a chance de usar pattern estático para focar no sistema inteligente
            if (patterns.length > 0 && Math.random() < 0.15) {
                const pattern = patterns[Math.floor(Math.random() * patterns.length)];
                this.grid = JSON.parse(JSON.stringify(pattern.grid));
            } else {
                this.grid = this.generateProceduralGrid(this.size);
            }

            this.calculateHints();
            
            // Check if any row or column has more than MAX_HINTS
            const maxRowHints = Math.max(...this.rowHints.map(h => h.length));
            const maxColHints = Math.max(...this.colHints.map(h => h.length));
            
            if (maxRowHints <= MAX_HINTS && maxColHints <= MAX_HINTS) {
                valid = true;
            }
        }

        this.playerGrid = Array(this.size).fill().map(() => Array(this.size).fill(0));
    }

    calculateHints() {
        this.rowHints = this.grid.map(row => {
            const hints = [];
            let count = 0;
            row.forEach(cell => {
                if (cell === 1) count++;
                else if (count > 0) { hints.push(count); count = 0; }
            });
            if (count > 0) hints.push(count);
            if (hints.length === 0) hints.push(0);
            return hints;
        });

        this.colHints = [];
        for (let c = 0; c < this.size; c++) {
            const hints = [];
            let count = 0;
            for (let r = 0; r < this.size; r++) {
                if (this.grid[r][c] === 1) count++;
                else if (count > 0) { hints.push(count); count = 0; }
            }
            if (count > 0) hints.push(count);
            if (hints.length === 0) hints.push(0);
            this.colHints.push(hints);
        }
    }

    setTool(tool) {
        this.currentTool = tool;
        document.getElementById('tool-fill').classList.toggle('active', tool === 'fill');
        document.getElementById('tool-x').classList.toggle('active', tool === 'x');
    }

    renderBoard() {
        const container = document.getElementById('nonograma-container');
        const rowHintsEl = document.getElementById('row-hints');
        const colHintsEl = document.getElementById('col-hints');

        container.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        rowHintsEl.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;
        colHintsEl.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;

        container.innerHTML = '';
        rowHintsEl.innerHTML = '';
        colHintsEl.innerHTML = '';

        this.rowHints.forEach(hints => {
            const el = document.createElement('div');
            el.className = 'hint-cell row';
            hints.forEach(h => {
                const span = document.createElement('span');
                span.className = 'hint-num';
                span.textContent = h;
                el.appendChild(span);
            });
            rowHintsEl.appendChild(el);
        });

        this.colHints.forEach(hints => {
            const el = document.createElement('div');
            el.className = 'hint-cell column';
            hints.forEach(h => {
                const span = document.createElement('span');
                span.className = 'hint-num';
                span.textContent = h;
                el.appendChild(span);
            });
            colHintsEl.appendChild(el);
        });

        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const cell = document.createElement('div');
                cell.className = 'nono-cell';
                if ((c + 1) % 5 === 0 && c !== this.size - 1) cell.classList.add('border-right');
                if ((r + 1) % 5 === 0 && r !== this.size - 1) cell.classList.add('border-bottom');
                
                cell.dataset.r = r;
                cell.dataset.c = c;
                
                this.updateCellVisual(cell, r, c);

                const onStart = (e) => {
                    if (this.isGameOver) return;
                    if (e.type === 'mousedown' && e.button !== 0) return;
                    
                    e.preventDefault();
                    this.isDragging = true;
                    this.dragStartPos = { r, c };
                    this.dragDirection = null;
                    
                    const currentState = this.playerGrid[r][c];
                    if (this.currentTool === 'fill') {
                        this.dragStateToApply = (currentState === 1) ? 0 : 1;
                    } else {
                        this.dragStateToApply = (currentState === 2) ? 0 : 2;
                    }
                    
                    this.handleCellAction(r, c);
                };

                const onEnter = (e) => {
                    if (this.isDragging) {
                        // Axis locking logic
                        if (!this.dragDirection) {
                            if (r !== this.dragStartPos.r) this.dragDirection = 'col';
                            else if (c !== this.dragStartPos.c) this.dragDirection = 'row';
                        }
                        
                        if (this.dragDirection === 'row' && r !== this.dragStartPos.r) return;
                        if (this.dragDirection === 'col' && c !== this.dragStartPos.c) return;
                        
                        this.handleCellAction(r, c);
                    }
                };

                cell.addEventListener('mousedown', onStart);
                cell.addEventListener('mouseenter', onEnter);
                
                // Pointer events for mobile
                cell.addEventListener('pointerdown', onStart);
                cell.addEventListener('pointerenter', onEnter);
                
                container.appendChild(cell);
            }
        }
    }

    updateCellVisual(el, r, c) {
        const state = this.playerGrid[r][c];
        el.classList.remove('filled', 'crossed', 'wrong');
        if (state === 1) el.classList.add('filled');
        else if (state === 2) el.classList.add('crossed');
        else if (state === 3) el.classList.add('wrong');
        
        this.updateHintsStatus();
    }

    updateHintsStatus() {
        this.rowHints.forEach((hints, r) => {
            const rowFilled = this.playerGrid[r].filter(v => v === 1).length;
            const totalRequired = hints.reduce((a, b) => a + b, 0);
            const hintCells = document.querySelectorAll(`#row-hints .hint-cell`)[r];
            if (hintCells) {
                const nums = hintCells.querySelectorAll('.hint-num');
                const isDone = rowFilled === totalRequired;
                nums.forEach(n => n.classList.toggle('done', isDone));
            }
        });

        this.colHints.forEach((hints, c) => {
            let colFilled = 0;
            for (let r = 0; r < this.size; r++) {
                if (this.playerGrid[r][c] === 1) colFilled++;
            }
            const totalRequired = hints.reduce((a, b) => a + b, 0);
            const hintCells = document.querySelectorAll(`#col-hints .hint-cell`)[c];
            if (hintCells) {
                const nums = hintCells.querySelectorAll('.hint-num');
                const isDone = colFilled === totalRequired;
                nums.forEach(n => n.classList.toggle('done', isDone));
            }
        });
    }

    handleCellAction(r, c) {
        if (this.isGameOver) return;
        
        const cellEl = document.querySelector(`.nono-cell[data-r="${r}"][data-c="${c}"]`);
        const currentState = this.playerGrid[r][c];
        const shouldBeFilled = this.grid[r][c] === 1;

        if (!this.gameStarted) {
            this.gameStarted = true;
            this.startTimer();
        }

        // Rule: Can't change correctly filled or wrong cells
        if (currentState === 1 || currentState === 3) return;

        if (this.currentTool === 'fill') {
            // If dragging and target state is 0 (unfill), we skip because correct cells can't be unfilled
            if (this.dragStateToApply === 0) return;

            // Only fill if it's correct
            if (shouldBeFilled) {
                if (this.playerGrid[r][c] !== 1) {
                    this.playerGrid[r][c] = 1;
                    this.moves++;
                    this.updateCellVisual(cellEl, r, c);
                    this.checkWin();
                }
            } else {
                // Wrong move: penalize and stop drag
                if (this.playerGrid[r][c] === 3) return;
                
                this.playerGrid[r][c] = 3;
                this.loseLife();
                this.updateCellVisual(cellEl, r, c);
                
                // CRITICAL: Stop dragging on mistake to prevent brute-force
                this.isDragging = false;
            }
        } else {
            // Marker tool (X)
            const targetXState = this.dragStateToApply === 2 ? 2 : 0;
            if (this.playerGrid[r][c] !== targetXState) {
                this.playerGrid[r][c] = targetXState;
                this.updateCellVisual(cellEl, r, c);
            }
        }
        
        document.getElementById('moves-count').textContent = this.moves;
    }

    loseLife() {
        this.lives--;
        this.updateLivesDisplay();
        if (this.lives <= 0) this.gameOver(false);
    }

    updateLivesDisplay() {
        const hearts = document.querySelectorAll('.heart-icon');
        hearts.forEach((h, i) => {
            if (i >= this.lives) h.classList.add('lost');
            else h.classList.remove('lost');
        });
    }

    checkWin() {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const shouldBeFilled = this.grid[r][c] === 1;
                if (shouldBeFilled && this.playerGrid[r][c] !== 1) return false;
            }
        }
        this.gameOver(true);
        return true;
    }

    gameOver(won) {
        this.isGameOver = true;
        this.stopTimer();
        this.saveStats(won);

        setTimeout(() => {
            const modal = document.getElementById('game-modal');
            const modalContent = modal.querySelector(".modal");
            const title = document.getElementById("modal-title");
            const text = document.getElementById("modal-text");
            const icon = document.getElementById("result-icon");

            modalContent.classList.remove("win", "lose");
            
            if (won) {
                modalContent.classList.add("win");
                title.textContent = "VITÓRIA!";
                icon.textContent = "🏆";
                text.textContent = "Parabéns! Você revelou a imagem oculta!";
            } else {
                modalContent.classList.add("lose");
                title.textContent = "GAME OVER";
                icon.textContent = "💔";
                text.textContent = "Suas vidas acabaram! Tente novamente para decifrar o código.";
            }

            document.getElementById("res-stat-moves").textContent = this.moves;
            document.getElementById("res-stat-time").textContent = this.formatTime(this.timer);

            modal.classList.add('active');
            const btnHeaderNew = document.getElementById("btn-persistent-new-game");
            if (btnHeaderNew) btnHeaderNew.classList.add('visible');
        }, 500);
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    updateTimerDisplay() {
        const display = document.getElementById('game-timer');
        if (display) display.textContent = this.formatTime(this.timer);
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    saveStats(won) {
        let stats = JSON.parse(localStorage.getItem('nonograma_stats')) || { played: 0, wins: 0 };
        stats.played++;
        if (won) stats.wins++;
        localStorage.setItem('nonograma_stats', JSON.stringify(stats));
    }

    updateStatsDisplay() {
        let stats = JSON.parse(localStorage.getItem('nonograma_stats')) || { played: 0, wins: 0 };
        document.getElementById('stat-played').textContent = stats.played;
        const winPct = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
        document.getElementById('stat-wins').textContent = winPct + '%';
    }

    applyRandomTheme() {
        const theme = this.themes[Math.floor(Math.random() * this.themes.length)];
        const root = document.documentElement;
        
        // Use HSL for consistent look but different colors
        const primary = `hsl(${theme.hue}, 85%, 65%)`;
        const primaryGlow = `hsla(${theme.hue}, 85%, 65%, 0.4)`;
        const primaryBorder = `hsla(${theme.hue}, 85%, 65%, 0.3)`;
        
        root.style.setProperty('--current-primary', primary);
        root.style.setProperty('--current-primary-glow', primaryGlow);
        root.style.setProperty('--current-primary-border', primaryBorder);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.nonogramaGame = new NonogramaGame();
});
