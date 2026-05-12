/**
 * CRACK THE CODE - Logic Refactor
 * Implements premium game mechanics, stats, and visual feedback
 */

const CodeStatsManager = {
  KEY: "crack_the_code_stats",

  load() {
    const stats = localStorage.getItem(this.KEY);
    const defaultStats = () => ({
      played: 0,
      wins: 0,
      currentStreak: 0,
      maxStreak: 0,
    });

    if (!stats) {
      return {
        easy: defaultStats(),
        medium: defaultStats(),
        hard: defaultStats(),
      };
    }
    return JSON.parse(stats);
  },

  save(allStats) {
    localStorage.setItem(this.KEY, JSON.stringify(allStats));
  },
};

class CrackTheCode {
  constructor() {
    this.difficulty = "easy";
    this.maxAttempts = 6;
    this.digitsCount = 4;
    this.secretCode = [];
    this.currentGuess = [];
    this.currentRow = 0;
    this.currentCol = 0;
    this.gameOver = false;
    this.stats = CodeStatsManager.load();

    this.grid = document.getElementById("grid");
    this.modal = document.getElementById("game-modal");
    this.helpModal = document.getElementById("help-modal");
    this.statsModal = document.getElementById("stats-modal");
    this.btnHeaderNew = document.getElementById("btn-persistent-new-game");

    this.init();
    this.setupEventListeners();
  }

  init() {
    this.difficulty =
      document.querySelector(".diff-btn.active-mode")?.id.split("-")[1] ||
      "easy";
    this.updateDifficultySettings();
    this.newGame();

    if (!localStorage.getItem("crack_visited")) {
      this.helpModal.classList.add("active");
      localStorage.setItem("crack_visited", "true");
    }
  }

  updateDifficultySettings() {
    if (this.difficulty === "easy") {
      this.maxAttempts = 6;
      this.digitsCount = 4;
    } else if (this.difficulty === "medium") {
      this.maxAttempts = 8;
      this.digitsCount = 5;
    } else if (this.difficulty === "hard") {
      this.maxAttempts = 6;
      this.digitsCount = 5;
    }
  }

  newGame() {
    this.secretCode = Array.from({ length: this.digitsCount }, () =>
      Math.floor(Math.random() * 10),
    );
    this.currentGuess = Array(this.digitsCount).fill(undefined);
    this.currentRow = 0;
    this.currentCol = 0;
    this.gameOver = false;
    if (this.btnHeaderNew) this.btnHeaderNew.classList.remove("visible");

    this.grid.style.setProperty("--rows", this.maxAttempts);
    this.createGrid();
    this.resetKeyboardVisuals();
    this.updateActiveTileVisual();

    // console.log("Secret:", this.secretCode.join('')); // For debugging
  }

  createGrid() {
    this.grid.innerHTML = "";
    for (let i = 0; i < this.maxAttempts; i++) {
      const row = document.createElement("div");
      row.className = "grid-row";
      row.style.gridTemplateColumns = `repeat(${this.digitsCount}, 1fr)`;
      if (i === 0) row.classList.add("current");

      for (let j = 0; j < this.digitsCount; j++) {
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.dataset.col = j;
        tile.onclick = () => {
          if (!this.gameOver && i === this.currentRow) {
            this.currentCol = j;
            this.updateActiveTileVisual();
          }
        };
        row.appendChild(tile);
      }
      this.grid.appendChild(row);
    }
  }

  updateActiveTileVisual() {
    const row = this.grid.children[this.currentRow];
    if (!row) return;
    Array.from(row.children).forEach((t) => t.classList.remove("active"));
    const activeTile = row.children[this.currentCol];
    if (activeTile) activeTile.classList.add("active");
  }

  resetKeyboardVisuals() {
    document.querySelectorAll(".key").forEach((k) => {
      k.classList.remove("correct", "present", "absent");
    });
  }

  handleNumber(num) {
    if (this.gameOver) return;

    if (this.currentCol < this.digitsCount) {
      this.currentGuess[this.currentCol] = parseInt(num);
      const tile =
        this.grid.children[this.currentRow].children[this.currentCol];
      tile.textContent = num;
      tile.setAttribute("data-state", "toggled");

      // Auto-advance logic
      if (
        this.currentGuess.filter((g) => g !== undefined).length <
        this.digitsCount
      ) {
        let foundEmpty = false;
        for (let i = this.currentCol + 1; i < this.digitsCount; i++) {
          if (this.currentGuess[i] === undefined) {
            this.currentCol = i;
            foundEmpty = true;
            break;
          }
        }
        if (!foundEmpty) {
          for (let i = 0; i < this.currentCol; i++) {
            if (this.currentGuess[i] === undefined) {
              this.currentCol = i;
              break;
            }
          }
        }
      } else {
        // Stay on last if full, but could also stay or move to first empty
      }
      this.updateActiveTileVisual();
    }
  }

  handleDelete() {
    if (this.gameOver) return;

    if (
      this.currentGuess[this.currentCol] === undefined &&
      this.currentCol > 0
    ) {
      this.currentCol--;
    }

    this.currentGuess[this.currentCol] = undefined;
    const tile = this.grid.children[this.currentRow].children[this.currentCol];
    tile.textContent = "";
    tile.removeAttribute("data-state");
    this.updateActiveTileVisual();
  }

  handleGuess() {
    if (this.gameOver) return;

    const isRowFull = this.currentGuess.every((g) => g !== undefined);
    if (!isRowFull) {
      this.shakeRow();
      return;
    }

    const feedback = this.getFeedback(
      [...this.currentGuess],
      [...this.secretCode],
    );
    this.revealResults(feedback);
  }

  getFeedback(guess, code) {
    const results = Array(this.digitsCount).fill("absent");
    const codeUsed = Array(this.digitsCount).fill(false);
    const guessUsed = Array(this.digitsCount).fill(false);

    // First pass: Perfect matches
    for (let i = 0; i < this.digitsCount; i++) {
      if (guess[i] === code[i]) {
        results[i] = "perfect";
        codeUsed[i] = true;
        guessUsed[i] = true;
      }
    }

    // Second pass: Numbers present but wrong position
    for (let i = 0; i < this.digitsCount; i++) {
      if (guessUsed[i]) continue;
      for (let j = 0; j < this.digitsCount; j++) {
        if (!codeUsed[j] && guess[i] === code[j]) {
          results[i] = "near";
          codeUsed[j] = true;
          break;
        }
      }
    }
    return results;
  }

  revealResults(feedback) {
    const row = this.grid.children[this.currentRow];
    const guess = [...this.currentGuess];

    for (let i = 0; i < this.digitsCount; i++) {
      const tile = row.children[i];
      tile.classList.remove("active");

      setTimeout(() => {
        tile.classList.add("flip");
        setTimeout(() => {
          const state =
            feedback[i] === "perfect"
              ? "correct"
              : feedback[i] === "near"
                ? "present"
                : "absent";
          tile.classList.add(state);
          this.updateKeyboardKey(guess[i], state);
        }, 250);
      }, i * 150);
    }

    const waitTime = this.digitsCount * 150 + 600;
    setTimeout(() => {
      if (feedback.every((f) => f === "perfect")) {
        this.endGame(true);
      } else if (this.currentRow === this.maxAttempts - 1) {
        this.endGame(false);
      } else {
        row.classList.remove("current");
        row.classList.add("past");
        this.currentRow++;
        this.currentCol = 0;
        this.currentGuess = Array(this.digitsCount).fill(undefined);
        this.grid.children[this.currentRow].classList.add("current");
        this.updateActiveTileVisual();
      }
    }, waitTime);
  }

  updateKeyboardKey(num, state) {
    const key = document.querySelector(`.key[data-key="${num}"]`);
    if (!key) return;

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
  }

  shakeRow() {
    const row = this.grid.children[this.currentRow];
    row.classList.add("shake");
    setTimeout(() => row.classList.remove("shake"), 500);
    this.showToast("Número incompleto");
  }

  showToast(msg) {
    const toastEl = document.getElementById("toast");
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("visible");
    setTimeout(() => toastEl.classList.remove("visible"), 2000);
  }

  endGame(win) {
    this.gameOver = true;
    const diffStats = this.stats[this.difficulty];
    diffStats.played++;

    if (win) {
      diffStats.wins++;
      diffStats.currentStreak++;
      diffStats.maxStreak = Math.max(
        diffStats.currentStreak,
        diffStats.maxStreak,
      );
      this.showToast("Excelente!");
      this.createConfetti();
    } else {
      diffStats.currentStreak = 0;
      this.showToast(`O código era: ${this.secretCode.join("")}`);
    }

    CodeStatsManager.save(this.stats);
    if (this.btnHeaderNew) this.btnHeaderNew.classList.add("visible");

    setTimeout(() => {
      this.showGameResultModal(win);
    }, 1500);
  }

  showGameResultModal(win) {
    const modal = this.modal;
    const modalContent = modal.querySelector(".modal");
    const title = document.getElementById("modal-title");
    const text = document.getElementById("modal-text");
    const icon = document.getElementById("result-icon");
    const details = document.getElementById("result-details");

    modalContent.classList.remove("win", "lose");
    modalContent.classList.add(win ? "win" : "lose");

    if (win) {
      title.textContent = "VITÓRIA!";
      icon.textContent = "🏆";
      text.textContent = "Excelente! Você decifrou a sequência secreta!";
      details.style.display = "none";
    } else {
      title.textContent = "DERROTA";
      icon.textContent = "😔";
      text.textContent = "A sequência foi bloqueada. Mais sorte na próxima vez.";
      details.style.display = "block";
      details.innerHTML = `O segredo era: <span style="letter-spacing: 0.5rem; font-weight: bold; color: var(--error);">${this.secretCode.join("")}</span>`;
    }

    document.getElementById("res-stat-tries").textContent = win ? this.currentRow + 1 : this.maxAttempts;
    document.getElementById("res-stat-streak").textContent = this.stats[this.difficulty].currentStreak;

    modal.classList.add("active");
  }

  showStats() {
    const diffStats = this.stats[this.difficulty];
    document.getElementById("stat-played").textContent = diffStats.played;
    document.getElementById("stat-wins").textContent =
      Math.round((diffStats.wins / diffStats.played || 0) * 100) + "%";
    document.getElementById("stat-streak").textContent =
      diffStats.currentStreak;
    document.getElementById("stat-max-streak").textContent =
      diffStats.maxStreak;
    this.statsModal.classList.add("active");
  }

  createConfetti() {
    const container = document.getElementById("confetti-container");
    container.innerHTML = "";
    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#f43f5e", "#6366f1"];
    for (let i = 0; i < 50; i++) {
      const div = document.createElement("div");
      div.className = "confetti";
      div.style.left = Math.random() * 100 + "vw";
      div.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      div.style.animationDelay = Math.random() * 4 + "s";
      div.style.width = Math.random() * 1 + 0.5 + "vw";
      div.style.height = div.style.width;
      container.appendChild(div);
    }
  }

  setupEventListeners() {
    // Keyboard Toggle
    const keyboardWrapper = document.getElementById("keyboard-wrapper");
    const btnFloatingKeyboard = document.getElementById("btn-floating-keyboard");
    const btnCloseKeyboard = document.getElementById("btn-close-keyboard");

    const toggleKeyboard = () => {
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

    // Difficulty buttons (uses dropdown from header)
    document.querySelectorAll(".diff-btn").forEach((btn) => {
      btn.onclick = () => {
        if (this.currentRow > 0 && !this.gameOver) {
          if (!confirm("Isso reiniciará o jogo atual. Continuar?")) return;
        }
        document
          .querySelectorAll(".diff-btn")
          .forEach((b) => b.classList.remove("active-mode"));
        btn.classList.add("active-mode");
        this.difficulty = btn.id.split("-")[1];
        this.updateDifficultySettings();
        this.newGame();
      };
    });

    // Modals
    document.getElementById("btn-help-trigger").onclick = () =>
      this.helpModal.classList.add("active");
    document.getElementById("btn-stats-trigger").onclick = () =>
      this.showStats();
    // Modal close buttons (X)
    const closeGameX = document.getElementById("btn-close-modal-x");
    if (closeGameX) closeGameX.onclick = () => this.modal.classList.remove("active");

    const closeStatsX = document.getElementById("btn-close-stats-x");
    if (closeStatsX) closeStatsX.onclick = () => this.statsModal.classList.remove("active");

    // Static close buttons inside modals
    document.getElementById("btn-close-help").onclick = () =>
      this.helpModal.classList.remove("active");
    document.getElementById("btn-close-stats").onclick = () =>
      this.statsModal.classList.remove("active");

    // Modal overlays (click outside to close)
    [this.modal, this.helpModal, this.statsModal].forEach((m) => {
      if (!m) return;
      m.onclick = (e) => {
        if (e.target === m) m.classList.remove("active");
      };
    });

    // Keyboard
    document.querySelectorAll(".key").forEach((btn) => {
      btn.onclick = (e) => {
        const key = e.currentTarget.getAttribute("data-key");
        if (key === "del") this.handleDelete();
        else if (key === "enter") this.handleGuess();
        else this.handleNumber(key);
      };
    });

    window.onkeydown = (e) => {
      if (e.key === "Backspace") this.handleDelete();
      else if (e.key === "Enter") this.handleGuess();
      else if (!isNaN(e.key) && e.key.trim() !== "") this.handleNumber(e.key);
    };

    const startNewGame = () => {
      this.modal.classList.remove("active");
      this.newGame();
    };

    document.getElementById("btn-new-mission").onclick = startNewGame;
    if (this.btnHeaderNew) this.btnHeaderNew.onclick = startNewGame;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.game = new CrackTheCode();
});
