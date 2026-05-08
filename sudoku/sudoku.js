/**
 * SUDOKU - Lógica do Jogo
 */

class SudokuGame {
    constructor() {
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.initialBoard = Array(9).fill().map(() => Array(9).fill(0));
        this.notes = Array(9).fill().map(() => Array(9).fill().map(() => new Set()));
        this.selectedCell = null;
        this.difficulty = 'easy';
        this.timer = 0;
        this.timerInterval = null;
        this.gameStarted = false;
        this.lives = 3;
        this.isGameOver = false;
        this.draftMode = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startNewGame();
    }

    setupEventListeners() {
        // Toggle Keyboard Logic
        const keyboardWrapper = document.getElementById("keyboard-wrapper");
        const btnFloatingKeyboard = document.getElementById("btn-floating-keyboard");
        const btnCloseKeyboard = document.getElementById("btn-close-keyboard");

        const toggleKeyboard = () => {
            if (!keyboardWrapper || !btnFloatingKeyboard) return;
            const isHidden = keyboardWrapper.classList.contains('hidden');
            if (isHidden) {
                keyboardWrapper.classList.remove('hidden');
                btnFloatingKeyboard.classList.add('hidden');
                // Keyboard shown → hide floating draft btn
                const fb = document.getElementById('btn-draft-mode-floating');
                if (fb) fb.classList.add('draft-btn-hidden');
            } else {
                keyboardWrapper.classList.add('hidden');
                btnFloatingKeyboard.classList.remove('hidden');
                // Keyboard hidden → show floating draft btn
                const fb = document.getElementById('btn-draft-mode-floating');
                if (fb) fb.classList.remove('draft-btn-hidden');
            }
        };

        if (btnFloatingKeyboard) btnFloatingKeyboard.onclick = toggleKeyboard;
        if (btnCloseKeyboard) btnCloseKeyboard.onclick = toggleKeyboard;

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

        // Botões rascunho (no teclado e flutuante nas vidas)
        const btnDraft = document.getElementById('btn-draft-mode');
        if (btnDraft) {
            btnDraft.addEventListener('click', () => this.toggleDraftMode());
        }
        const btnDraftFloating = document.getElementById('btn-draft-mode-floating');
        if (btnDraftFloating) {
            btnDraftFloating.addEventListener('click', () => this.toggleDraftMode());
        }

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
            } else if (e.key.toLowerCase() === 'n') {
                this.toggleDraftMode();
            }
        });

        // Modais
        const btnHelp = document.getElementById('btn-help-trigger');
        const helpModal = document.getElementById('help-modal');
        const btnCloseHelp = document.getElementById('btn-close-help');

        if (btnHelp) btnHelp.addEventListener('click', () => helpModal.classList.add('active'));
        if (btnCloseHelp) btnCloseHelp.addEventListener('click', () => helpModal.classList.remove('active'));
        const btnCloseHelpX = document.getElementById('btn-close-help-x');
        if (btnCloseHelpX) btnCloseHelpX.addEventListener('click', () => helpModal.classList.remove('active'));

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

        const btnCloseGameX = document.getElementById('btn-close-modal-x');
        const gameModal = document.getElementById('game-modal');
        if (btnCloseGameX) btnCloseGameX.addEventListener('click', () => gameModal.classList.remove('active'));

        // Clique fora para fechar modais
        window.addEventListener('click', (e) => {
            if (e.target === helpModal) helpModal.classList.remove('active');
            if (e.target === statsModal) statsModal.classList.remove('active');
            if (e.target === gameModal) gameModal.classList.remove('active');
        });

        // Botão Novo Jogo persistente no header
        const btnPersistentNew = document.getElementById('btn-persistent-new-game');
        if (btnPersistentNew) {
            btnPersistentNew.addEventListener('click', () => {
                this.startNewGame();
            });
        }
    }

    startNewGame() {
        this.isGameOver = false;
        this.gameStarted = false;
        this.draftMode = false;
        this.notes = Array(9).fill().map(() => Array(9).fill().map(() => new Set()));
        this.updateDraftUI();

        // Hide persistent new game button
        const btnPersistentNew = document.getElementById('btn-persistent-new-game');
        if (btnPersistentNew) btnPersistentNew.classList.remove('visible');

        // 4 lives on hard, 3 otherwise
        this.lives = this.difficulty === 'hard' ? 4 : 3;
        const extraHeart = document.querySelector('.heart-extra');
        if (extraHeart) extraHeart.style.display = this.difficulty === 'hard' ? '' : 'none';
        this.updateLivesUI();
        this.timer = 0;
        this.updateTimer();
        this.stopTimer();

        this.generateBoard();
        this.renderBoard();
        this.updateNumpadStatus();
        this.selectedCell = null;

        // Sync floating draft button visibility with keyboard state
        const kw = document.getElementById('keyboard-wrapper');
        const fb = document.getElementById('btn-draft-mode-floating');
        if (fb && kw) {
            if (kw.classList.contains('hidden')) {
                fb.classList.remove('draft-btn-hidden');
            } else {
                fb.classList.add('draft-btn-hidden');
            }
        }
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
                cell.dataset.row = r;
                cell.dataset.col = c;

                if (this.initialBoard[r][c] !== 0) {
                    cell.classList.add('fixed');
                    cell.textContent = this.initialBoard[r][c];
                } else if (this.board[r][c] !== 0) {
                    cell.textContent = this.board[r][c];
                    cell.classList.add('user-value');
                    if (this.board[r][c] !== this.solution[r][c]) {
                        cell.classList.add('error');
                    }
                } else {
                    this._renderNotesInCell(cell, r, c);
                }
                
                cell.addEventListener('click', () => this.selectCell(r, c));
                container.appendChild(cell);
            }
        }
    }

    _renderNotesInCell(cell, r, c) {
        // Clear old notes
        const existing = cell.querySelector('.notes-grid');
        if (existing) existing.remove();

        const noteSet = this.notes[r][c];
        if (noteSet.size === 0) return;

        const grid = document.createElement('div');
        grid.className = 'notes-grid';
        for (let n = 1; n <= 9; n++) {
            const span = document.createElement('span');
            span.className = 'note-num';
            span.textContent = noteSet.has(n) ? n : '';
            grid.appendChild(span);
        }
        cell.appendChild(grid);
    }

    _updateCellDOM(r, c) {
        const cell = document.querySelector(`.sudoku-cell[data-row="${r}"][data-col="${c}"]`);
        if (!cell) return;
        // Clear content but keep classes
        cell.textContent = '';
        cell.innerHTML = '';
        cell.classList.remove('user-value', 'error');

        if (this.board[r][c] !== 0) {
            cell.textContent = this.board[r][c];
            cell.classList.add('user-value');
            if (this.board[r][c] !== this.solution[r][c]) {
                cell.classList.add('error');
            }
        } else {
            this._renderNotesInCell(cell, r, c);
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

    toggleDraftMode() {
        this.draftMode = !this.draftMode;
        this.updateDraftUI();
    }

    updateDraftUI() {
        const btn = document.getElementById('btn-draft-mode');
        const btnF = document.getElementById('btn-draft-mode-floating');
        const container = document.getElementById('sudoku-container');
        if (this.draftMode) {
            if (btn)  { btn.classList.add('draft-active');  btn.title  = 'Rascunho ATIVADO (N)'; }
            if (btnF) { btnF.classList.add('draft-active'); btnF.title = 'Rascunho ATIVADO (N)'; }
            if (container) container.classList.add('draft-mode-active');
        } else {
            if (btn)  { btn.classList.remove('draft-active');  btn.title  = 'Rascunho (N)'; }
            if (btnF) { btnF.classList.remove('draft-active'); btnF.title = 'Rascunho (N)'; }
            if (container) container.classList.remove('draft-mode-active');
        }
    }

    setCellValue(num) {
        if (!this.selectedCell || this.isGameOver) return;
        const { r, c } = this.selectedCell;
        
        if (this.initialBoard[r][c] !== 0) return;

        if (!this.gameStarted) {
            this.gameStarted = true;
            this.startTimer();
        }

        // --- DRAFT MODE ---
        if (this.draftMode && num !== 0) {
            // Only allow notes on empty cells
            if (this.board[r][c] !== 0) return;
            const noteSet = this.notes[r][c];
            if (noteSet.has(num)) {
                noteSet.delete(num);
            } else {
                noteSet.add(num);
            }
            this._updateCellDOM(r, c);
            this.updateHighlights();
            return;
        }

        // --- DEFINITIVE MODE ---
        // Erase
        if (num === 0) {
            this.board[r][c] = 0;
            this.notes[r][c].clear();
            this._updateCellDOM(r, c);
            this.updateHighlights();
            this.updateNumpadStatus();
            return;
        }

        this.board[r][c] = num;
        // Remove this number from notes in same row, col, box
        this._clearNoteFromPeers(r, c, num);
        // Also clear this cell's own notes
        this.notes[r][c].clear();
        
        this._updateCellDOM(r, c);
        
        if (num !== 0 && num !== this.solution[r][c]) {
            this.lives--;
            this.updateLivesUI();
            if (this.lives <= 0) {
                this.onLose();
            }
        }
        
        this.updateHighlights();
        this.updateNumpadStatus();
        this.checkWin();
    }

    _clearNoteFromPeers(r, c, num) {
        const boxR = Math.floor(r / 3) * 3;
        const boxC = Math.floor(c / 3) * 3;
        for (let i = 0; i < 9; i++) {
            // Row
            if (this.notes[r][i].has(num)) {
                this.notes[r][i].delete(num);
                if (this.board[r][i] === 0) this._updateCellDOM(r, i);
            }
            // Col
            if (this.notes[i][c].has(num)) {
                this.notes[i][c].delete(num);
                if (this.board[i][c] === 0) this._updateCellDOM(i, c);
            }
        }
        // Box
        for (let dr = 0; dr < 3; dr++) {
            for (let dc = 0; dc < 3; dc++) {
                const nr = boxR + dr, nc = boxC + dc;
                if (this.notes[nr][nc].has(num)) {
                    this.notes[nr][nc].delete(num);
                    if (this.board[nr][nc] === 0) this._updateCellDOM(nr, nc);
                }
            }
        }
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
            
            if (icon) icon.innerHTML = ''; // Remove icon
            title.textContent = 'VITÓRIA!';
            title.style.color = 'var(--success)';
            text.innerHTML = `Excelente! Você resolveu o Sudoku no modo <b>${this.difficulty.toUpperCase()}</b><br>Tempo final: <b>${this.formatTime(this.timer)}</b>`;
            
            modal.classList.add('active');

            // Show persistent new game button in header
            const btnPersistentNew = document.getElementById('btn-persistent-new-game');
            if (btnPersistentNew) btnPersistentNew.classList.add('visible');
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
            
            if (icon) icon.innerHTML = ''; // Remove icon
            title.textContent = 'GAME OVER';
            title.style.color = 'var(--error)';
            text.innerHTML = `Você cometeu muitos erros!<br>Nível: <b>${this.difficulty.toUpperCase()}</b>`;
            
            modal.classList.add('active');

            // Show persistent new game button in header
            const btnPersistentNew = document.getElementById('btn-persistent-new-game');
            if (btnPersistentNew) btnPersistentNew.classList.add('visible');
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
