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

        this.config = {
            easy: { size: 5 },
            medium: { size: 10 },
            hard: { size: 15 }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startNewGame();
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
        
        const btnHeaderNew = document.getElementById("btn-persistent-new-game");
        if (btnHeaderNew) btnHeaderNew.classList.remove("visible");

        this.generatePuzzle();
        this.renderBoard();
    }

    generatePuzzle() {
        let attempts = 0;
        let valid = false;

        while (!valid && attempts < 100) {
            attempts++;
            const patterns = PATTERNS[this.size] || [];
            if (patterns.length > 0 && attempts < 5) {
                const pattern = patterns[Math.floor(Math.random() * patterns.length)];
                this.grid = JSON.parse(JSON.stringify(pattern.grid));
            } else {
                // Generate random but respect MAX_HINTS constraint roughly
                this.grid = Array(this.size).fill().map(() => 
                    Array(this.size).fill().map(() => Math.random() > 0.5 ? 1 : 0)
                );
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
            return hints.length ? hints : [0];
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
            this.colHints.push(hints.length ? hints : [0]);
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

                cell.addEventListener('mousedown', (e) => {
                    if (this.isGameOver) return;
                    e.preventDefault();
                    this.isDragging = true;
                    
                    const currentState = this.playerGrid[r][c];
                    if (this.currentTool === 'fill') {
                        this.dragStateToApply = (currentState === 1) ? 0 : 1;
                    } else {
                        this.dragStateToApply = (currentState === 2) ? 0 : 2;
                    }
                    
                    this.handleCellAction(r, c);
                });
                
                cell.addEventListener('mouseenter', () => {
                    if (this.isDragging) this.handleCellAction(r, c);
                });
                
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
            // Only fill if it's correct
            if (shouldBeFilled) {
                if (this.playerGrid[r][c] !== 1) {
                    this.playerGrid[r][c] = 1;
                    this.moves++;
                    this.updateCellVisual(cellEl, r, c);
                    this.checkWin();
                }
            } else {
                // Wrong move
                this.playerGrid[r][c] = 3;
                this.loseLife();
                this.updateCellVisual(cellEl, r, c);
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
}

document.addEventListener('DOMContentLoaded', () => {
    window.nonogramaGame = new NonogramaGame();
});
