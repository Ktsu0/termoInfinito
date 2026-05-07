/**
 * CAÇA PALAVRAS - Lógica Principal
 */

const THEMES = {
  pesca: [
    "ANZOL",
    "ISCA",
    "VARA",
    "BARCO",
    "REDE",
    "PEIXE",
    "LAGO",
    "CARRETILHA",
    "MOLINETE",
    "RIO",
    "MAR",
    "PESCADOR",
    "TILAPIA",
    "TUCUNARE",
  ],
  escola: [
    "CADERNO",
    "LAPIS",
    "BORRACHA",
    "CANETA",
    "LIVRO",
    "MOCHILA",
    "QUADRO",
    "PROFESSOR",
    "ALUNO",
    "RECREIO",
    "PROVA",
    "REGUA",
    "DIRETORIA",
  ],
  animes: [
    "NARUTO",
    "GOKU",
    "LUFFY",
    "SAKURA",
    "VEGETA",
    "SASUKE",
    "ICHIGO",
    "ZORO",
    "MIDORIYA",
    "TANJIRO",
    "SAITAMA",
    "LEVI",
    "EREN",
    "BULMA",
  ],
  filmes: [
    "AVATAR",
    "TITANIC",
    "MATRIX",
    "VINGADORES",
    "BATMAN",
    "CORINGA",
    "SHREK",
    "ROCKY",
    "TUBARAO",
    "ALIEN",
    "JURASSIC",
    "FROZEN",
  ],
  famosos: [
    "NEYMAR",
    "BEYONCE",
    "MADONNA",
    "MESSI",
    "ANITTA",
    "PELE",
    "ZENDAYA",
    "DRAKE",
    "RIHANNA",
    "SILVIO",
    "XUXA",
    "RONALDO",
  ],
  times: [
    "FLAMENGO",
    "PALMEIRAS",
    "SANTOS",
    "SAOPAULO",
    "CORINTHIANS",
    "GREMIO",
    "INTER",
    "VASCO",
    "CRUZEIRO",
    "ATLETICO",
    "BOTAFOGO",
    "FLUMINENSE",
  ],
  maquiagem: [
    "BATOM",
    "RIMEL",
    "BASE",
    "PO",
    "BLUSH",
    "DELINEADOR",
    "SOMBRA",
    "PINCEL",
    "ILUMINADOR",
    "CORRETIVO",
    "GLOSS",
    "CILIOS",
  ],
  animais: [
    "CACHORRO",
    "GATO",
    "LEAO",
    "TIGRE",
    "GIRAFA",
    "MACACO",
    "ELEFANTE",
    "COBRA",
    "URSO",
    "CAVALO",
    "VACA",
    "PORCO",
    "PATO",
    "COELHO",
  ],
  comidas: [
    "PIZZA",
    "HAMBURGUER",
    "COXINHA",
    "SUSHI",
    "PASTEL",
    "LASANHA",
    "CHURRASCO",
    "FEIJOADA",
    "BRIGADEIRO",
    "BOLO",
    "PUDIM",
    "MACARRAO",
  ],
  tecnologia: [
    "COMPUTADOR",
    "CELULAR",
    "INTERNET",
    "PROGRAMADOR",
    "SOFTWARE",
    "HARDWARE",
    "TECLADO",
    "MOUSE",
    "MONITOR",
    "WIFI",
    "DADOS",
    "NUVEM",
  ],
  ingles: [
    "APPLE",
    "HOUSE",
    "WATER",
    "MONEY",
    "TIME",
    "WORLD",
    "SCHOOL",
    "FAMILY",
    "NIGHT",
    "MORNING",
    "FRIEND",
    "LOVE",
    "HAPPY",
    "GARDEN",
  ],
  estados: [
    "ACRE",
    "ALAGOAS",
    "AMAPA",
    "AMAZONAS",
    "BAHIA",
    "CEARA",
    "GOIAS",
    "MARANHAO",
    "PARAIBA",
    "PARANA",
    "PERNAMBUCO",
    "PIAUI",
    "RONDONIA",
    "RORAIMA",
    "SERGIPE",
    "TOCANTINS",
  ],
};

// All available themes as an array of keys
const THEME_KEYS = Object.keys(THEMES);

class PalavrasGame {
  constructor() {
    this.difficulty = "easy";
    this.theme = "random";

    // Game settings based on difficulty
    this.gridSize = 10;
    this.wordCount = 5;
    this.timeLimit = 300; // 5 min

    // Game State
    this.grid = [];
    this.wordsToFind = [];
    this.wordsFound = new Set();
    this.timer = null;
    this.timeElapsed = 0;
    this.isGameOver = false;

    // Interaction state
    this.isDragging = false;
    this.startCell = null;
    this.currentSelection = [];
    this.timerStarted = false;
    this.foundWordPaths = []; // Armazena caminhos para redesenhar no resize

    // DOM Elements
    this.boardContainer = document.getElementById("board-container");
    this.wordsListContainer = document.getElementById("words-list");
    this.timerDisplay = document.getElementById("game-timer");
    this.themeSelect = document.getElementById("theme-select");
    this.modal = document.getElementById("game-modal");

    this.init();
    this.setupEventListeners();
  }

  init() {
    // Load settings
    const activeDiff = document.querySelector(".diff-btn.active-mode");
    if (activeDiff) {
      this.difficulty = activeDiff.id.split("-")[1];
    }

    this.theme = this.themeSelect.value;
    this.updateSettings();
    this.newGame();

    if (!localStorage.getItem("palavras_visited")) {
      document.getElementById("help-modal").classList.add("active");
      localStorage.setItem("palavras_visited", "true");
    }
  }

  updateSettings() {
    switch (this.difficulty) {
      case "easy":
        this.gridSize = 12;
        this.wordCount = 8;
        this.timeLimit = 240; // 4 min
        break;
      case "medium":
        this.gridSize = 16;
        this.wordCount = 12;
        this.timeLimit = 420; // 7 min
        break;
      case "hard":
        this.gridSize = 18;
        this.wordCount = 22;
        this.timeLimit = 600; // 10 min
        break;
    }
  }

  newGame() {
    this.isGameOver = false;
    this.wordsFound.clear();
    this.foundWordPaths = []; // Limpa caminhos antigos
    this.currentSelection = [];
    this.startCell = null;
    this.isDragging = false;
    this.timerStarted = false;

    clearInterval(this.timer);
    this.timeElapsed = 0;
    this.updateTimerDisplay();

    this.selectWords();
    this.generateGrid();
    this.renderBoard();
    this.renderWordsList();
  }

  selectWords() {
    let themeKey = this.theme;
    if (themeKey === "random") {
      themeKey = THEME_KEYS[Math.floor(Math.random() * THEME_KEYS.length)];
    }

    let availableWords = [...THEMES[themeKey]];
    // Filter words that fit in the grid
    availableWords = availableWords.filter((w) => w.length <= this.gridSize);

    // Shuffle
    availableWords.sort(() => Math.random() - 0.5);

    // Take N words
    this.wordsToFind = availableWords.slice(
      0,
      Math.min(this.wordCount, availableWords.length),
    );
  }

  generateGrid() {
    // Initialize empty grid
    this.grid = Array(this.gridSize)
      .fill(null)
      .map(() => Array(this.gridSize).fill(""));

    const directions = [
      [0, 1], // Right
      [0, -1], // Left
      [1, 0], // Down
      [-1, 0], // Up
      [1, 1], // Diagonal Down-Right
      [-1, -1], // Diagonal Up-Left
      [1, -1], // Diagonal Down-Left
      [-1, 1], // Diagonal Up-Right
    ];

    // Place each word
    for (let word of this.wordsToFind) {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const startRow = Math.floor(Math.random() * this.gridSize);
        const startCol = Math.floor(Math.random() * this.gridSize);

        if (this.canPlaceWord(word, startRow, startCol, dir[0], dir[1])) {
          this.placeWord(word, startRow, startCol, dir[0], dir[1]);
          placed = true;
        }
        attempts++;
      }

      if (!placed) {
        console.warn(`Could not place word: ${word}`);
      }
    }

    // Fill empty spaces with random letters
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        if (this.grid[r][c] === "") {
          this.grid[r][c] =
            alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }
  }

  canPlaceWord(word, r, c, dr, dc) {
    if (
      r + dr * (word.length - 1) < 0 ||
      r + dr * (word.length - 1) >= this.gridSize ||
      c + dc * (word.length - 1) < 0 ||
      c + dc * (word.length - 1) >= this.gridSize
    ) {
      return false;
    }

    for (let i = 0; i < word.length; i++) {
      const currentLetter = this.grid[r + dr * i][c + dc * i];
      if (currentLetter !== "" && currentLetter !== word[i]) {
        return false; // Conflict
      }
    }
    return true;
  }

  placeWord(word, r, c, dr, dc) {
    for (let i = 0; i < word.length; i++) {
      this.grid[r + dr * i][c + dc * i] = word[i];
    }
  }

  renderBoard() {
    this.boardContainer.innerHTML = "";
    this.boardContainer.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;

    // Calcula cellSize com base no espaço real disponível (vw/vh)
    const containerPadding = 40; // Valor aproximado para folga
    
    // Budget de largura: Em desktop temos a coluna central. Em mobile temos quase tudo.
    const isMobile = window.innerWidth <= 960;
    const widthBudget = isMobile ? (window.innerWidth * 0.9) : (window.innerWidth * 0.6);
    const availableW = widthBudget - containerPadding;

    // Budget de altura: Deixa espaço para o header (aprox 15-20%)
    const availableH = (window.innerHeight * 0.75) - containerPadding;

    // Gap sincronizado com o CSS: clamp(6px, 1.2vw, 12px)
    // Reduzimos o gap proporcionalmente se o grid for muito grande para não 'espremer' as letras
    let gapPx = Math.min(12, Math.max(6, Math.round(window.innerWidth * 0.012)));
    if (this.gridSize > 15) gapPx = Math.max(4, gapPx - 2); 
    
    const totalGap = (this.gridSize - 1) * gapPx;
    
    const cellFromWidth = (availableW - totalGap) / this.gridSize;
    const cellFromHeight = (availableH - totalGap) / this.gridSize;

    // Usa o menor dos dois e aplica limites
    let cellSize = Math.min(cellFromWidth, cellFromHeight);
    
    // Limite máximo para não ficar gigante em telas enormes
    const maxPossibleCell = isMobile ? 40 : 50;
    cellSize = Math.min(cellSize, maxPossibleCell);
    
    // Limite mínimo reduzido para caber grids 20x20 em telas menores
    cellSize = Math.max(cellSize, 14); 

    this.boardContainer.style.gap = gapPx + "px";

    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        const cell = document.createElement("div");
        cell.className = "letter-cell";
        cell.textContent = this.grid[r][c];
        cell.dataset.r = r;
        cell.dataset.c = c;

        cell.style.width = cellSize + "px";
        cell.style.height = cellSize + "px";
        cell.style.animationDelay = `${(r * this.gridSize + c) * 0.005}s`;

        this.boardContainer.appendChild(cell);
      }
    }

    // Cria ou limpa o container de highlights em SVG para os traços perfeitos
    let highlightsOverlay = this.boardContainer.querySelector('.highlights-overlay');
    if (!highlightsOverlay) {
        highlightsOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        highlightsOverlay.setAttribute('class', 'highlights-overlay');
        this.boardContainer.appendChild(highlightsOverlay);
    }
    highlightsOverlay.innerHTML = '';

    // Redesenha os highlights salvos
    this.foundWordPaths.forEach(path => {
        this.drawHighlight(path.start, path.end, path.colorIndex);
    });
  }

  drawHighlight(start, end, colorIndex) {
    const highlightsOverlay = this.boardContainer.querySelector('.highlights-overlay');
    if (!highlightsOverlay) return;

    const allCells = this.boardContainer.querySelectorAll('.letter-cell');
    const startIdx = start.r * this.gridSize + start.c;
    const endIdx = end.r * this.gridSize + end.c;
    
    const startEl = allCells[startIdx];
    const endEl = allCells[endIdx];
    
    if (!startEl || !endEl) return;

    // Posições relativas ao container usando BoundingClientRect
    const containerRect = this.boardContainer.getBoundingClientRect();
    const startRect = startEl.getBoundingClientRect();
    const endRect = endEl.getBoundingClientRect();

    const startX = (startRect.left - containerRect.left) + startRect.width / 2;
    const startY = (startRect.top - containerRect.top) + startRect.height / 2;
    const endX = (endRect.left - containerRect.left) + endRect.width / 2;
    const endY = (endRect.top - containerRect.top) + endRect.height / 2;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', startX);
    line.setAttribute('y1', startY);
    line.setAttribute('x2', endX);
    line.setAttribute('y2', endY);
    
    // Cores correspondentes às suas classes antigas
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const color = colors[colorIndex % colors.length];

    // Tamanho do marcador baseado no tamanho real da célula
    const strokeWidth = startRect.width * 0.9; 
    
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', strokeWidth);
    line.setAttribute('stroke-linecap', 'round');
    
    // Reaproveita a classe CSS original para a animação fade-in
    line.setAttribute('class', 'word-highlight');
    
    highlightsOverlay.appendChild(line);
  }

  renderWordsList() {
    this.wordsListContainer.innerHTML = "";

    // Sort words: Not found first, then found
    const sortedWords = [...this.wordsToFind].sort((a, b) => {
      const aFound = this.wordsFound.has(a);
      const bFound = this.wordsFound.has(b);
      if (aFound && !bFound) return 1;
      if (!aFound && bFound) return -1;
      return 0;
    });

    sortedWords.forEach((word) => {
      const el = document.createElement("div");
      el.className = `word-item ${this.wordsFound.has(word) ? "found" : ""}`;
      el.textContent = word;
      el.dataset.word = word;
      this.wordsListContainer.appendChild(el);
    });
  }

  // --- Interaction Logic ---

  getCellFromEvent(e) {
    let target = e.target;
    if (e.type.includes("touch")) {
      const touch = e.touches[0] || e.changedTouches[0];
      target = document.elementFromPoint(touch.clientX, touch.clientY);
    }
    if (target && target.classList.contains("letter-cell")) {
      return {
        r: parseInt(target.dataset.r),
        c: parseInt(target.dataset.c),
      };
    }
    return null;
  }

  handleInputStart(e) {
    if (this.isGameOver) return;
    if (e.type !== "touchstart" && e.button !== 0) return; // Only left click or touch

    const cell = this.getCellFromEvent(e);
    if (!cell) return;

    // Inicia o cronômetro na primeira ação
    if (!this.timerStarted) {
      this.timerStarted = true;
      this.startTimer();
    }

    this.isDragging = true;
    this.startCell = cell;
    this.currentSelection = [cell];
    this.updateSelectionVisuals();

    if (e.type === "touchstart") e.preventDefault(); // Prevent scrolling
  }

  handleInputMove(e) {
    if (!this.isDragging || this.isGameOver) return;

    const cell = this.getCellFromEvent(e);
    if (!cell) return;

    // Calculate straight line from startCell to current cell
    const dr = cell.r - this.startCell.r;
    const dc = cell.c - this.startCell.c;

    // Ensure it's a straight line (horizontal, vertical, or perfectly diagonal)
    if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
      this.currentSelection = this.getLineCells(this.startCell, cell);
      this.updateSelectionVisuals();
    }

    if (e.type === "touchmove") e.preventDefault();
  }

  handleInputEnd(e) {
    if (!this.isDragging || this.isGameOver) return;
    this.isDragging = false;

    this.checkSelection();
    this.currentSelection = [];
    this.updateSelectionVisuals();
  }

  getLineCells(start, end) {
    const cells = [];
    const dr = Math.sign(end.r - start.r);
    const dc = Math.sign(end.c - start.c);
    const steps = Math.max(
      Math.abs(end.r - start.r),
      Math.abs(end.c - start.c),
    );

    for (let i = 0; i <= steps; i++) {
      cells.push({
        r: start.r + dr * i,
        c: start.c + dc * i,
      });
    }
    return cells;
  }

  updateSelectionVisuals() {
    // Clear all selected
    const allCells = this.boardContainer.querySelectorAll(".letter-cell");
    allCells.forEach((cell) => cell.classList.remove("selected"));

    // Apply selected
    this.currentSelection.forEach((pos) => {
      const index = pos.r * this.gridSize + pos.c;
      if (allCells[index]) {
        allCells[index].classList.add("selected");
      }
    });

    // Atualiza a linha de drag (marca-texto provisório enquanto arrasta)
    const highlightsOverlay = this.boardContainer.querySelector('.highlights-overlay');
    if (highlightsOverlay) {
        const oldDragLine = highlightsOverlay.querySelector('.drag-line');
        if (oldDragLine) oldDragLine.remove();

        if (this.currentSelection.length >= 2) {
            const start = this.currentSelection[0];
            const end = this.currentSelection[this.currentSelection.length - 1];
            
            const startIdx = start.r * this.gridSize + start.c;
            const endIdx = end.r * this.gridSize + end.c;
            const startEl = allCells[startIdx];
            const endEl = allCells[endIdx];

            if (startEl && endEl) {
                const containerRect = this.boardContainer.getBoundingClientRect();
                const startRect = startEl.getBoundingClientRect();
                const endRect = endEl.getBoundingClientRect();

                const startX = (startRect.left - containerRect.left) + startRect.width / 2;
                const startY = (startRect.top - containerRect.top) + startRect.height / 2;
                const endX = (endRect.left - containerRect.left) + endRect.width / 2;
                const endY = (endRect.top - containerRect.top) + endRect.height / 2;

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', startX);
                line.setAttribute('y1', startY);
                line.setAttribute('x2', endX);
                line.setAttribute('y2', endY);
                
                // Usa a cor primária (roxo/azul) para a seleção com transparência
                line.setAttribute('stroke', 'var(--primary)');
                line.setAttribute('stroke-width', startRect.width * 0.9);
                line.setAttribute('stroke-linecap', 'round');
                line.setAttribute('opacity', '0.4');
                line.setAttribute('class', 'drag-line');
                
                highlightsOverlay.appendChild(line);
            }
        }
    }
  }

  checkSelection() {
    if (this.currentSelection.length < 2) return;

    // Extract word from cells
    let word = "";
    this.currentSelection.forEach((pos) => {
      word += this.grid[pos.r][pos.c];
    });

    let reverseWord = word.split("").reverse().join("");

    let foundWord = null;
    if (this.wordsToFind.includes(word) && !this.wordsFound.has(word)) {
      foundWord = word;
    } else if (
      this.wordsToFind.includes(reverseWord) &&
      !this.wordsFound.has(reverseWord)
    ) {
      foundWord = reverseWord;
    }

    if (foundWord) {
      this.wordsFound.add(foundWord);

      // Define color index (0 to 5)
      const colorIndex = (this.wordsFound.size - 1) % 6;
      
      // Salva o caminho para redesenhar se a janela mudar de tamanho
      const path = { 
          start: this.currentSelection[0], 
          end: this.currentSelection[this.currentSelection.length - 1], 
          colorIndex 
      };
      this.foundWordPaths.push(path);

      // Desenha o highlight contínuo (estilo caneta marca-texto)
      this.drawHighlight(path.start, path.end, path.colorIndex);

      // Mark cells as found (apenas para lógica interna e cor do texto se quiser)
      const allCells = this.boardContainer.querySelectorAll('.letter-cell');
      this.currentSelection.forEach((pos) => {
        const cellIndex = pos.r * this.gridSize + pos.c;
        const cell = allCells[cellIndex];
        if (cell) {
          cell.classList.add('found');
        }
      });

      this.renderWordsList();
      this.showToast(`Encontrou: ${foundWord}!`);

      if (this.wordsFound.size === this.wordsToFind.length) {
        this.endGame(true);
      }
    }
  }

  // --- Timer and End Game ---

  startTimer() {
    this.updateTimerDisplay();
    this.timer = setInterval(() => {
      this.timeElapsed++;
      this.updateTimerDisplay();
    }, 1000);
  }

  updateTimerDisplay() {
    const mins = Math.floor(this.timeElapsed / 60);
    const secs = this.timeElapsed % 60;
    this.timerDisplay.textContent = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  showToast(msg) {
    const toastEl = document.getElementById("toast");
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("visible");
    setTimeout(() => toastEl.classList.remove("visible"), 2000);
  }

  endGame(win) {
    this.isGameOver = true;
    clearInterval(this.timer);

    setTimeout(() => {
      this.showGameResultModal(win);
    }, 1000);
  }

  showGameResultModal(win) {
    const title = document.getElementById("modal-title");
    const text = document.getElementById("modal-text");
    const icon = document.getElementById("modal-icon");

    this.modal.classList.add("active");

    // No caça palavras agora só há vitória (não há mais limite de tempo)
    title.textContent = "VITÓRIA";
    title.style.color = "var(--success)";
    text.textContent = `Você encontrou todas as palavras em ${Math.floor(this.timeElapsed / 60)}m ${this.timeElapsed % 60}s!`;
    if (icon) icon.innerHTML = "";
  }

  setupEventListeners() {
    // Difficulty
    document.querySelectorAll(".diff-btn").forEach((btn) => {
      btn.onclick = () => {
        document
          .querySelectorAll(".diff-btn")
          .forEach((b) => b.classList.remove("active-mode"));
        btn.classList.add("active-mode");
        this.difficulty = btn.id.split("-")[1];
        this.updateSettings();
        this.newGame();
      };
    });

    // Theme
    this.themeSelect.addEventListener("change", () => {
      this.theme = this.themeSelect.value;
      this.newGame();
    });

    // Mouse and Touch Events on Board
    this.boardContainer.addEventListener(
      "mousedown",
      this.handleInputStart.bind(this),
      { passive: false },
    );
    window.addEventListener("mousemove", this.handleInputMove.bind(this), {
      passive: false,
    });
    window.addEventListener("mouseup", this.handleInputEnd.bind(this));

    this.boardContainer.addEventListener(
      "touchstart",
      this.handleInputStart.bind(this),
      { passive: false },
    );
    window.addEventListener("touchmove", this.handleInputMove.bind(this), {
      passive: false,
    });
    window.addEventListener("touchend", this.handleInputEnd.bind(this));

    // Modals
    document.getElementById("btn-help-trigger").onclick = () =>
      document.getElementById("help-modal").classList.add("active");

    const closeHelp = document.getElementById("btn-close-help");
    if (closeHelp)
      closeHelp.onclick = () =>
        document.getElementById("help-modal").classList.remove("active");

    const closeGameX = document.getElementById("btn-close-modal-x");
    if (closeGameX)
      closeGameX.onclick = () => this.modal.classList.remove("active");

    // Overlays
    [this.modal, document.getElementById("help-modal")].forEach((m) => {
      if (!m) return;
      m.addEventListener("click", (e) => {
        if (e.target === m) m.classList.remove("active");
      });
    });

    // New game
    const btnHeaderNew = document.getElementById("btn-persistent-new-game");
    const btnModalNew = document.getElementById("btn-new-game-modal");

    const restart = () => {
      this.modal.classList.remove("active");
      this.newGame();
    };

    if (btnHeaderNew) btnHeaderNew.onclick = restart;
    if (btnModalNew) btnModalNew.onclick = restart;

    // Window resize
    window.addEventListener("resize", () => {
      if (!this.isGameOver) this.renderBoard();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.game = new PalavrasGame();
});
