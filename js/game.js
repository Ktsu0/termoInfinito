import { WORDS } from "../js/palavras.js";
import { normalizeWord, StatsManager, generateShareText } from "../js/utils.js";
import { buildMultipleGridsDOM, buildKeyboardDOM } from "../js/components.js";

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
    this.stats = StatsManager.load();

    this.initDOM();
    this.newGame(this.mode);
    this.setupEventListeners();
  }

  initDOM() {
    this.containerEl = document.getElementById("boards-container");
    this.keyboardEl = document.getElementById("keyboard");
    this.toastEl = document.getElementById("toast");
    this.statsModal = document.getElementById("stats-modal");
    this.gameModal = document.getElementById("game-modal");
    this.helpModal = document.getElementById("help-modal");
    this.btnHeaderNew = document.getElementById("btn-persistent-new-game");

    if (!localStorage.getItem("termo_visited")) {
      this.showHelp();
      localStorage.setItem("termo_visited", "true");
    }

    buildKeyboardDOM(this.keyboardEl, (key) => this.handleInput(key));
  }

  newGame(mode) {
    this.gameId = Date.now();
    this.mode = parseInt(mode);
    localStorage.setItem("termo_mode", this.mode); // Salva a preferência
    this.rows = this.mode === 1 ? 6 : this.mode === 2 ? 7 : 9;
    this.currentRow = 0;
    this.currentCol = 0;
    this.status = "playing";
    if (this.btnHeaderNew) this.btnHeaderNew.classList.remove("visible");

    buildKeyboardDOM(this.keyboardEl, (key) => this.handleInput(key));

    this.targets = [];
    this.normalizedTargets = [];
    this.solvedBoards = Array(this.mode).fill(false);
    this.grids = Array.from({ length: this.mode }, () =>
      Array.from({ length: this.rows }, () => Array(this.cols).fill("")),
    );

    // Pick unique random words
    const wordsCopy = [...this.words];
    for (let i = 0; i < this.mode; i++) {
      const idx = Math.floor(Math.random() * wordsCopy.length);
      const word = wordsCopy.splice(idx, 1)[0].toUpperCase();
      this.targets.push(word);
      this.normalizedTargets.push(normalizeWord(word));
    }

    buildMultipleGridsDOM(
      this.mode,
      this.rows,
      this.cols,
      this.containerEl,
      (b, r, c) => this.selectTile(b, r, c),
    );

    this.resetKeyboardVisuals();
    this.updateRowVisuals();
    this.updateActiveTileVisual();
    this.updateModeButtons();
    // console.log("Targets:", this.targets); // Cheat disabled
  }

  resetKeyboardVisuals() {
    if (!this.keyboardEl) return;
    this.keyboardEl.querySelectorAll(".key").forEach((key) => {
      key.classList.remove("correct", "present", "absent");
      key.querySelectorAll(".indicator").forEach((ind) => {
        ind.className = "indicator";
      });
    });
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
    const modeLabel = document.getElementById("mode-current-label");
    if (modeLabel) {
      modeLabel.textContent = this.mode === 1 ? "SOLO" : this.mode === 2 ? "DUETO" : "QUARTETO";
    }

    if (this.keyboardEl) {
      this.keyboardEl.classList.remove("mode-1", "mode-2", "mode-4");
      this.keyboardEl.classList.add(`mode-${this.mode}`);
    }

    document.querySelectorAll(".diff-dropdown-item").forEach((btn) => {
      btn.classList.toggle(
        "active-mode",
        parseInt(btn.dataset.mode) === this.mode,
      );
    });
  }

  selectTile(board, row, col) {
    if (this.status !== "playing" || row !== this.currentRow) return;
    this.currentCol = col;
    this.updateActiveTileVisual();
  }

  updateActiveTileVisual() {
    document
      .querySelectorAll(".tile")
      .forEach((t) => t.classList.remove("active"));
    for (let b = 0; b < this.mode; b++) {
      if (this.solvedBoards[b]) continue;
      const activeTile = document.getElementById(
        `tile-${b}-${this.currentRow}-${this.currentCol}`,
      );
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
        const tile = document.getElementById(
          `tile-${b}-${this.currentRow}-${this.currentCol}`,
        );
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
      const tile = document.getElementById(
        `tile-${b}-${this.currentRow}-${this.currentCol}`,
      );
      tile.textContent = "";
      tile.removeAttribute("data-state");
    }
    this.updateActiveTileVisual();
  }

  async submitGuess() {
    const isRowFull = this.grids.some(
      (g, i) =>
        !this.solvedBoards[i] && g[this.currentRow].every((l) => l !== ""),
    );

    if (!isRowFull) {
      this.showToast("Letras insuficientes");
      this.shakeRows();
      return;
    }

    const firstUnsolvedIdx = this.solvedBoards.indexOf(false);
    if (firstUnsolvedIdx === -1) return;

    const guess = this.grids[firstUnsolvedIdx][this.currentRow].join("");
    const normalizedGuess = normalizeWord(guess);

    this.revealRows(guess, normalizedGuess);
  }

  revealRows(guess, normalizedGuess) {
    const row = this.currentRow;
    const currentGameId = this.gameId;

    for (let b = 0; b < this.mode; b++) {
      if (this.solvedBoards[b]) continue;

      const result = this.calculateResult(
        normalizedGuess,
        this.normalizedTargets[b],
      );

      for (let i = 0; i < this.cols; i++) {
        const tile = document.getElementById(`tile-${b}-${row}-${i}`);
        setTimeout(() => {
          if (this.gameId !== currentGameId) return;
          tile.classList.add("flip");
          setTimeout(() => {
            if (this.gameId !== currentGameId) return;
            tile.classList.add(result[i]);
            this.updateKey(guess[i], result[i], b);
          }, 300);
        }, i * 150);
      }

      if (normalizedGuess === this.normalizedTargets[b]) {
        setTimeout(
          () => {
            if (this.gameId !== currentGameId) return;
            this.solvedBoards[b] = true;
            const gridEl = document.getElementById(`grid-${b}`);
            if (gridEl) gridEl.classList.add("solved");
          },
          this.cols * 150 + 400,
        );
      }
    }

    this.currentRow++;
    this.currentCol = 0;
    this.updateRowVisuals();

    setTimeout(
      () => {
        if (this.gameId !== currentGameId) return;
        const allSolved = this.solvedBoards.every((s) => s);
        if (allSolved) this.endGame(true);
        else if (this.currentRow === this.rows) this.endGame(false);
        else this.updateActiveTileVisual();
      },
      this.cols * 150 + 500,
    );
  }

  calculateResult(guess, target) {
    const normalize = (str) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const targetArr = normalize(target).split("");
    const guessArr = normalize(guess).split("");
    const result = Array(guessArr.length).fill("absent");

    for (let i = 0; i < guessArr.length; i++) {
      if (guessArr[i] === targetArr[i]) {
        result[i] = "correct";
        targetArr[i] = null;
        guessArr[i] = null;
      }
    }

    for (let i = 0; i < guessArr.length; i++) {
      if (guessArr[i] === null) continue;

      const index = targetArr.indexOf(guessArr[i]);
      if (index !== -1) {
        result[i] = "present";
        targetArr[index] = null;
      }
    }

    return result;
  }

  updateKey(letter, state, boardIndex = 0) {
    const key = document.querySelector(
      `.key[data-key="${letter.toUpperCase()}"]`,
    );
    if (!key) return;

    // Solo mode: use direct key background
    if (this.mode === 1) {
      if (state === "correct") {
        key.classList.remove("present", "absent");
        key.classList.add("correct");
      } else if (state === "present" && !key.classList.contains("correct")) {
        key.classList.remove("absent");
        key.classList.add("present");
      } else if (
        state === "absent" &&
        !key.classList.contains("correct") &&
        !key.classList.contains("present")
      ) {
        key.classList.add("absent");
      }
      return;
    }

    // Duo/Quartet mode: use indicators
    const indicators = key.querySelectorAll(".indicator");
    if (indicators && indicators.length > 0) {
      if (indicators[boardIndex]) {
        const ind = indicators[boardIndex];
        
        // Upgrade logic for the specific quadrant
        if (state === "correct") {
          ind.className = "indicator active correct";
        } else if (state === "present" && !ind.classList.contains("correct")) {
          ind.className = "indicator active present";
        } else if (state === "absent" && !ind.classList.contains("correct") && !ind.classList.contains("present")) {
          ind.className = "indicator active absent";
        }
      }

      // Check if letter is absent in ALL active boards to dim the entire key
      const activeIndicators = Array.from(indicators).slice(0, this.mode);
      const isGloballyAbsent = activeIndicators.every(i => i.classList.contains('absent'));
      const hasAnyPositive = activeIndicators.some(i => i.classList.contains('correct') || i.classList.contains('present'));

      if (isGloballyAbsent && !hasAnyPositive) {
        key.classList.add("absent");
      } else {
        key.classList.remove("absent");
      }
    }
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
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastEl.textContent = msg;
    this.toastEl.classList.add("visible");
    this.toastTimeout = setTimeout(() => {
      this.toastEl.classList.remove("visible");
      this.toastTimeout = null;
    }, 2000);
  }

  endGame(win) {
    this.status = win ? "won" : "lost";
    const modeStats = this.stats[this.mode];
    modeStats.played++;

    if (win) {
      modeStats.wins++;
      modeStats.currentStreak++;
      modeStats.maxStreak = Math.max(
        modeStats.currentStreak,
        modeStats.maxStreak,
      );
      modeStats.distribution[this.currentRow] =
        (modeStats.distribution[this.currentRow] || 0) + 1;
      this.showToast("Excelente!");
    } else {
      modeStats.currentStreak = 0;
      const reveal = this.targets
        .filter((t, i) => !this.solvedBoards[i])
        .join(", ");
      this.showToast(`As palavras eram: ${reveal}`);
    }
    StatsManager.save(this.stats);
    if (this.btnHeaderNew) this.btnHeaderNew.classList.add("visible");
    setTimeout(() => this.showResult(win), 1500);
  }

  showResult(win) {
    const modeStats = this.stats[this.mode];
    const modal = this.gameModal;
    const modalContent = modal.querySelector(".modal");
    const title = document.getElementById("modal-title");
    const text = document.getElementById("modal-text");
    const details = document.getElementById("result-details");
    const icon = document.getElementById("result-icon");

    modalContent.classList.remove("win", "lose");
    modalContent.classList.add(win ? "win" : "lose");

    if (win) {
      title.textContent = "VITÓRIA!";
      icon.textContent = "🏆";
      text.textContent = `Você descobriu a palavra em ${this.currentRow} ${this.currentRow === 1 ? "tentativa" : "tentativas"}!`;
      details.style.display = "none";
    } else {
      title.textContent = "DERROTA";
      icon.textContent = "😔";
      text.textContent = "Não foi dessa vez. Continue praticando!";
      const reveal = this.targets
        .filter((t, i) => !this.solvedBoards[i])
        .join(", ");
      details.innerHTML = `As palavras eram: <span style="color: var(--primary)">${reveal}</span>`;
      details.style.display = "block";
    }

    document.getElementById("res-stat-played").textContent = modeStats.played;
    document.getElementById("res-stat-wins").textContent =
      Math.round((modeStats.wins / modeStats.played || 0) * 100) + "%";

    modal.classList.add("active");
  }

  showStats() {
    const modeStats = this.stats[this.mode];
    const modeName =
      this.mode === 1 ? "Solo" : this.mode === 2 ? "Duo" : "Quarteto";

    document.getElementById("stats-title").textContent =
      `Estatísticas - ${modeName}`;
    document.getElementById("stat-played").textContent = modeStats.played;
    document.getElementById("stat-wins").textContent =
      Math.round((modeStats.wins / modeStats.played || 0) * 100) + "%";
    document.getElementById("stat-streak").textContent =
      modeStats.currentStreak;
    document.getElementById("stat-max-streak").textContent =
      modeStats.maxStreak;
    this.statsModal.classList.add("active");
  }

  closeStats() {
    this.statsModal.classList.remove("active");
  }
  showHelp() {
    document.getElementById("help-attempts").textContent = this.rows;
    this.helpModal.classList.add("active");
  }
  closeHelp() {
    this.helpModal.classList.remove("active");
  }

  setupEventListeners() {
    window.addEventListener("keydown", (e) => {
      const key = e.key.toUpperCase();
      if (key === "ENTER" || key === "BACKSPACE" || /^[A-ZÇ]$/u.test(key)) {
        e.preventDefault();
        this.handleInput(key);
      }
    });
    document.getElementById("btn-close-stats").onclick = () =>
      this.closeStats();
    const closeX = document.getElementById("btn-close-stats-x");
    if (closeX) closeX.onclick = () => this.closeStats();

    document.getElementById("btn-close-help").onclick = () => this.closeHelp();
    document.getElementById("btn-help-trigger").onclick = () => this.showHelp();

    const startNewGame = () => {
      this.closeStats();
      if (this.gameModal) this.gameModal.classList.remove("active");
      this.newGame(this.mode);
    };

    const closeModal = () => {
      if (this.gameModal) this.gameModal.classList.remove("active");
    };

    document.getElementById("btn-close-modal-x").onclick = closeModal;
    document.getElementById("btn-new-game-modal").onclick = startNewGame;
    document.getElementById("btn-share-modal").onclick = () => {
      const text = generateShareText(
        this.status,
        this.currentRow,
        this.cols,
        this.mode,
      );
      if (navigator.share) navigator.share({ text });
      else
        navigator.clipboard
          .writeText(text)
          .then(() => this.showToast("Copiado!"));
    };

    document.getElementById("btn-new-game").onclick = startNewGame;
    if (this.btnHeaderNew) this.btnHeaderNew.onclick = startNewGame;

    document.getElementById("btn-stats-trigger").onclick = () =>
      this.showStats();

    // Mode Dropdown Toggle Logic
    const modeBtn = document.getElementById("mode-dropdown-btn");
    const modeMenu = document.getElementById("mode-dropdown-menu");
    if (modeBtn && modeMenu) {
      modeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        modeMenu.classList.toggle("show");
        modeBtn.classList.toggle("open");
      });
      document.addEventListener("click", (e) => {
        if (!modeBtn.contains(e.target) && !modeMenu.contains(e.target)) {
          modeMenu.classList.remove("show");
          modeBtn.classList.remove("open");
        }
      });
    }

    document.querySelectorAll(".diff-dropdown-item").forEach((btn) => {
      btn.onclick = () => {
        if (modeMenu) modeMenu.classList.remove("show");
        if (modeBtn) modeBtn.classList.remove("open");
        if (btn.dataset.mode) this.newGame(btn.dataset.mode);
      };
    });

    // Toggle Keyboard Logic
    const keyboardWrapper = document.getElementById("keyboard-wrapper");
    const btnFloatingKeyboard = document.getElementById("btn-floating-keyboard");
    const btnCloseKeyboard = document.getElementById("btn-close-keyboard");

    const toggleKeyboard = (e) => {
      if (e) e.target.blur();
      if (!keyboardWrapper || !btnFloatingKeyboard) return;
      const isHidden = keyboardWrapper.classList.contains("hidden");
      if (isHidden) {
        keyboardWrapper.classList.remove("hidden");
        btnFloatingKeyboard.classList.add("hidden");
      } else {
        keyboardWrapper.classList.add("hidden");
        btnFloatingKeyboard.classList.remove("hidden");
      }
    };

    if (btnFloatingKeyboard) btnFloatingKeyboard.onclick = toggleKeyboard;
    if (btnCloseKeyboard) btnCloseKeyboard.onclick = toggleKeyboard;

    document.getElementById("btn-share").onclick = () => {
      const text = generateShareText(
        this.status,
        this.currentRow,
        this.cols,
        this.mode,
      );
      if (navigator.share) navigator.share({ text });
      else
        navigator.clipboard
          .writeText(text)
          .then(() => this.showToast("Copiado!"));
    };

    document.querySelectorAll(".modal-overlay").forEach((overlay) => {
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
