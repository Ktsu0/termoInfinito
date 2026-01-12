import { WORDS } from "./palavras.js";
import { normalizeWord, StatsManager, generateShareText } from "./js/utils.js";
import { buildMultipleGridsDOM, buildKeyboardDOM } from "./js/components.js";

class TermoGame {
    constructor() {
        this.mode = parseInt(localStorage.getItem("termo_mode")) || 1; 
        this.rows = 6;
        this.cols = 5;
        this.currentRow = 0;
        this.currentCol = 0;
        
        this.targets = [];
        this.normalizedTargets = [];
        this.grids = []; 
        this.solvedBoards = []; 
        
        this.status = "playing";
        this.words = WORDS;
        this.acceptWords = new Set(this.words.map(w => normalizeWord(w)));
        this.stats = StatsManager.load();
        
        this.initDOM();
        this.newGame(this.mode); // Inicia com o modo salvo
        this.setupEventListeners();
    }

    initDOM() {
        this.containerEl = document.getElementById("boards-container");
        this.keyboardEl = document.getElementById("keyboard");
        this.toastEl = document.getElementById("toast");
        this.statsModal = document.getElementById("stats-modal");
        this.helpModal = document.getElementById("help-modal");
        
        if (!localStorage.getItem("termo_visited")) {
            this.showHelp();
            localStorage.setItem("termo_visited", "true");
        }
        
        buildKeyboardDOM(this.keyboardEl, (key) => this.handleInput(key));
    }

    newGame(mode) {
        this.mode = parseInt(mode);
        localStorage.setItem("termo_mode", this.mode); // Salva a preferência
        this.rows = this.mode === 1 ? 6 : (this.mode === 2 ? 7 : 9); 
        this.currentRow = 0;
        this.currentCol = 0;
        this.status = "playing";
        
        this.targets = [];
        this.normalizedTargets = [];
        this.solvedBoards = Array(this.mode).fill(false);
        this.grids = Array.from({ length: this.mode }, () => 
            Array.from({ length: this.rows }, () => Array(this.cols).fill(""))
        );

        // Pick unique random words
        const wordsCopy = [...this.words];
        for (let i = 0; i < this.mode; i++) {
            const idx = Math.floor(Math.random() * wordsCopy.length);
            const word = wordsCopy.splice(idx, 1)[0].toUpperCase();
            this.targets.push(word);
            this.normalizedTargets.push(normalizeWord(word));
        }

        buildMultipleGridsDOM(this.mode, this.rows, this.cols, this.containerEl, (b, r, c) => this.selectTile(b, r, c));
        
        this.updateRowVisuals();
        this.updateActiveTileVisual();
        this.updateModeButtons();
        console.log("Targets:", this.targets);
    }

    updateRowVisuals() {
        for (let b = 0; b < this.mode; b++) {
            const grid = document.getElementById(`grid-${b}`);
            if (!grid) continue;
            Array.from(grid.children).forEach((row, idx) => {
                row.classList.remove("current", "past");
                if (idx < this.currentRow) row.classList.add("past");
                else if (idx === this.currentRow) row.classList.add("current");
            });
        }
    }

    updateModeButtons() {
        document.querySelectorAll(".mode-selector button").forEach(btn => {
            btn.classList.toggle("active-mode", parseInt(btn.dataset.mode) === this.mode);
        });
    }

    selectTile(board, row, col) {
        if (this.status !== "playing" || row !== this.currentRow) return;
        this.currentCol = col;
        this.updateActiveTileVisual();
    }

    updateActiveTileVisual() {
        document.querySelectorAll(".tile").forEach(t => t.classList.remove("active"));
        for (let b = 0; b < this.mode; b++) {
            if (this.solvedBoards[b]) continue;
            const activeTile = document.getElementById(`tile-${b}-${this.currentRow}-${this.currentCol}`);
            if (activeTile) activeTile.classList.add("active");
        }
    }

    handleInput(key) {
        if (this.status !== "playing") return;

        const cmd = key.toUpperCase();
        if (cmd === "ENTER") this.submitGuess();
        else if (cmd === "BKSP" || cmd === "BACKSPACE") this.deleteLetter();
        else if (/^[A-ZÇ]$/u.test(key)) this.addLetter(key.toUpperCase());
    }

    addLetter(letter) {
        if (this.currentCol < this.cols) {
            for (let b = 0; b < this.mode; b++) {
                if (this.solvedBoards[b]) continue;
                this.grids[b][this.currentRow][this.currentCol] = letter;
                const tile = document.getElementById(`tile-${b}-${this.currentRow}-${this.currentCol}`);
                tile.textContent = letter;
                tile.setAttribute("data-state", "toggled");
            }
            
            if (this.currentCol < this.cols - 1) {
                this.currentCol++;
            }
            this.updateActiveTileVisual();
        }
    }

    deleteLetter() {
        const anyActiveGrid = this.grids.find((g, i) => !this.solvedBoards[i]);
        if (!anyActiveGrid) return;

        const currentTileContent = anyActiveGrid[this.currentRow][this.currentCol];
        
        if (currentTileContent === "" && this.currentCol > 0) {
            this.currentCol--;
        }
        
        for (let b = 0; b < this.mode; b++) {
            if (this.solvedBoards[b]) continue;
            this.grids[b][this.currentRow][this.currentCol] = "";
            const tile = document.getElementById(`tile-${b}-${this.currentRow}-${this.currentCol}`);
            tile.textContent = "";
            tile.removeAttribute("data-state");
        }
        this.updateActiveTileVisual();
    }

    submitGuess() {
        const isRowFull = this.grids.some((g, i) => !this.solvedBoards[i] && g[this.currentRow].every(l => l !== ""));
        
        if (!isRowFull) {
            this.showToast("Letras insuficientes");
            this.shakeRows();
            return;
        }

        // Use guess from first unsolved board (they are all the same)
        const firstUnsolvedIdx = this.solvedBoards.indexOf(false);
        const guess = this.grids[firstUnsolvedIdx][this.currentRow].join("");
        const normalizedGuess = normalizeWord(guess);

        if (!this.acceptWords.has(normalizedGuess)) {
            this.showToast("Palavra não reconhecida");
            this.shakeRows();
            return;
        }

        this.revealRows(guess, normalizedGuess);
    }

    revealRows(guess, normalizedGuess) {
        const row = this.currentRow;
        
        for (let b = 0; b < this.mode; b++) {
            if (this.solvedBoards[b]) continue;

            const result = this.calculateResult(normalizedGuess, this.normalizedTargets[b]);
            
            for (let i = 0; i < this.cols; i++) {
                const tile = document.getElementById(`tile-${b}-${row}-${i}`);
                setTimeout(() => {
                    tile.classList.add("flip");
                    setTimeout(() => {
                        tile.classList.add(result[i]);
                        this.updateKey(guess[i], result[i]);
                    }, 300);
                }, i * 150);
            }

            if (normalizedGuess === this.normalizedTargets[b]) {
                setTimeout(() => {
                    this.solvedBoards[b] = true;
                    document.getElementById(`grid-${b}`).classList.add("solved");
                }, this.cols * 150 + 400);
            }
        }

        this.currentRow++;
        this.currentCol = 0;
        this.updateRowVisuals();

        setTimeout(() => {
            const allSolved = this.solvedBoards.every(s => s);
            if (allSolved) this.endGame(true);
            else if (this.currentRow === this.rows) this.endGame(false);
            else this.updateActiveTileVisual();
        }, this.cols * 150 + 500);
    }

    calculateResult(guess, target) {
        const result = Array(this.cols).fill("absent");
        const targetArr = target.split("");
        const guessArr = guess.split("");

        for (let i = 0; i < this.cols; i++) {
            if (guessArr[i] === targetArr[i]) {
                result[i] = "correct";
                targetArr[i] = null;
                guessArr[i] = null;
            }
        }

        for (let i = 0; i < this.cols; i++) {
            if (guessArr[i] === null) continue;
            const index = targetArr.indexOf(guessArr[i]);
            if (index !== -1) {
                result[i] = "present";
                targetArr[index] = null;
            }
        }
        return result;
    }

    updateKey(letter, state) {
        const key = document.querySelector(`.key[data-key="${letter.toUpperCase()}"]`);
        if (!key) return;

        if (state === "correct") key.className = "key correct";
        else if (state === "present" && !key.classList.contains("correct")) key.className = "key present";
        else if (state === "absent" && !key.classList.contains("correct") && !key.classList.contains("present")) key.className = "key absent";
    }

    shakeRows() {
        for (let b = 0; b < this.mode; b++) {
            if (this.solvedBoards[b]) continue;
            const grid = document.getElementById(`grid-${b}`);
            const rowDom = grid.children[this.currentRow];
            rowDom.classList.add("shake");
            setTimeout(() => rowDom.classList.remove("shake"), 500);
        }
    }

    showToast(msg) {
        this.toastEl.textContent = msg;
        this.toastEl.classList.add("visible");
        setTimeout(() => this.toastEl.classList.remove("visible"), 2000);
    }

    endGame(win) {
        this.status = win ? "won" : "lost";
        const modeStats = this.stats[this.mode];
        modeStats.played++;
        
        if (win) {
            modeStats.wins++;
            modeStats.currentStreak++;
            modeStats.maxStreak = Math.max(modeStats.currentStreak, modeStats.maxStreak);
            modeStats.distribution[this.currentRow] = (modeStats.distribution[this.currentRow] || 0) + 1;
            this.showToast("Excelente!");
        } else {
            modeStats.currentStreak = 0;
            const reveal = this.targets.filter((t, i) => !this.solvedBoards[i]).join(", ");
            this.showToast(`As palavras eram: ${reveal}`);
        }
        StatsManager.save(this.stats);
        setTimeout(() => this.showStats(), 1500);
    }

    showStats() {
        const modeStats = this.stats[this.mode];
        const modeName = this.mode === 1 ? "Solo" : (this.mode === 2 ? "Duo" : "Quarteto");
        
        document.getElementById("stats-title").textContent = `Estatísticas - ${modeName}`;
        document.getElementById("stat-played").textContent = modeStats.played;
        document.getElementById("stat-wins").textContent = Math.round((modeStats.wins / modeStats.played || 0) * 100) + "%";
        document.getElementById("stat-streak").textContent = modeStats.currentStreak;
        document.getElementById("stat-max-streak").textContent = modeStats.maxStreak;
        this.statsModal.classList.add("active");
    }

    closeStats() { this.statsModal.classList.remove("active"); }
    showHelp() { 
        document.getElementById("help-attempts").textContent = this.rows;
        this.helpModal.classList.add("active"); 
    }
    closeHelp() { this.helpModal.classList.remove("active"); }

    setupEventListeners() {
        window.addEventListener("keydown", (e) => this.handleInput(e.key.toUpperCase()));
        document.getElementById("btn-close-stats").onclick = () => this.closeStats();
        document.getElementById("btn-close-help").onclick = () => this.closeHelp();
        document.getElementById("btn-help-trigger").onclick = () => this.showHelp();
        document.getElementById("btn-new-game").onclick = () => { this.closeStats(); this.newGame(this.mode); };
        document.getElementById("btn-stats-trigger").onclick = () => this.showStats();
        
        document.querySelectorAll(".mode-selector button").forEach(btn => {
            btn.onclick = () => this.newGame(btn.dataset.mode);
        });

        document.getElementById("btn-share").onclick = () => {
            const text = generateShareText(this.status, this.currentRow, this.cols, this.mode);
            if (navigator.share) navigator.share({ text });
            else navigator.clipboard.writeText(text).then(() => this.showToast("Copiado!"));
        };

        document.querySelectorAll(".modal-overlay").forEach(overlay => {
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    this.closeStats();
                    this.closeHelp();
                }
            };
        });
    }
}

document.addEventListener("DOMContentLoaded", () => new TermoGame());
