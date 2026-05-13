/**
 * ADIVINHA - Lógica do Jogo
 */

const SUITS = [
    { id: 'hearts', symbol: '♥', color: 'red', name: 'Copas' },
    { id: 'diamonds', symbol: '♦', color: 'red', name: 'Ouros' },
    { id: 'clubs', symbol: '♣', color: 'black', name: 'Paus' },
    { id: 'spades', symbol: '♠', color: 'black', name: 'Espadas' }
];

const VALUES = [
    { val: 2, display: '2' }, { val: 3, display: '3' }, { val: 4, display: '4' },
    { val: 5, display: '5' }, { val: 6, display: '6' }, { val: 7, display: '7' },
    { val: 8, display: '8' }, { val: 9, display: '9' }, { val: 10, display: '10' },
    { val: 11, display: 'J' }, { val: 12, display: 'Q' }, { val: 13, display: 'K' },
    { val: 14, display: 'A' }
];

function showToast(message, type = "error") {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.className = "toast";
    }, 2500);
}

class AdivinhaGame {
    constructor() {
        this.deck = [];
        this.drawnCards = []; // Max 4 cards per game
        this.currentPhase = 0; // 0: Cor, 1: Maior/Menor, 2: Entre/Fora, 3: Naipe
        this.isAnimating = false;
        
        // Stats
        this.stats = this.loadStats();

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startNewGame();
        this.updateStatsDisplay();
    }

    createDeck() {
        let newDeck = [];
        for (let suit of SUITS) {
            for (let v of VALUES) {
                newDeck.push({
                    suit: suit.id,
                    symbol: suit.symbol,
                    color: suit.color,
                    val: v.val,
                    display: v.display
                });
            }
        }
        // Embaralhamento Nível Cassino (Fisher-Yates usando Web Crypto API)
        const shuffleDeck = (deckToShuffle) => {
            for (let i = deckToShuffle.length - 1; i > 0; i--) {
                // Usando Crypto API para entropia verdadeira em vez do Math.random padrão
                const array = new Uint32Array(1);
                window.crypto.getRandomValues(array);
                const randomFloat = array[0] / (0xffffffff + 1);
                
                const j = Math.floor(randomFloat * (i + 1));
                [deckToShuffle[i], deckToShuffle[j]] = [deckToShuffle[j], deckToShuffle[i]];
            }
        };

        // Embaralha 5 vezes seguidas para garantir máxima dispersão
        for (let s = 0; s < 5; s++) {
            shuffleDeck(newDeck);
        }
        
        this.deck = newDeck;
    }

    startNewGame() {
        this.createDeck();
        this.drawnCards = [];
        this.currentPhase = 0;
        this.isAnimating = false;

        document.getElementById('current-phase').textContent = '1/4';

        // Reset UI cards
        for (let i = 0; i < 4; i++) {
            const cardEl = document.getElementById(`card-${i}`);
            cardEl.className = 'playing-card'; // reset classes
            
            const front = cardEl.querySelector('.card-front');
            front.className = 'card-front';
            
            cardEl.querySelector('.card-value-top').textContent = '';
            cardEl.querySelector('.card-value-bottom').textContent = '';
            cardEl.querySelector('.card-suit-center').textContent = '';
        }

        this.updatePhaseUI();

        const btnHeaderNew = document.getElementById("btn-persistent-new-game");
        if (btnHeaderNew) btnHeaderNew.classList.remove("visible");
    }

    updatePhaseUI() {
        const instructionEl = document.getElementById('phase-instruction');
        const containerEl = document.getElementById('controls-container');
        containerEl.innerHTML = ''; // Clear buttons

        document.getElementById('current-phase').textContent = `${this.currentPhase + 1}/4`;

        // Highlight active card
        for (let i = 0; i < 4; i++) {
            const cardEl = document.getElementById(`card-${i}`);
            if (i === this.currentPhase) {
                cardEl.classList.add('highlight');
            } else {
                cardEl.classList.remove('highlight');
            }
        }

        switch (this.currentPhase) {
            case 0:
                instructionEl.textContent = 'A carta é Vermelha ou Preta?';
                containerEl.innerHTML = `
                    <button class="btn-guess btn-red" onclick="game.makeGuess('red')">Vermelha</button>
                    <button class="btn-guess btn-black" onclick="game.makeGuess('black')">Preta</button>
                `;
                break;
            case 1:
                const prevCard1 = this.drawnCards[0].display;
                instructionEl.textContent = `A carta é Maior ou Menor que o ${prevCard1}?`;
                containerEl.innerHTML = `
                    <button class="btn-guess btn-generic" onclick="game.makeGuess('maior')">Maior</button>
                    <button class="btn-guess btn-generic" onclick="game.makeGuess('menor')">Menor</button>
                `;
                break;
            case 2:
                const c1 = this.drawnCards[0];
                const c2 = this.drawnCards[1];
                instructionEl.textContent = `Está Entre ou Fora de ${c1.display} e ${c2.display}?`;
                containerEl.innerHTML = `
                    <button class="btn-guess btn-generic" onclick="game.makeGuess('entre')">Entre</button>
                    <button class="btn-guess btn-generic" onclick="game.makeGuess('fora')">Fora</button>
                `;
                break;
            case 3:
                instructionEl.textContent = 'Qual o Naipe exato da última carta?';
                containerEl.innerHTML = `
                    <button class="btn-guess btn-suit suit-red" onclick="game.makeGuess('hearts')">♥ Copas</button>
                    <button class="btn-guess btn-suit suit-black" onclick="game.makeGuess('spades')">♠ Espadas</button>
                    <button class="btn-guess btn-suit suit-red" onclick="game.makeGuess('diamonds')">♦ Ouros</button>
                    <button class="btn-guess btn-suit suit-black" onclick="game.makeGuess('clubs')">♣ Paus</button>
                `;
                break;
        }
    }

    makeGuess(guess) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const card = this.deck.pop();
        this.drawnCards.push(card);

        this.revealCard(this.currentPhase, card);

        setTimeout(() => {
            const isCorrect = this.checkGuess(guess, card);

            if (isCorrect) {
                showToast("Correto!", "success");
                if (this.currentPhase === 3) {
                    // Won the game
                    setTimeout(() => this.gameOver(true), 1000);
                } else {
                    // Next phase
                    this.currentPhase++;
                    setTimeout(() => {
                        this.updatePhaseUI();
                        this.isAnimating = false;
                    }, 1000);
                }
            } else {
                // Wrong
                document.getElementById('controls-container').closest('.adivinha-controls').classList.add('shake');
                setTimeout(() => {
                    document.getElementById('controls-container').closest('.adivinha-controls').classList.remove('shake');
                }, 400);
                showToast("Errou! Fim de jogo.", "error");
                
                setTimeout(() => this.gameOver(false), 1500);
            }
        }, 600); // Wait for flip animation
    }

    checkGuess(guess, card) {
        switch (this.currentPhase) {
            case 0:
                return card.color === guess;
            case 1:
                const prev1 = this.drawnCards[0].val;
                if (guess === 'maior') return card.val > prev1;
                if (guess === 'menor') return card.val < prev1;
                return false; // Equal is a loss
            case 2:
                const v1 = this.drawnCards[0].val;
                const v2 = this.drawnCards[1].val;
                const low = Math.min(v1, v2);
                const high = Math.max(v1, v2);
                
                if (guess === 'entre') return card.val > low && card.val < high;
                if (guess === 'fora') return card.val < low || card.val > high;
                return false; // Equal to limits is a loss
            case 3:
                return card.suit === guess;
        }
        return false;
    }

    revealCard(index, card) {
        const cardEl = document.getElementById(`card-${index}`);
        const front = cardEl.querySelector('.card-front');
        const vTop = cardEl.querySelector('.card-value-top');
        const vBot = cardEl.querySelector('.card-value-bottom');
        const sCenter = cardEl.querySelector('.card-suit-center');

        front.classList.add(card.color === 'red' ? 'card-red' : 'card-black');
        
        vTop.textContent = card.display;
        vBot.textContent = card.display;
        sCenter.textContent = card.symbol;

        // Animate
        cardEl.classList.remove('highlight');
        cardEl.classList.add('revealed');
    }

    gameOver(won) {
        this.saveStats(won);
        
        const modal = document.getElementById('game-modal');
        const modalContent = modal.querySelector('.modal');
        const title = document.getElementById('modal-title');
        const text = document.getElementById('modal-text');
        const icon = document.getElementById('result-icon');

        modalContent.classList.remove('win', 'lose');

        if (won) {
            modalContent.classList.add('win');
            title.textContent = "VITÓRIA!";
            title.style.color = "var(--success)";
            text.textContent = "Você sobreviveu às 4 fases do baralho!";
            icon.innerHTML = '🏆';
            icon.className = "result-icon success";
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        } else {
            modalContent.classList.add('lose');
            title.textContent = "DERROTA";
            title.style.color = "var(--error)";
            text.textContent = "A sorte não estava do seu lado desta vez.";
            icon.innerHTML = '❌';
            icon.className = "result-icon error";
        }

        modal.classList.add('active');
        this.isAnimating = false;

        const btnHeaderNew = document.getElementById("btn-persistent-new-game");
        if (btnHeaderNew) btnHeaderNew.classList.add("visible");
    }

    // --- Stats ---
    loadStats() {
        const defaultStats = { played: 0, wins: 0, currentStreak: 0, maxStreak: 0 };
        const saved = localStorage.getItem('adivinha_stats');
        return saved ? JSON.parse(saved) : defaultStats;
    }

    saveStats(won) {
        this.stats.played++;
        if (won) {
            this.stats.wins++;
            this.stats.currentStreak++;
            if (this.stats.currentStreak > this.stats.maxStreak) {
                this.stats.maxStreak = this.stats.currentStreak;
            }
        } else {
            this.stats.currentStreak = 0;
        }

        localStorage.setItem('adivinha_stats', JSON.stringify(this.stats));
        this.updateStatsDisplay();

        // Update modal immediately
        document.getElementById('res-stat-played').textContent = this.stats.played;
        document.getElementById('res-stat-wins').textContent = this.stats.wins;
    }

    updateStatsDisplay() {
        document.getElementById('stats-played').textContent = this.stats.played;
        document.getElementById('stats-wins').textContent = this.stats.wins;
        document.getElementById('stats-streak').textContent = this.stats.currentStreak;
        document.getElementById('stats-max-streak').textContent = this.stats.maxStreak;
    }

    setupEventListeners() {
        document.getElementById('btn-persistent-new-game').addEventListener('click', () => {
            this.startNewGame();
        });

        document.getElementById('btn-new-game-modal').addEventListener('click', () => {
            document.getElementById('game-modal').classList.remove('active');
            this.startNewGame();
        });

        document.getElementById('btn-help-trigger').addEventListener('click', () => {
            document.getElementById('help-modal').classList.add('active');
        });

        document.getElementById('btn-stats-trigger').addEventListener('click', () => {
            document.getElementById('stats-modal').classList.add('active');
        });

        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal-overlay');
                if (modal) modal.classList.remove('active');
            });
        });
    }
}

// Initialize game
let game;
document.addEventListener('DOMContentLoaded', () => {
    // Inject global UI first
    if (typeof injectUI === 'function') {
        injectUI();
    }
    game = new AdivinhaGame();
});
