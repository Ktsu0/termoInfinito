class CoresGame {
  constructor() {
    this.difficulty = "easy";
    this.tubes = []; // Array of arrays (bottom → top)
    this.selectedTube = null; // index of selected tube
    this.moves = 0;
    this.completedTubes = 0;

    // Timer (countdown)
    this.timeLeft = 0;
    this.timerInterval = null;
    this.gameStarted = false;
    this.isGameOver = false;

    // Config per difficulty
    this.config = {
      easy: { colors: 5, ballsPerTube: 4, time: 180 }, // 3:00
      medium: { colors: 7, ballsPerTube: 4, time: 210 }, // 3:30
      hard: { colors: 9, ballsPerTube: 4, time: 240 }, // 4:00
    };

    this.colorNames = [
      "red",
      "blue",
      "green",
      "yellow",
      "purple",
      "orange",
      "cyan",
      "pink",
      "lime",
    ];
    this.colorLabels = {
      red: "Vermelho",
      blue: "Azul",
      green: "Verde",
      yellow: "Amarelo",
      purple: "Roxo",
      orange: "Laranja",
      cyan: "Ciano",
      pink: "Rosa",
      lime: "Lima",
    };

    this.stats = this.loadStats();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.startNewGame();
  }

  setupEventListeners() {
    // Difficulty buttons
    document.querySelectorAll(".diff-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".diff-btn")
          .forEach((b) => b.classList.remove("active-mode"));
        btn.classList.add("active-mode");
        this.difficulty = btn.dataset.level;
        this.startNewGame();
      });
    });

    // New game button header
    const btnNew = document.getElementById("btn-persistent-new-game");
    if (btnNew) btnNew.addEventListener("click", () => this.startNewGame());

    // New game from modal
    const btnModalNew = document.getElementById("btn-new-game-modal");
    if (btnModalNew)
      btnModalNew.addEventListener("click", () => {
        document.getElementById("game-modal").classList.remove("active");
        this.startNewGame();
      });

    // Help
    const btnHelp = document.getElementById("btn-help-trigger");
    const helpModal = document.getElementById("help-modal");
    const btnCloseHelp = document.getElementById("btn-close-help");
    if (btnHelp)
      btnHelp.addEventListener("click", () =>
        helpModal.classList.add("active"),
      );
    if (btnCloseHelp)
      btnCloseHelp.addEventListener("click", () =>
        helpModal.classList.remove("active"),
      );
    if (helpModal)
      helpModal.addEventListener("click", (e) => {
        if (e.target === helpModal) helpModal.classList.remove("active");
      });

    // Stats
    const btnStats = document.getElementById("btn-stats-trigger");
    const statsModal = document.getElementById("stats-modal");
    const btnCloseStats = document.getElementById("btn-close-stats");
    const btnCloseStatsX = document.getElementById("btn-close-stats-x");
    if (btnStats)
      btnStats.addEventListener("click", () => {
        this.updateStatsUI();
        statsModal.classList.add("active");
      });
    if (btnCloseStats)
      btnCloseStats.addEventListener("click", () =>
        statsModal.classList.remove("active"),
      );
    if (btnCloseStatsX)
      btnCloseStatsX.addEventListener("click", () =>
        statsModal.classList.remove("active"),
      );
    if (statsModal)
      statsModal.addEventListener("click", (e) => {
        if (e.target === statsModal) statsModal.classList.remove("active");
      });

    // Close game modal X (if exists)
    const btnCloseModalX = document.getElementById("btn-close-modal-x");
    if (btnCloseModalX)
      btnCloseModalX.addEventListener("click", () => {
        document.getElementById("game-modal").classList.remove("active");
      });
  }

  // ─── GAME GENERATION ──────────────────────────────────────────────────────

  startNewGame() {
    this.stopTimer();
    this.isGameOver = false;
    this.gameStarted = false;
    this.selectedTube = null;
    this.moves = 0;
    this.completedTubes = 0;

    const cfg = this.config[this.difficulty];
    this.timeLeft = cfg.time;
    this.updateTimerDisplay();

    // Generate tubes
    this.generateTubes(cfg.colors, cfg.ballsPerTube);
    this.render();
    this.updateInfoRow();
    this.setHint("Selecione um tubo para começar");

    document.getElementById("game-modal").classList.remove("active");
  }

  generateTubes(numColors, ballsPerTube) {
    const colors = this.colorNames.slice(0, numColors);

    // Create flat pool of balls: each color appears ballsPerTube times
    let pool = [];
    colors.forEach((c) => {
      for (let i = 0; i < ballsPerTube; i++) pool.push(c);
    });

    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Distribute into tubes (bottom → top order)
    this.tubes = [];
    for (let t = 0; t < numColors; t++) {
      this.tubes.push(pool.slice(t * ballsPerTube, (t + 1) * ballsPerTube));
    }

    // Validate: ensure no tube starts already sorted (pure color) — reshuffle if needed
    // (simple check — if all tubes are already solved, regenerate)
    if (this.isSolved()) {
      this.generateTubes(numColors, ballsPerTube);
      return;
    }

    // Add empty tube(s) — one empty at the end
    this.tubes.push([]);
  }

  // ─── RENDERING ────────────────────────────────────────────────────────────

  render() {
    const container = document.getElementById("tubes-container");
    container.innerHTML = "";

    // Set layout class by difficulty
    container.className = `tubes-container tubes-${this.difficulty}`;

    const cfg = this.config[this.difficulty];
    const ballsPerTube = cfg.ballsPerTube;
    const numTubes = this.tubes.length;
    const isSmall = window.innerWidth < 480;

    // Configurando tamanho das bolas e tubos (com limites máximos para não ficarem gigantes)
    let ballSize;
    if (this.difficulty === "easy") {
      // 6 tubos na mesma linha
      ballSize = isSmall
        ? Math.min(34, Math.floor((window.innerWidth - 60) / numTubes - 8))
        : 46;
    } else if (this.difficulty === "medium") {
      // 4 tubos por linha
      ballSize = isSmall
        ? Math.min(36, Math.floor((window.innerWidth - 60) / 4 - 10))
        : 46;
    } else {
      // 5 tubos por linha
      ballSize = isSmall
        ? Math.min(32, Math.floor((window.innerWidth - 60) / 5 - 10))
        : 42;
    }

    const tubeWidth = ballSize + 8;
    const tubeHeight = ballsPerTube * (ballSize + 3) + 12;

    this.tubes.forEach((tube, index) => {
      const el = this.createTubeElement(
        tube,
        index,
        tubeWidth,
        tubeHeight,
        ballSize,
        ballsPerTube,
      );
      container.appendChild(el);
    });

    this.refreshSelectionUI();
  }

  createTubeElement(
    tube,
    index,
    tubeWidth,
    tubeHeight,
    ballSize,
    ballsPerTube,
  ) {
    const wrapper = document.createElement("div");
    wrapper.className = "tube";
    wrapper.dataset.index = index;

    // Cap
    const cap = document.createElement("div");
    cap.className = "tube-cap";
    cap.style.width = tubeWidth + 6 + "px";

    // Shell
    const shell = document.createElement("div");
    shell.className = "tube-shell";
    shell.style.width = tubeWidth + "px";
    shell.style.height = tubeHeight + "px";

    // Balls
    const ballsEl = document.createElement("div");
    ballsEl.className = "tube-balls";

    tube.forEach((color) => {
      const ball = document.createElement("div");
      ball.className = `ball ${color}`;
      ball.style.width = ballSize + "px";
      ball.style.height = ballSize + "px";
      ballsEl.appendChild(ball);
    });

    shell.appendChild(ballsEl);
    wrapper.appendChild(cap);
    wrapper.appendChild(shell);

    // Empty label
    if (tube.length === 0) {
      const lbl = document.createElement("div");
      lbl.className = "tube-label";
      lbl.textContent = "VAZIO";
      wrapper.insertBefore(lbl, cap);
    }

    // Check if tube is complete
    if (this.isTubeComplete(tube, ballsPerTube)) {
      wrapper.classList.add("complete");
    }

    wrapper.addEventListener("click", () => this.handleTubeClick(index));

    return wrapper;
  }

  refreshSelectionUI() {
    const cfg = this.config[this.difficulty];
    const ballsPerTube = cfg.ballsPerTube;

    document.querySelectorAll(".tube").forEach((el) => {
      const idx = parseInt(el.dataset.index);
      el.classList.remove("selected", "valid-target", "invalid-target");

      if (this.selectedTube === idx) {
        el.classList.add("selected");
      } else if (this.selectedTube !== null) {
        // Show if this is a valid target
        if (this.canMove(this.selectedTube, idx, ballsPerTube)) {
          el.classList.add("valid-target");
        }
      }
    });
  }

  // ─── GAME LOGIC ───────────────────────────────────────────────────────────

  handleTubeClick(index) {
    if (this.isGameOver) return;

    // Start timer on first interaction
    if (!this.gameStarted) {
      this.gameStarted = true;
      this.startTimer();
    }

    const cfg = this.config[this.difficulty];
    const ballsPerTube = cfg.ballsPerTube;

    if (this.selectedTube === null) {
      // Select tube
      if (this.tubes[index].length === 0) {
        this.setHint("Este tubo está vazio — selecione um com bolas!");
        this.shakeInvalid(index);
        return;
      }
      this.selectedTube = index;
      const topColor = this.tubes[index][this.tubes[index].length - 1];
      this.setHint(
        `"${this.colorLabels[topColor]}" selecionado — clique no destino`,
      );
      this.refreshSelectionUI();
    } else if (this.selectedTube === index) {
      // Deselect
      this.selectedTube = null;
      this.setHint("Selecione um tubo para começar");
      this.refreshSelectionUI();
    } else {
      // Try to move
      if (this.canMove(this.selectedTube, index, ballsPerTube)) {
        this.moveBall(this.selectedTube, index, ballsPerTube);
      } else {
        // Se não puder mover (ex: o tubo destino está cheio), em vez de dar erro, 
        // nós trocamos a seleção para o novo tubo (se ele tiver bolas).
        if (this.tubes[index].length > 0) {
          this.selectedTube = index;
          const topColor = this.tubes[index][this.tubes[index].length - 1];
          this.setHint(
            `"${this.colorLabels[topColor]}" selecionado — clique no destino`,
          );
          this.refreshSelectionUI();
        } else {
          this.shakeInvalid(index);
          this.setHint("Tubo cheio! Escolha outro tubo com espaço livre.");
        }
      }
    }
  }

  canMove(from, to, ballsPerTube) {
    if (this.tubes[from].length === 0) return false; // Nothing to move
    if (this.tubes[to].length >= ballsPerTube) return false; // Destination full
    return true; // Any tube with space is a valid target
  }

  moveBall(from, to, ballsPerTube) {
    const ball = this.tubes[from].pop();
    this.tubes[to].push(ball);
    this.moves++;
    this.selectedTube = null;

    // Re-render & animate
    this.render();
    this.animateDropOnTube(to);
    this.updateInfoRow();
    this.setHint("Selecione um tubo para continuar");

    // Check completions
    this.checkCompletions(ballsPerTube);
    this.checkWin();
  }

  animateDropOnTube(tubeIndex) {
    const tubeEl = document.querySelector(`.tube[data-index="${tubeIndex}"]`);
    if (!tubeEl) return;
    const balls = tubeEl.querySelectorAll(".ball");
    const topBall = balls[balls.length - 1];
    if (topBall) {
      topBall.classList.add("dropping");
      setTimeout(() => topBall.classList.remove("dropping"), 400);
    }
  }

  shakeInvalid(index) {
    const el = document.querySelector(`.tube[data-index="${index}"]`);
    if (!el) return;
    el.classList.add("invalid-target");
    setTimeout(() => el.classList.remove("invalid-target"), 400);
  }

  checkCompletions(ballsPerTube) {
    let count = 0;
    this.tubes.forEach((tube, idx) => {
      if (this.isTubeComplete(tube, ballsPerTube)) {
        count++;
        const el = document.querySelector(`.tube[data-index="${idx}"]`);
        if (el && !el.classList.contains("complete")) {
          el.classList.add("complete");
        }
      }
    });
    this.completedTubes = count;
  }

  isTubeComplete(tube, ballsPerTube) {
    if (tube.length !== ballsPerTube) return false;
    return tube.every((c) => c === tube[0]);
  }

  isSolved() {
    const cfg = this.config[this.difficulty];
    const ballsPerTube = cfg.ballsPerTube;
    // All non-empty tubes must be complete
    return this.tubes.every(
      (tube) => tube.length === 0 || this.isTubeComplete(tube, ballsPerTube),
    );
  }

  checkWin() {
    if (this.isSolved()) {
      this.onWin();
    }
  }

  // ─── UI HELPERS ───────────────────────────────────────────────────────────

  setHint(text) {
    const el = document.getElementById("cores-hint");
    if (el) el.textContent = text;
  }

  updateInfoRow() {
    const movesEl = document.getElementById("moves-count");
    const progEl = document.getElementById("progress-text");
    const cfg = this.config[this.difficulty];
    const numColors = cfg.colors;

    if (movesEl) movesEl.textContent = this.moves;
    if (progEl)
      progEl.textContent = `${this.completedTubes} / ${numColors} tubos prontos`;
  }

  // ─── TIMER ────────────────────────────────────────────────────────────────

  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateTimerDisplay();
      if (this.timeLeft <= 30) {
        document.getElementById("game-timer").classList.add("low-time");
      }
      if (this.timeLeft <= 0) {
        this.stopTimer();
        this.onLose();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (this.timeLeft % 60).toString().padStart(2, "0");
    const el = document.getElementById("game-timer");
    if (el) el.textContent = `${minutes}:${seconds}`;
  }

  formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  timeUsed() {
    return this.config[this.difficulty].time - this.timeLeft;
  }

  // ─── WIN / LOSE ───────────────────────────────────────────────────────────

  onWin() {
    this.isGameOver = true;
    this.stopTimer();
    this.saveStats(true);

    setTimeout(() => {
      const modal = document.getElementById("game-modal");
      const title = document.getElementById("modal-title");
      const text = document.getElementById("modal-text");
      const icon = document.getElementById("modal-icon");

      title.textContent = "VITÓRIA! 🎨";
      title.className = "modal-title-win";
      text.innerHTML = `Incrível! Você organizou todas as cores!<br>
                Nível: <b>${this.difficulty.toUpperCase()}</b> &nbsp;|&nbsp;
                Movimentos: <b>${this.moves}</b> &nbsp;|&nbsp;
                Tempo: <b>${this.formatTime(this.timeUsed())}</b>`;

      icon.innerHTML = `
                <div class="modal-icon" style="background: rgba(16, 185, 129, 0.1); border-color: var(--success);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                </div>`;

      modal.classList.add("active");
      this.createConfetti();
    }, 600);
  }

  onLose() {
    this.isGameOver = true;
    this.stopTimer();
    this.saveStats(false);

    setTimeout(() => {
      const modal = document.getElementById("game-modal");
      const title = document.getElementById("modal-title");
      const text = document.getElementById("modal-text");
      const icon = document.getElementById("modal-icon");

      title.textContent = "TEMPO ESGOTADO!";
      title.className = "modal-title-lose";
      text.innerHTML = `O tempo acabou antes de organizar todas as cores.<br>
                Nível: <b>${this.difficulty.toUpperCase()}</b> &nbsp;|&nbsp;
                Tubos prontos: <b>${this.completedTubes} / ${this.config[this.difficulty].colors}</b>`;

      icon.innerHTML = `
                <div class="modal-icon" style="background: rgba(244, 63, 94, 0.1); border-color: var(--error);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                </div>`;

      modal.classList.add("active");
    }, 500);
  }

  createConfetti() {
    const container = document.getElementById("confetti-container");
    if (!container) return;
    container.innerHTML = "";
    const colors = [
      "#ff6b6b",
      "#74b9ff",
      "#55efc4",
      "#ffeaa7",
      "#a29bfe",
      "#fdcb6e",
      "#81ecec",
      "#fd79a8",
      "#b8e994",
    ];
    for (let i = 0; i < 60; i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = Math.random() * 100 + "%";
      c.style.animationDelay = Math.random() * 3 + "s";
      c.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      c.style.width = Math.random() * 8 + 5 + "px";
      c.style.height = c.style.width;
      c.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      container.appendChild(c);
    }
  }

  // ─── STATS ────────────────────────────────────────────────────────────────

  loadStats() {
    try {
      return (
        JSON.parse(localStorage.getItem("cores_stats")) || {
          played: 0,
          wins: 0,
          streak: 0,
          maxStreak: 0,
        }
      );
    } catch {
      return { played: 0, wins: 0, streak: 0, maxStreak: 0 };
    }
  }

  saveStats(won) {
    this.stats.played++;
    if (won) {
      this.stats.wins++;
      this.stats.streak++;
      if (this.stats.streak > this.stats.maxStreak)
        this.stats.maxStreak = this.stats.streak;
    } else {
      this.stats.streak = 0;
    }
    localStorage.setItem("cores_stats", JSON.stringify(this.stats));
  }

  updateStatsUI() {
    const pct =
      this.stats.played > 0
        ? Math.round((this.stats.wins / this.stats.played) * 100)
        : 0;
    document.getElementById("stat-played").textContent = this.stats.played;
    document.getElementById("stat-wins").textContent = pct + "%";
    document.getElementById("stat-streak").textContent = this.stats.streak;
    document.getElementById("stat-max-streak").textContent =
      this.stats.maxStreak;
  }
}

// Boot
window.addEventListener("DOMContentLoaded", () => {
  window._coresGame = new CoresGame();
});
