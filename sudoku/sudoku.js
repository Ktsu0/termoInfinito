/**
 * SUDOKU - Lógica do Jogo
 */

class SudokuGame {
    constructor() {
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.initialBoard = Array(9).fill().map(() => Array(9).fill(0));
        this.selectedCell = null;
        this.difficulty = 'easy';
        this.timer = 0;
        this.timerInterval = null;
        this.gameStarted = false;
        this.lives = 3;
        this.isGameOver = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startNewGame();
    }

    setupEventListeners() {
        // Seleção de dificuldade
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active-mode'));
                btn.classList.add('active-mode');
                this.difficulty = btn.dataset.level;
                this.startNewGame();
            });
        });

        // Botão Novo Jogo
        const btnNewGame = document.getElementById('btn-persistent-new-game');
        if (btnNewGame) btnNewGame.addEventListener('click', () => this.startNewGame());

        const btnNewGameModal = document.getElementById('btn-new-game-modal');
        if (btnNewGameModal) btnNewGameModal.addEventListener('click', () => {
            document.getElementById('game-modal').classList.remove('active');
            this.startNewGame();
        });

        // Teclado numérico
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.num) {
                    this.setCellValue(parseInt(btn.dataset.num));
                } else if (btn.dataset.action === 'erase') {
                    this.setCellValue(0);
                }
            });
        });

        // Teclado físico
        window.addEventListener('keydown', (e) => {
            if (this.isGameOver) return;
            if (e.key >= '1' && e.key <= '9') {
                this.setCellValue(parseInt(e.key));
            } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
                this.setCellValue(0);
            } else if (e.key.startsWith('Arrow')) {
                this.moveSelection(e.key);
            }
        });

        // Modais
        const btnHelp = document.getElementById('btn-help-trigger');
        const helpModal = document.getElementById('help-modal');
        const btnCloseHelp = document.getElementById('btn-close-help');

        if (btnHelp) btnHelp.addEventListener('click', () => helpModal.classList.add('active'));
        if (btnCloseHelp) btnCloseHelp.addEventListener('click', () => helpModal.classList.remove('active'));

        const btnStats = document.getElementById('btn-stats-trigger');
        const statsModal = document.getElementById('stats-modal');
        const btnCloseStats = document.getElementById('btn-close-stats');
        const btnCloseStatsX = document.getElementById('btn-close-stats-x');

        if (btnStats) btnStats.addEventListener('click', () => {
            this.updateStats();
            statsModal.classList.add('active');
        });
        if (btnCloseStats) btnCloseStats.addEventListener('click', () => statsModal.classList.remove('active'));
        if (btnCloseStatsX) btnCloseStatsX.addEventListener('click', () => statsModal.classList.remove('active'));

        // Clique fora para fechar modais
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.classList.remove('active');
            }
        });
    }

    startNewGame() {
        this.isGameOver = false;
        this.gameStarted = false;
        this.lives = 3;
        this.updateLivesUI();
        this.timer = 0;
        this.updateTimer();
        this.stopTimer();
        
        this.generateBoard();
        this.renderBoard();
        this.updateNumpadStatus();
        this.selectedCell = null;
    }

    generateBoard() {
        // Limpar board
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        
        // Preencher solução completa
        this.solveSudoku(this.board);
        
        // Copiar solução
        this.solution = this.board.map(row => [...row]);
        
        // Remover células baseado na dificuldade
        let cellsToRemove = 45; // Easy
        if (this.difficulty === 'medium') cellsToRemove = 51;
        if (this.difficulty === 'hard') cellsToRemove = 58;
        
        this.initialBoard = this.board.map(row => [...row]);
        
        let removed = 0;
        while (removed < cellsToRemove) {
            let r = Math.floor(Math.random() * 9);
            let c = Math.floor(Math.random() * 9);
            if (this.initialBoard[r][c] !== 0) {
                this.initialBoard[r][c] = 0;
                removed++;
            }
        }
        
        this.board = this.initialBoard.map(row => [...row]);
    }

    solveSudoku(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                    for (let num of nums) {
                        if (this.isValid(grid, row, col, num)) {
                            grid[row][col] = num;
                            if (this.solveSudoku(grid)) return true;
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    isValid(grid, row, col, num) {
        // Linha
        for (let x = 0; x < 9; x++) if (grid[row][x] === num) return false;
        // Coluna
        for (let x = 0; x < 9; x++) if (grid[x][col] === num) return false;
        // Bloco 3x3
        let startRow = row - row % 3;
        let startCol = col - col % 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[i + startRow][j + startCol] === num) return false;
            }
        }
        return true;
    }

    renderBoard() {
        const container = document.getElementById('sudoku-container');
        container.innerHTML = '';
        
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                if (this.initialBoard[r][c] !== 0) {
                    cell.classList.add('fixed');
                    cell.textContent = this.initialBoard[r][c];
                } else if (this.board[r][c] !== 0) {
                    cell.textContent = this.board[r][c];
                    cell.classList.add('user-value');
                    if (this.board[r][c] !== this.solution[r][c]) {
                        cell.classList.add('error');
                    }
                }
                
                cell.dataset.row = r;
                cell.dataset.col = c;
                
                cell.addEventListener('click', () => this.selectCell(r, c));
                container.appendChild(cell);
            }
        }
    }

    selectCell(r, c) {
        if (this.isGameOver) return;
        this.selectedCell = { r, c };
        this.updateHighlights();
        
        // Iniciar timer na primeira seleção ou ação
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.startTimer();
        }
    }

    updateHighlights() {
        const cells = document.querySelectorAll('.sudoku-cell');
        const { r: selR, c: selC } = this.selectedCell;
        const selValue = this.board[selR][selC];
        
        cells.forEach(cell => {
            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);
            
            cell.classList.remove('selected', 'related', 'same-value');
            
            if (r === selR && c === selC) {
                cell.classList.add('selected');
            } else if (r === selR || c === selC || (Math.floor(r/3) === Math.floor(selR/3) && Math.floor(c/3) === Math.floor(selC/3))) {
                cell.classList.add('related');
            }
            
            if (selValue !== 0 && this.board[r][c] === selValue) {
                cell.classList.add('same-value');
            }
        });
    }

    setCellValue(num) {
        if (!this.selectedCell || this.isGameOver) return;
        const { r, c } = this.selectedCell;
        
        if (this.initialBoard[r][c] !== 0) return;

        if (!this.gameStarted) {
            this.gameStarted = true;
            this.startTimer();
        }
        
        this.board[r][c] = num;
        const cell = document.querySelector(`.sudoku-cell[data-row="${r}"][data-col="${c}"]`);
        cell.textContent = num === 0 ? '' : num;
        cell.classList.toggle('user-value', num !== 0);
        
        if (num !== 0 && num !== this.solution[r][c]) {
            cell.classList.add('error');
            this.lives--;
            this.updateLivesUI();
            if (this.lives <= 0) {
                this.onLose();
            }
        } else {
            cell.classList.remove('error');
        }
        
        this.updateHighlights();
        this.updateNumpadStatus();
        this.checkWin();
    }

    updateNumpadStatus() {
        const counts = Array(10).fill(0);
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const val = this.board[r][c];
                // Conta apenas os números que estão corretos de acordo com a solução
                if (val !== 0 && val === this.solution[r][c]) {
                    counts[val]++;
                }
            }
        }
        
        document.querySelectorAll('.num-btn[data-num]').forEach(btn => {
            const num = parseInt(btn.dataset.num);
            if (counts[num] >= 9) {
                btn.classList.add('completed');
            } else {
                btn.classList.remove('completed');
            }
        });
    }

    moveSelection(key) {
        if (!this.selectedCell) {
            this.selectCell(0, 0);
            return;
        }
        let { r, c } = this.selectedCell;
        if (key === 'ArrowUp') r = (r - 1 + 9) % 9;
        if (key === 'ArrowDown') r = (r + 1) % 9;
        if (key === 'ArrowLeft') c = (c - 1 + 9) % 9;
        if (key === 'ArrowRight') c = (c + 1) % 9;
        this.selectCell(r, c);
    }

    checkWin() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.board[r][c] !== this.solution[r][c]) return;
            }
        }
        this.onWin();
    }

    onWin() {
        this.isGameOver = true;
        this.stopTimer();
        this.saveStats(true);
        
        setTimeout(() => {
            const modal = document.getElementById('game-modal');
            const title = document.getElementById('modal-title');
            const text = document.getElementById('modal-text');
            const icon = document.getElementById('modal-icon');
            
            title.textContent = 'VITÓRIA!';
            title.className = 'modal-title-win';
            text.innerHTML = `Excelente! Você resolveu o Sudoku no modo <b>${this.difficulty.toUpperCase()}</b><br>Tempo final: <b>${this.formatTime(this.timer)}</b>`;
            
            icon.innerHTML = `
                <div class="modal-icon" style="background: rgba(16, 185, 129, 0.1); border-color: var(--success);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                </div>
            `;
            
            modal.classList.add('active');
            this.createConfetti();
        }, 500);
    }

    onLose() {
        this.isGameOver = true;
        this.stopTimer();
        this.saveStats(false);
        
        setTimeout(() => {
            const modal = document.getElementById('game-modal');
            const title = document.getElementById('modal-title');
            const text = document.getElementById('modal-text');
            const icon = document.getElementById('modal-icon');
            
            title.textContent = 'GAME OVER';
            title.className = 'modal-title-lose';
            text.innerHTML = `Você cometeu muitos erros!<br>Nível: <b>${this.difficulty.toUpperCase()}</b>`;
            
            icon.innerHTML = `
                <div class="modal-icon" style="background: rgba(244, 63, 94, 0.1); border-color: var(--error);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                </div>
            `;
            
            modal.classList.add('active');
        }, 500);
    }

    updateLivesUI() {
        const hearts = document.querySelectorAll('.heart-icon');
        hearts.forEach((heart, index) => {
            if (index < this.lives) {
                heart.src = '../assets/heart.webp';
                heart.classList.remove('dead');
            } else {
                heart.src = '../assets/heart_dead.webp';
                heart.classList.add('dead');
            }
        });
    }

    createConfetti() {
        const container = document.getElementById('confetti-container');
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
            container.appendChild(confetti);
        }
    }

    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimer();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    updateTimer() {
        const display = document.getElementById('game-timer');
        if (display) display.textContent = this.formatTime(this.timer);
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    saveStats(isWin) {
        const stats = JSON.parse(localStorage.getItem('sudoku-stats') || '{"played":0, "wins":0, "streak":0, "maxStreak":0}');
        stats.played++;
        if (isWin) {
            stats.wins++;
            stats.streak++;
            if (stats.streak > stats.maxStreak) stats.maxStreak = stats.streak;
        } else {
            stats.streak = 0;
        }
        localStorage.setItem('sudoku-stats', JSON.stringify(stats));
    }

    updateStats() {
        const stats = JSON.parse(localStorage.getItem('sudoku-stats') || '{"played":0, "wins":0, "streak":0, "maxStreak":0}');
        document.getElementById('stat-played').textContent = stats.played;
        document.getElementById('stat-wins').textContent = stats.played ? Math.round((stats.wins / stats.played) * 100) + '%' : '0%';
        document.getElementById('stat-streak').textContent = stats.streak;
        document.getElementById('stat-max-streak').textContent = stats.maxStreak;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});
