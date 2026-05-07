import { buildKeyboardDOM } from "../js/components.js";
import { THEMES } from "./themes.js";

class SecretaGame {
    constructor() {
        this.difficulty = "easy";
        this.theme = "paises";
        this.secretWord = "";
        this.secretIndex = -1;
        this.secretNumber = -1;
        
        this.maxAttempts = 15;
        this.attemptsUsed = 0;
        this.isGameOver = false;
        
        this.themeSelect = document.getElementById('theme-select');
        this.guessInput = document.getElementById('guess-input');
        this.guessForm = document.getElementById('guess-form');
        this.historyList = document.getElementById('history-list');
        this.attemptsLeftDisplay = document.getElementById('attempts-left');
        this.suggestionsList = document.getElementById('suggestions-list');
        this.modal = document.getElementById('game-modal');
        this.keyboardEl = document.getElementById('keyboard');
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        // Load default difficulty if active in UI
        const activeDiff = document.querySelector(".diff-btn.active-mode");
        if (activeDiff) {
            this.difficulty = activeDiff.dataset.level || activeDiff.id.replace('diff-', '') || "easy";
        }
        
        this.theme = this.themeSelect.value;
        this.updateSettings();
        this.newGame();
        
        if (this.keyboardEl) {
            buildKeyboardDOM(this.keyboardEl, (key) => this.handleVirtualKeyboard(key));
        }
        
        if (!localStorage.getItem("secreta_visited")) {
            document.getElementById("help-modal").classList.add("active");
            localStorage.setItem("secreta_visited", "true");
        }
    }
    
    updateSettings() {
        switch (this.difficulty) {
            case "easy": this.maxAttempts = 15; break;
            case "medium": this.maxAttempts = 10; break;
            case "hard": this.maxAttempts = 6; break;
        }
    }
    
    newGame() {
        this.isGameOver = false;
        this.attemptsUsed = 0;
        this.historyList.innerHTML = "";
        this.guessInput.value = "";
        this.hideSuggestions();
        this.updateAttemptsDisplay();
        
        if (this.theme === "numeros") {
            this.secretNumber = Math.floor(Math.random() * 1000) + 1;
            this.secretWord = this.secretNumber.toString();
        } else {
            const list = THEMES[this.theme];
            this.secretIndex = Math.floor(Math.random() * list.length);
            this.secretWord = list[this.secretIndex];
        }
    }
    
    updateAttemptsDisplay() {
        const left = this.maxAttempts - this.attemptsUsed;
        this.attemptsLeftDisplay.textContent = left;
        if (left <= 3) {
            this.attemptsLeftDisplay.style.color = "var(--error)";
        } else {
            this.attemptsLeftDisplay.style.color = "var(--primary)";
        }
    }
    
    handleGuess(e) {
        e.preventDefault();
        if (this.isGameOver) return;
        
        const guess = this.guessInput.value.trim();
        if (!guess) return;
        
        let distance = 0;
        let direction = 0; // 0=match, 1=up (needs smaller index/number), -1=down (needs larger index/number)
        let displayGuess = guess;
        
        if (this.theme === "numeros") {
            const num = parseInt(guess, 10);
            if (isNaN(num) || num < 1 || num > 1000) {
                this.showToast("Digite um número entre 1 e 1000.");
                return;
            }
            displayGuess = num.toString();
            distance = Math.abs(this.secretNumber - num);
            
            if (num > this.secretNumber) {
                direction = 1; // Seta cima (o segredo é menor)
            } else if (num < this.secretNumber) {
                direction = -1; // Seta baixo (o segredo é maior)
            }
            
            this.addHistoryItem(displayGuess, distance, direction, 1000);
            
            if (num === this.secretNumber) {
                this.endGame(true);
            }
        } else {
            const list = THEMES[this.theme];
            const guessIndex = list.findIndex(w => w.localeCompare(guess, 'pt-BR', { sensitivity: 'base' }) === 0);
            
            if (guessIndex === -1) {
                this.showToast("Palavra não está na lista! Use as sugestões.");
                return;
            }
            
            displayGuess = list[guessIndex];
            distance = Math.abs(this.secretIndex - guessIndex);
            
            if (guessIndex > this.secretIndex) {
                direction = 1; // Seta cima (o segredo está antes na lista alfabética)
            } else if (guessIndex < this.secretIndex) {
                direction = -1; // Seta baixo (o segredo está depois na lista alfabética)
            }
            
            this.addHistoryItem(displayGuess, distance, direction, list.length);
            
            if (guessIndex === this.secretIndex) {
                this.endGame(true);
            }
        }
        
        this.attemptsUsed++;
        this.updateAttemptsDisplay();
        this.guessInput.value = "";
        this.hideSuggestions();
        this.guessInput.focus();
        
        if (!this.isGameOver && this.attemptsUsed >= this.maxAttempts) {
            this.endGame(false);
        }
    }
    
    addHistoryItem(guess, distance, direction, maxDistance) {
        const percent = distance / maxDistance;
        let category = "exact";
        let text = "EXATO!";
        let arrow = "✓";
        
        if (distance !== 0) {
            arrow = direction === 1 ? "↑" : "↓"; 
            if (percent < 0.05 || distance <= 2) {
                category = "near";
                text = "Muito Perto";
            } else if (percent < 0.2 || distance <= 10) {
                category = "medium";
                text = "Médio";
            } else {
                category = "far";
                text = "Longe";
            }
        }

        const el = document.createElement('div');
        el.className = 'history-item';
        el.innerHTML = `
            <span class="history-word">${guess}</span>
            <div class="history-hint">
                <span class="history-text text-${category}">${text}</span>
                <div class="history-icon color-${category}">
                    ${arrow}
                </div>
            </div>
        `;
        
        this.historyList.insertBefore(el, this.historyList.firstChild);
    }
    
    endGame(win) {
        this.isGameOver = true;
        setTimeout(() => this.showGameResultModal(win), 500);
    }
    
    showGameResultModal(win) {
        const title = document.getElementById('modal-title');
        const text = document.getElementById('modal-text');
        const secret = document.getElementById('modal-secret');
        
        this.modal.classList.add('active');
        
        if (win) {
            title.textContent = "VITÓRIA!";
            title.style.color = "var(--success)";
            text.textContent = `Você descobriu a palavra em ${this.attemptsUsed} tentativas!`;
        } else {
            title.textContent = "DERROTA";
            title.style.color = "var(--error)";
            text.textContent = `Você esgotou suas ${this.maxAttempts} tentativas.`;
        }
        secret.textContent = `O segredo era: ${this.secretWord}`;
    }
    
    showToast(msg) {
        const toastEl = document.getElementById('toast');
        if (!toastEl) return;
        toastEl.textContent = msg;
        toastEl.classList.add('visible');
        setTimeout(() => toastEl.classList.remove('visible'), 2500);
    }
    
    handleInput(e) {
        const val = e.target.value.trim().toLowerCase();
        if (this.theme === "numeros" || !val) {
            this.hideSuggestions();
            return;
        }
        
        const list = THEMES[this.theme];
        // Custom simple logic to ignore accents in search
        const removeAccents = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const searchVal = removeAccents(val);
        
        const matches = list.filter(w => removeAccents(w.toLowerCase()).includes(searchVal)).slice(0, 5);
        
        if (matches.length > 0) {
            this.suggestionsList.innerHTML = matches.map(m => `
                <li class="suggestion-item" data-word="${m}">
                    ${m}
                </li>
            `).join('');
            this.suggestionsList.classList.remove('hidden');
        } else {
            this.hideSuggestions();
        }
    }
    
    hideSuggestions() {
        this.suggestionsList.innerHTML = '';
        this.suggestionsList.classList.add('hidden');
    }
    
    selectSuggestion(e) {
        const item = e.target.closest('.suggestion-item');
        if (item) {
            this.guessInput.value = item.dataset.word;
            this.hideSuggestions();
            this.guessInput.focus();
        }
    }
    
    handleVirtualKeyboard(key) {
        if (this.isGameOver) return;
        
        const input = this.guessInput;
        
        if (key === "ENTER") {
            // Trigger form submit directly
            this.guessForm.dispatchEvent(new Event('submit', { cancelable: true }));
        } else if (key === "BKSP" || key === "BACKSPACE") {
            input.value = input.value.slice(0, -1);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            // Prevent letters in numbers mode
            if (this.theme === "numeros") {
                if (!/^[0-9]$/.test(key)) {
                    this.showToast("Use o teclado numérico do seu aparelho!");
                    return;
                }
            }
            input.value += key;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        input.focus();
    }
    
    setupEventListeners() {
        // Dificuldade
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('diff-btn')) {
                const level = e.target.dataset.level || e.target.id.replace('diff-', '');
                if (level) {
                    this.difficulty = level;
                    this.updateSettings();
                    this.newGame();
                }
            }
        });

        // Theme
        this.themeSelect.addEventListener('change', () => {
            this.theme = this.themeSelect.value;
            if (this.theme === "numeros") {
                this.guessInput.type = "number";
                this.guessInput.min = "1";
                this.guessInput.max = "1000";
                this.guessInput.placeholder = "Digite um número (1-1000)";
            } else {
                this.guessInput.type = "text";
                this.guessInput.removeAttribute('min');
                this.guessInput.removeAttribute('max');
                this.guessInput.placeholder = "Digite uma palavra...";
            }
            this.newGame();
        });

        // Form Submit
        this.guessForm.addEventListener('submit', this.handleGuess.bind(this));
        
        // Autocomplete
        this.guessInput.addEventListener('input', this.handleInput.bind(this));
        document.addEventListener('click', (e) => {
            if (!this.guessForm.contains(e.target)) {
                this.hideSuggestions();
            }
        });
        this.suggestionsList.addEventListener('click', this.selectSuggestion.bind(this));

        // Modals
        document.getElementById('btn-help-trigger').onclick = () => document.getElementById('help-modal').classList.add('active');
        const closeHelp = document.getElementById('btn-close-help');
        if (closeHelp) closeHelp.onclick = () => document.getElementById('help-modal').classList.remove('active');
        const closeGameX = document.getElementById('btn-close-modal-x');
        if (closeGameX) closeGameX.onclick = () => this.modal.classList.remove('active');
        
        [this.modal, document.getElementById('help-modal')].forEach(m => {
            if (!m) return;
            m.addEventListener('click', (e) => {
                if (e.target === m) m.classList.remove('active');
            });
        });

        // New game buttons
        const btnHeaderNew = document.getElementById('btn-persistent-new-game');
        const btnModalNew = document.getElementById('btn-new-game-modal');
        const restart = () => {
            this.modal.classList.remove('active');
            this.newGame();
        };
        if (btnHeaderNew) btnHeaderNew.onclick = restart;
        if (btnModalNew) btnModalNew.onclick = restart;

        // Toggle Keyboard Logic
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
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SecretaGame();
});
