/**
 * CAÇA PALAVRAS - Lógica Principal
 */

const THEMES = {
    pesca: ["ANZOL", "ISCA", "VARA", "BARCO", "REDE", "PEIXE", "LAGO", "CARRETILHA", "MOLINETE", "RIO", "MAR", "PESCADOR", "TILAPIA", "TUCUNARE"],
    escola: ["CADERNO", "LAPIS", "BORRACHA", "CANETA", "LIVRO", "MOCHILA", "QUADRO", "PROFESSOR", "ALUNO", "RECREIO", "PROVA", "REGUA", "DIRETORIA"],
    animes: ["NARUTO", "GOKU", "LUFFY", "SAKURA", "VEGETA", "SASUKE", "ICHIGO", "ZORO", "MIDORIYA", "TANJIRO", "SAITAMA", "LEVI", "EREN", "BULMA"],
    filmes: ["AVATAR", "TITANIC", "MATRIX", "VINGADORES", "BATMAN", "CORINGA", "SHREK", "ROCKY", "TUBARAO", "ALIEN", "JURASSIC", "FROZEN"],
    famosos: ["NEYMAR", "BEYONCE", "MADONNA", "MESSI", "ANITTA", "PELE", "ZENDAYA", "DRAKE", "RIHANNA", "SILVIO", "XUXA", "RONALDO"],
    times: ["FLAMENGO", "PALMEIRAS", "SANTOS", "SAOPAULO", "CORINTHIANS", "GREMIO", "INTER", "VASCO", "CRUZEIRO", "ATLETICO", "BOTAFOGO", "FLUMINENSE"],
    maquiagem: ["BATOM", "RIMEL", "BASE", "PO", "BLUSH", "DELINEADOR", "SOMBRA", "PINCEL", "ILUMINADOR", "CORRETIVO", "GLOSS", "CILIOS"],
    animais: ["CACHORRO", "GATO", "LEAO", "TIGRE", "GIRAFA", "MACACO", "ELEFANTE", "COBRA", "URSO", "CAVALO", "VACA", "PORCO", "PATO", "COELHO"],
    comidas: ["PIZZA", "HAMBURGUER", "COXINHA", "SUSHI", "PASTEL", "LASANHA", "CHURRASCO", "FEIJOADA", "BRIGADEIRO", "BOLO", "PUDIM", "MACARRAO"],
    tecnologia: ["COMPUTADOR", "CELULAR", "INTERNET", "PROGRAMADOR", "SOFTWARE", "HARDWARE", "TECLADO", "MOUSE", "MONITOR", "WIFI", "DADOS", "NUVEM"],
    ingles: ["APPLE", "HOUSE", "WATER", "MONEY", "TIME", "WORLD", "SCHOOL", "FAMILY", "NIGHT", "MORNING", "FRIEND", "LOVE", "HAPPY", "GARDEN"],
    estados: ["ACRE", "ALAGOAS", "AMAPA", "AMAZONAS", "BAHIA", "CEARA", "GOIAS", "MARANHAO", "PARAIBA", "PARANA", "PERNAMBUCO", "PIAUI", "RONDONIA", "RORAIMA", "SERGIPE", "TOCANTINS"]
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
                this.gridSize = 10;
                this.wordCount = 5;
                this.timeLimit = 180; // 3 min
                break;
            case "medium":
                this.gridSize = 14;
                this.wordCount = 8;
                this.timeLimit = 300; // 5 min
                break;
            case "hard":
                this.gridSize = 18;
                this.wordCount = 12;
                this.timeLimit = 480; // 8 min
                break;
        }
    }

    newGame() {
        this.isGameOver = false;
        this.wordsFound.clear();
        this.currentSelection = [];
        this.startCell = null;
        this.isDragging = false;
        
        clearInterval(this.timer);
        this.timeElapsed = 0;
        this.updateTimerDisplay();
        
        this.selectWords();
        this.generateGrid();
        this.renderBoard();
        this.renderWordsList();
        
        this.startTimer();
    }

    selectWords() {
        let themeKey = this.theme;
        if (themeKey === "random") {
            themeKey = THEME_KEYS[Math.floor(Math.random() * THEME_KEYS.length)];
        }
        
        let availableWords = [...THEMES[themeKey]];
        // Filter words that fit in the grid
        availableWords = availableWords.filter(w => w.length <= this.gridSize);
        
        // Shuffle
        availableWords.sort(() => Math.random() - 0.5);
        
        // Take N words
        this.wordsToFind = availableWords.slice(0, Math.min(this.wordCount, availableWords.length));
    }

    generateGrid() {
        // Initialize empty grid
        this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(''));
        
        const directions = [
            [0, 1],   // Right
            [0, -1],  // Left
            [1, 0],   // Down
            [-1, 0],  // Up
            [1, 1],   // Diagonal Down-Right
            [-1, -1], // Diagonal Up-Left
            [1, -1],  // Diagonal Down-Left
            [-1, 1]   // Diagonal Up-Right
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
                if (this.grid[r][c] === '') {
                    this.grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
                }
            }
        }
    }

    canPlaceWord(word, r, c, dr, dc) {
        if (r + dr * (word.length - 1) < 0 || r + dr * (word.length - 1) >= this.gridSize ||
            c + dc * (word.length - 1) < 0 || c + dc * (word.length - 1) >= this.gridSize) {
            return false;
        }

        for (let i = 0; i < word.length; i++) {
            const currentLetter = this.grid[r + dr * i][c + dc * i];
            if (currentLetter !== '' && currentLetter !== word[i]) {
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
        this.boardContainer.innerHTML = '';
        this.boardContainer.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        
        // Calculate cell size based on screen width
        const containerWidth = Math.min(window.innerWidth - 20, 800);
        const cellSize = Math.floor(containerWidth / this.gridSize) - 2; // -2 for gap
        
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                const cell = document.createElement("div");
                cell.className = "letter-cell";
                cell.textContent = this.grid[r][c];
                cell.dataset.r = r;
                cell.dataset.c = c;
                
                // Set max size to keep it square and neat
                cell.style.width = `${Math.min(cellSize, 45)}px`;
                cell.style.height = `${Math.min(cellSize, 45)}px`;
                cell.style.animationDelay = `${(r * this.gridSize + c) * 0.005}s`;
                
                this.boardContainer.appendChild(cell);
            }
        }
    }

    renderWordsList() {
        this.wordsListContainer.innerHTML = '';
        this.wordsToFind.forEach(word => {
            const el = document.createElement("div");
            el.className = `word-item ${this.wordsFound.has(word) ? 'found' : ''}`;
            el.textContent = word;
            el.dataset.word = word;
            this.wordsListContainer.appendChild(el);
        });
    }

    // --- Interaction Logic ---

    getCellFromEvent(e) {
        let target = e.target;
        if (e.type.includes('touch')) {
            const touch = e.touches[0] || e.changedTouches[0];
            target = document.elementFromPoint(touch.clientX, touch.clientY);
        }
        if (target && target.classList.contains('letter-cell')) {
            return {
                r: parseInt(target.dataset.r),
                c: parseInt(target.dataset.c)
            };
        }
        return null;
    }

    handleInputStart(e) {
        if (this.isGameOver) return;
        if (e.type !== 'touchstart' && e.button !== 0) return; // Only left click or touch

        const cell = this.getCellFromEvent(e);
        if (!cell) return;

        this.isDragging = true;
        this.startCell = cell;
        this.currentSelection = [cell];
        this.updateSelectionVisuals();
        
        if (e.type === 'touchstart') e.preventDefault(); // Prevent scrolling
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
        
        if (e.type === 'touchmove') e.preventDefault();
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
        const steps = Math.max(Math.abs(end.r - start.r), Math.abs(end.c - start.c));

        for (let i = 0; i <= steps; i++) {
            cells.push({
                r: start.r + dr * i,
                c: start.c + dc * i
            });
        }
        return cells;
    }

    updateSelectionVisuals() {
        // Clear all selected
        const allCells = this.boardContainer.querySelectorAll('.letter-cell');
        allCells.forEach(cell => cell.classList.remove('selected'));

        // Apply selected
        this.currentSelection.forEach(pos => {
            const index = pos.r * this.gridSize + pos.c;
            if (allCells[index]) {
                allCells[index].classList.add('selected');
            }
        });
    }

    checkSelection() {
        if (this.currentSelection.length < 2) return;

        // Extract word from cells
        let word = "";
        this.currentSelection.forEach(pos => {
            word += this.grid[pos.r][pos.c];
        });
        
        let reverseWord = word.split('').reverse().join('');

        let foundWord = null;
        if (this.wordsToFind.includes(word) && !this.wordsFound.has(word)) {
            foundWord = word;
        } else if (this.wordsToFind.includes(reverseWord) && !this.wordsFound.has(reverseWord)) {
            foundWord = reverseWord;
        }

        if (foundWord) {
            this.wordsFound.add(foundWord);
            
            // Mark cells as found
            const allCells = this.boardContainer.querySelectorAll('.letter-cell');
            this.currentSelection.forEach(pos => {
                const index = pos.r * this.gridSize + pos.c;
                if (allCells[index]) {
                    allCells[index].classList.add('found');
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
        this.timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
        icon.innerHTML = '<svg style="width: 3rem; height: 3rem; color: var(--success);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></path></svg>';
        this.createConfetti();
    }

    createConfetti() {
        const container = document.getElementById("confetti-container");
        if(!container) return;
        container.innerHTML = "";
        const colors = ["#10b981", "#3b82f6", "#f59e0b", "#f43f5e", "#6366f1"];
        for (let i = 0; i < 50; i++) {
            const div = document.createElement("div");
            div.className = "confetti";
            div.style.left = Math.random() * 100 + "vw";
            div.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            div.style.animationDelay = Math.random() * 4 + "s";
            div.style.width = Math.random() * 1 + 0.5 + "vw";
            div.style.height = div.style.width;
            container.appendChild(div);
        }
    }

    setupEventListeners() {
        // Difficulty
        document.querySelectorAll(".diff-btn").forEach((btn) => {
            btn.onclick = () => {
                document.querySelectorAll(".diff-btn").forEach((b) => b.classList.remove("active-mode"));
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
        this.boardContainer.addEventListener('mousedown', this.handleInputStart.bind(this), { passive: false });
        window.addEventListener('mousemove', this.handleInputMove.bind(this), { passive: false });
        window.addEventListener('mouseup', this.handleInputEnd.bind(this));

        this.boardContainer.addEventListener('touchstart', this.handleInputStart.bind(this), { passive: false });
        window.addEventListener('touchmove', this.handleInputMove.bind(this), { passive: false });
        window.addEventListener('touchend', this.handleInputEnd.bind(this));
        
        // Modals
        document.getElementById("btn-help-trigger").onclick = () => document.getElementById("help-modal").classList.add("active");
        
        const closeHelp = document.getElementById("btn-close-help");
        if(closeHelp) closeHelp.onclick = () => document.getElementById("help-modal").classList.remove("active");

        const closeGameX = document.getElementById("btn-close-modal-x");
        if(closeGameX) closeGameX.onclick = () => this.modal.classList.remove("active");
        
        // Overlays
        [this.modal, document.getElementById("help-modal")].forEach((m) => {
            if (!m) return;
            m.addEventListener('click', (e) => {
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
        window.addEventListener('resize', () => {
            if (!this.isGameOver) this.renderBoard();
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.game = new PalavrasGame();
});
