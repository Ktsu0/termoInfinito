/**
 * CRUZADINHA - Lógica Principal
 */

class CruzadinhaGame {
    constructor() {
        this.theme = "random";
        this.difficulty = "easy";
        this.grid = [];
        this.gridSize = 12;
        this.maxWords = 8;
        this.placedWords = [];
        
        // State
        this.timer = null;
        this.timeElapsed = 0;
        this.isGameOver = false;
        this.focusedCell = null;
        this.focusDirection = "H";
        this.timerStarted = false;
        
        // DOM Elements
        this.boardContainer = document.getElementById("board-container");
        this.themeSelect = document.getElementById("theme-select");
        this.timerDisplay = document.getElementById("game-timer");
        this.cluesHorizontal = document.getElementById("clues-horizontal");
        this.cluesVertical = document.getElementById("clues-vertical");
        this.modal = document.getElementById("game-modal");
        
        this.init();
        this.setupEventListeners();
    }

    init() {
        this.theme = this.themeSelect.value;
        this.updateSettings();
        this.newGame();
        
        if (!localStorage.getItem("cruzadinha_visited")) {
            document.getElementById("help-modal").classList.add("active");
            localStorage.setItem("cruzadinha_visited", "true");
        }
    }

    updateSettings() {
        const activeDiff = document.querySelector(".diff-btn.active-mode");
        if (activeDiff) {
            this.difficulty = activeDiff.dataset.level;
        }

        switch (this.difficulty) {
            case "easy":
                this.gridSize = 10;
                this.maxWords = 8;
                break;
            case "medium":
                this.gridSize = 15;
                this.maxWords = 14;
                break;
            case "hard":
                this.gridSize = 20;
                this.maxWords = 20;
                break;
            default:
                this.gridSize = 12;
                this.maxWords = 10;
        }
    }

    newGame() {
        this.isGameOver = false;
        this.placedWords = [];
        this.focusedCell = null;
        this.focusDirection = "H";
        this.timerStarted = false;
        
        // Esconde o botão de novo jogo do header até o fim
        const headerNewBtn = document.getElementById("btn-persistent-new-game");
        if (headerNewBtn) headerNewBtn.classList.remove("visible");

        clearInterval(this.timer);
        this.timeElapsed = 0;
        this.updateTimerDisplay();
        
        this.generateBestCrossword();
        this.renderBoard();
        this.renderClues();
    }

    // Tenta gerar várias vezes e escolhe a que colocar mais palavras
    generateBestCrossword() {
        let bestGrid = null;
        let bestWords = [];
        let maxPlaced = -1;

        // Tenta 15 vezes para encontrar um layout denso
        for (let i = 0; i < 15; i++) {
            this.grid = Array(this.gridSize).fill(null).map(() => 
                Array(this.gridSize).fill(null).map(() => ({ char: '', wordIndices: [] }))
            );
            this.placedWords = [];
            this.generateSingleCrossword();
            
            if (this.placedWords.length > maxPlaced) {
                maxPlaced = this.placedWords.length;
                bestGrid = JSON.parse(JSON.stringify(this.grid));
                bestWords = [...this.placedWords];
            }
            if (maxPlaced >= this.maxWords) break;
        }

        if (bestGrid) {
            this.grid = bestGrid;
            this.placedWords = bestWords;
        }
        this.assignClueNumbers();
    }

    generateSingleCrossword() {
        let themeKey = this.theme;
        let words = [];

        if (themeKey === "all") {
            // Combina todas as palavras de todos os temas
            Object.values(CROSSWORD_THEMES).forEach(themeWords => {
                words = words.concat(themeWords);
            });
        } else {
            if (themeKey === "random") {
                const keys = Object.keys(CROSSWORD_THEMES);
                themeKey = keys[Math.floor(Math.random() * keys.length)];
            }
            words = [...CROSSWORD_THEMES[themeKey]];
        }
        
        words.sort(() => Math.random() - 0.5);
        
        // Pega as primeiras X palavras do tema embaralhado
        const wordsToTry = words.slice(0, this.maxWords);

        // 1. Coloca a primeira palavra no centro
        const first = wordsToTry.shift();
        const startR = Math.floor(this.gridSize / 2);
        const startC = Math.max(0, Math.floor((this.gridSize - first.word.length) / 2));
        this.placeWord(first, startR, startC, "H");

        // 2. Tenta colocar as outras
        let attempts = 0;
        while (wordsToTry.length > 0 && attempts < 50) {
            const wordObj = wordsToTry.shift();
            if (!this.tryPlaceWord(wordObj)) {
                wordsToTry.push(wordObj);
            }
            attempts++;
        }
    }

    tryPlaceWord(wordObj) {
        const word = wordObj.word;
        // Tenta encontrar uma letra comum no grid
        const possibleIntersections = [];
        
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                const charInGrid = this.grid[r][c].char;
                if (charInGrid !== '') {
                    const charIdxInWord = word.indexOf(charInGrid);
                    if (charIdxInWord !== -1) {
                        // Tenta todas as ocorrências da letra na palavra
                        let lastIdx = -1;
                        while ((lastIdx = word.indexOf(charInGrid, lastIdx + 1)) !== -1) {
                            possibleIntersections.push({ r, c, charIdx: lastIdx });
                        }
                    }
                }
            }
        }

        // Embaralha as interseções possíveis para variação
        possibleIntersections.sort(() => Math.random() - 0.5);

        for (let intersect of possibleIntersections) {
            // Se a letra no grid veio de uma palavra Horizontal, tentamos colocar a nova Verticalmente
            // e vice-versa.
            const existingCell = this.grid[intersect.r][intersect.c];
            const existingDir = existingCell.dir || (existingCell.wordIndices.length > 0 ? this.placedWords[existingCell.wordIndices[0]].dir : "H");
            const newDir = existingDir === "H" ? "V" : "H";
            
            const newR = newDir === "V" ? intersect.r - intersect.charIdx : intersect.r;
            const newC = newDir === "H" ? intersect.c - intersect.charIdx : intersect.c;

            if (this.canPlaceWord(word, newR, newC, newDir)) {
                this.placeWord(wordObj, newR, newC, newDir);
                return true;
            }
            
            // Tenta a outra direção também, por precaução
            const altDir = newDir === "H" ? "V" : "H";
            const altR = altDir === "V" ? intersect.r - intersect.charIdx : intersect.r;
            const altC = altDir === "H" ? intersect.c - intersect.charIdx : intersect.c;
            if (this.canPlaceWord(word, altR, altC, altDir)) {
                this.placeWord(wordObj, altR, altC, altDir);
                return true;
            }
        }
        return false;
    }

    canPlaceWord(word, r, c, dir) {
        if (r < 0 || c < 0) return false;
        if (dir === "H" && c + word.length > this.gridSize) return false;
        if (dir === "V" && r + word.length > this.gridSize) return false;

        // Regras:
        // 1. Não pode colidir com letras diferentes
        // 2. Precisa ter espaço vazio antes e depois (ou borda)
        // 3. Não pode ter letras adjacentes paralelas (exceto nas interseções)

        for (let i = 0; i < word.length; i++) {
            const curR = dir === "V" ? r + i : r;
            const curC = dir === "H" ? c + i : c;
            const existing = this.grid[curR][curC];

            if (existing.char !== '' && existing.char !== word[i]) return false;

            // Checa adjacências laterais
            if (existing.char === '') {
                if (dir === "H") {
                    if (curR > 0 && this.grid[curR-1][curC].char !== '') return false;
                    if (curR < this.gridSize-1 && this.grid[curR+1][curC].char !== '') return false;
                } else {
                    if (curC > 0 && this.grid[curR][curC-1].char !== '') return false;
                    if (curC < this.gridSize-1 && this.grid[curR][curC+1].char !== '') return false;
                }
            }
        }

        // Checa extremidades
        if (dir === "H") {
            if (c > 0 && this.grid[r][c-1].char !== '') return false;
            if (c + word.length < this.gridSize && this.grid[r][c + word.length].char !== '') return false;
        } else {
            if (r > 0 && this.grid[r-1][c].char !== '') return false;
            if (r + word.length < this.gridSize && this.grid[r + word.length][c].char !== '') return false;
        }

        return true;
    }

    placeWord(wordObj, r, c, dir) {
        const word = wordObj.word;
        const index = this.placedWords.length;
        
        for (let i = 0; i < word.length; i++) {
            const curR = dir === "V" ? r + i : r;
            const curC = dir === "H" ? c + i : c;
            
            // Safety check
            if (!this.grid[curR] || !this.grid[curR][curC]) continue;

            const currentCell = this.grid[curR][curC];
            this.grid[curR][curC] = {
                char: word[i],
                dir: dir,
                wordIndices: [...(currentCell.wordIndices || []), index]
            };
        }

        this.placedWords.push({
            ...wordObj,
            r, c, dir,
            number: 0 // preenchido depois
        });
    }

    assignClueNumbers() {
        let count = 1;
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                const wordsAtCell = this.placedWords.filter(w => w.r === r && w.c === c);
                // Se houver mais de uma palavra começando aqui, cada uma ganha seu próprio número
                wordsAtCell.forEach(w => {
                    w.number = count;
                    count++;
                });
            }
        }
    }

    // --- Renderização ---

    renderBoard() {
        if (!this.boardContainer) return;
        this.boardContainer.innerHTML = '';
        this.boardContainer.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        
        // --- Cálculo de Escalonamento Dinâmico Robusto ---
        const headerHeight = 120; 
        const sidebarWidth = window.innerWidth > 1040 ? 350 : 0; 
        const padding = 40;
        
        const availableW = window.innerWidth - sidebarWidth - padding;
        const availableH = window.innerHeight - headerHeight - padding;
        
        // Espaço ideal por célula (tirando o gap da conta)
        const gapSize = 2;
        const totalGap = (this.gridSize - 1) * gapSize;
        
        const sizeW = Math.floor((availableW - totalGap) / this.gridSize);
        const sizeH = Math.floor((availableH - totalGap) / this.gridSize);
        
        let cellSize = Math.min(sizeW, sizeH);
        
        // Limites para manter a beleza e usabilidade
        // Aumentamos o mínimo para 32px para não ficar "ridículo" de pequeno
        cellSize = Math.max(32, Math.min(48, cellSize));

        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                const cellData = this.grid[r][c];
                const cellEl = document.createElement('div');
                cellEl.className = 'crossword-cell';
                
                if (cellData.char === '') {
                    cellEl.classList.add('empty');
                    cellEl.style.width = `${cellSize}px`;
                    cellEl.style.height = `${cellSize}px`;
                    cellEl.style.borderColor = 'transparent';
                } else {
                    cellEl.dataset.r = r;
                    cellEl.dataset.c = c;
                    cellEl.style.width = `${cellSize}px`;
                    cellEl.style.height = `${cellSize}px`;
                    cellEl.style.fontSize = `${cellSize * 0.6}px`;
                    
                    // Adiciona número se for início de palavra
                    const startWord = this.placedWords.find(w => w.r === r && w.c === c);
                    if (startWord) {
                        const numSpan = document.createElement('span');
                        numSpan.className = 'cell-number';
                        numSpan.textContent = startWord.number;
                        numSpan.style.fontSize = `${cellSize * 0.25}px`;
                        cellEl.appendChild(numSpan);
                    }

                    cellEl.addEventListener('click', () => this.focusCell(r, c));
                }
                this.boardContainer.appendChild(cellEl);
            }
        }
    }

    renderClues() {
        this.cluesHorizontal.innerHTML = '';
        this.cluesVertical.innerHTML = '';

        // Ordena as palavras por número para facilitar a localização
        const sortedWords = [...this.placedWords].sort((a, b) => a.number - b.number);

        sortedWords.forEach(w => {
            const li = document.createElement('li');
            li.className = 'clue-item';
            li.innerHTML = `<strong>${w.number}.</strong> ${w.clue}`;
            li.dataset.number = w.number;
            li.onclick = () => this.focusCell(w.r, w.c, w.dir);
            
            if (w.dir === "H") {
                this.cluesHorizontal.appendChild(li);
            } else {
                this.cluesVertical.appendChild(li);
            }
        });
    }

    // --- Lógica de Interação ---

    focusCell(r, c, preferredDir = null) {
        if (this.isGameOver) return;

        // Inicia o cronômetro na primeira ação
        if (!this.timerStarted) {
            this.timerStarted = true;
            this.startTimer();
        }
        if (this.focusedCell && this.focusedCell.r === r && this.focusedCell.c === c && !preferredDir) {
            this.focusDirection = this.focusDirection === "H" ? "V" : "H";
        } else if (preferredDir) {
            this.focusDirection = preferredDir;
        } else {
            // Escolhe direção baseada nas palavras que passam por aqui
            const cellData = this.grid[r][c];
            const words = cellData.wordIndices.map(idx => this.placedWords[idx]);
            if (!words.some(w => w.dir === this.focusDirection)) {
                this.focusDirection = words[0].dir;
            }
        }

        this.focusedCell = { r, c };
        this.updateSelectionVisuals();

        // Foca o input invisível no mobile para abrir o teclado virtual
        if (this.hiddenInput) {
            this.hiddenInput.focus();
        }
    }

    updateSelectionVisuals() {
        const cells = this.boardContainer.querySelectorAll('.crossword-cell:not(.empty)');
        cells.forEach(el => {
            el.classList.remove('active', 'focused');
            const r = parseInt(el.dataset.r);
            const c = parseInt(el.dataset.c);

            if (this.focusedCell && r === this.focusedCell.r && c === this.focusedCell.c) {
                el.classList.add('focused');
            } else if (this.isCellInCurrentWord(r, c)) {
                el.classList.add('active');
            }
        });

        // Highlight clues and auto-scroll
        const currentWord = this.getCurrentWordObj();
        document.querySelectorAll('.clue-item').forEach(el => {
            const isActive = currentWord && el.dataset.number == currentWord.number && el.parentElement.id === `clues-${currentWord.dir === "H" ? "horizontal" : "vertical"}`;
            el.classList.toggle('active', isActive);
            
            if (isActive) {
                // Auto-scroll para a pergunta em questão
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

    isCellInCurrentWord(r, c) {
        const word = this.getCurrentWordObj();
        if (!word) return false;
        
        if (word.dir === "H") {
            return r === word.r && c >= word.c && c < word.c + word.word.length;
        } else {
            return c === word.c && r >= word.r && r < word.r + word.word.length;
        }
    }

    getCurrentWordObj() {
        if (!this.focusedCell) return null;
        const cellData = this.grid[this.focusedCell.r][this.focusedCell.c];
        const wordIdx = cellData.wordIndices.find(idx => this.placedWords[idx].dir === this.focusDirection);
        return this.placedWords[wordIdx !== undefined ? wordIdx : cellData.wordIndices[0]];
    }

    handleKeyDown(e) {
        if (!this.focusedCell || this.isGameOver) return;

        if (e.key.length === 1 && /[a-zA-ZáàâãéèêíïóôõöúçÑñ]/.test(e.key)) {
            this.fillCell(e.key.toUpperCase());
            this.moveFocus(1);
        } else if (e.key === "Backspace") {
            this.fillCell('');
            this.moveFocus(-1);
        } else if (e.key === "ArrowRight") {
            this.focusDirection = "H";
            this.moveFocus(1);
        } else if (e.key === "ArrowLeft") {
            this.focusDirection = "H";
            this.moveFocus(-1);
        } else if (e.key === "ArrowDown") {
            this.focusDirection = "V";
            this.moveFocus(1);
        } else if (e.key === "ArrowUp") {
            this.focusDirection = "V";
            this.moveFocus(-1);
        }
    }

    fillCell(char) {
        const { r, c } = this.focusedCell;
        const cellEl = this.boardContainer.querySelector(`[data-r="${r}"][data-c="${c}"]`);
        
        // Remove text node but keep number span
        const textNodes = Array.from(cellEl.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
        textNodes.forEach(node => node.remove());
        cellEl.appendChild(document.createTextNode(char));

        this.checkWin();
    }

    moveFocus(step) {
        const word = this.getCurrentWordObj();
        if (!word) return;

        let nextR = this.focusedCell.r;
        let nextC = this.focusedCell.c;

        if (this.focusDirection === "H") {
            nextC += step;
        } else {
            nextR += step;
        }

        // Se sair da palavra, não move (ou move para próxima palavra - complexo)
        if (this.isCellInCurrentWord(nextR, nextC)) {
            this.focusCell(nextR, nextC, this.focusDirection);
        }
    }

    checkWin() {
        const cells = this.boardContainer.querySelectorAll('.crossword-cell:not(.empty)');
        let allCorrect = true;
        
        cells.forEach(el => {
            const r = parseInt(el.dataset.r);
            const c = parseInt(el.dataset.c);
            const content = el.textContent.replace(/[0-9]/g, '').trim().toUpperCase();
            if (content !== this.grid[r][c].char) {
                allCorrect = false;
            }
        });

        if (allCorrect) {
            this.endGame(true);
        }
    }

    // --- Auxiliares ---

    startTimer() {
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

    endGame(win) {
        this.isGameOver = true;
        clearInterval(this.timer);
        
        const title = document.getElementById("modal-title");
        const text = document.getElementById("modal-text");
        
        this.modal.classList.add("active");
        title.textContent = "VITÓRIA!";
        text.textContent = `Você completou a cruzadinha em ${Math.floor(this.timeElapsed / 60)}m ${this.timeElapsed % 60}s!`;
    }

    setupEventListeners() {
        this.themeSelect.onchange = () => this.init();
        
        // Listen for difficulty changes from the global component
        document.body.addEventListener('click', (e) => {
            if (e.target.classList.contains('diff-btn')) {
                // Pequeno delay para garantir que a classe active-mode foi aplicada pelo ui-components.js
                setTimeout(() => this.init(), 50);
            }
        });

        window.addEventListener('resize', () => {
            if (this.grid && this.grid.length > 0) this.renderBoard();
        });

        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // --- Virtual Keyboard Support for Mobile ---
        this.hiddenInput = document.createElement('input');
        this.hiddenInput.type = 'text';
        this.hiddenInput.style.position = 'absolute';
        this.hiddenInput.style.opacity = '0';
        this.hiddenInput.style.pointerEvents = 'none';
        this.hiddenInput.style.zIndex = '-1';
        this.hiddenInput.setAttribute('autocapitalize', 'characters');
        this.hiddenInput.setAttribute('autocomplete', 'off');
        this.hiddenInput.setAttribute('autocorrect', 'off');
        document.body.appendChild(this.hiddenInput);
        
        this.hiddenInput.addEventListener('input', (e) => {
            if (this.isGameOver || !this.focusedCell) return;
            const char = this.hiddenInput.value.slice(-1);
            if (char && /[a-zA-ZáàâãéèêíïóôõöúçÑñ]/.test(char)) {
                this.fillCell(char.toUpperCase());
                this.moveFocus(1);
            }
            this.hiddenInput.value = ''; // reseta
        });

        // Captura o backspace nativo do mobile no input
        this.hiddenInput.addEventListener('keydown', (e) => {
            if (this.isGameOver || !this.focusedCell) return;
            if (e.key === "Backspace") {
                this.fillCell('');
                this.moveFocus(-1);
            }
        });
        // ------------------------------------------

        document.getElementById("btn-persistent-new-game").onclick = () => this.newGame();
        document.getElementById("btn-new-game-modal").onclick = () => {
            this.modal.classList.remove("active");
            this.newGame();
        };
        
        document.getElementById("btn-close-modal-x").onclick = () => {
            this.modal.classList.remove("active");
            // Mostra o botão de novo jogo no header apenas após fechar o modal de vitória
            const headerNewBtn = document.getElementById("btn-persistent-new-game");
            if (headerNewBtn) headerNewBtn.classList.add("visible");
        };
        document.getElementById("btn-help-trigger").onclick = () => document.getElementById("help-modal").classList.add("active");
        document.getElementById("btn-close-help").onclick = () => document.getElementById("help-modal").classList.remove("active");

        // Modal clicks outside
        [this.modal, document.getElementById("help-modal")].forEach(m => {
            m.onclick = (e) => { if (e.target === m) m.classList.remove("active"); };
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.game = new CruzadinhaGame();
});
