/**
 * TEXAS HOLD'EM PRO ENGINE — poker.js
 */

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const SUIT_SYMBOLS = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
const VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const VALUE_MAP = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };

class TexasHoldemGame {
    constructor() {
        this.deck = [];
        this.pot = 0;
        this.currentBet = 0; // Ante
        this.phase = 'betting'; // betting, preflop, flop, turn, river, showdown
        
        this.players = {
            human: { id: 'human', chips: 0, hand: [], status: 'active', isHuman: true },
            bot1:  { id: 'bot1',  chips: 2500, hand: [], status: 'active', isHuman: false, name: 'Arthur' },
            bot2:  { id: 'bot2',  chips: 2500, hand: [], status: 'active', isHuman: false, name: 'Sofia' }
        };
        
        this.community = [];
        this.tableMinBet = 20;

        this.init();
    }

    init() {
        this.els = this.initElements();
        this.updateChipsDisplay();
        this.setupEventListeners();
        
        // Detect mode from URL
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('mode');
        if (mode === 'video' || mode === 'texas') {
            this.startMode(mode);
        }

        if (typeof injectUI === 'function') injectUI();
    }

    initElements() {
        return {
            modeSelection:  document.getElementById('poker-mode-selection'),
            gameArea:       document.getElementById('poker-game-area'),
            resultModal:    document.getElementById('poker-result'),
        };
    }

    setupEventListeners() {
        // Mode Selection
        document.getElementById('select-video-poker').onclick = () => this.startMode('video');
        document.getElementById('select-texas-holdem').onclick = () => this.startMode('texas');

        // Betting Chips
        document.querySelectorAll('.chip').forEach(btn => {
            btn.onclick = () => {
                const val = parseInt(btn.dataset.val);
                const state = APOSTAS.getChips();
                if (this.currentBet + val > state.chips) return this.showToast('Saldo insuficiente!');
                this.currentBet += val;
                document.getElementById('current-bet-display').textContent = APOSTAS.formatChips(this.currentBet);
            };
        });

        document.getElementById('btn-start-poker').onclick = () => this.startHand();
        
        document.getElementById('btn-clear-bet').onclick = () => {
            if (this.phase !== 'betting') return;
            this.currentBet = 0;
            document.getElementById('current-bet-display').textContent = '0';
        };
        
        // Action Buttons
        document.getElementById('btn-fold').onclick  = () => this.playerAction('fold');
        document.getElementById('btn-check').onclick = () => this.playerAction('check');
        document.getElementById('btn-call').onclick  = () => this.playerAction('call');

        // Reset to mode selection
        document.getElementById('btn-poker-again').onclick = () => {
            location.reload(); // Forma mais segura de resetar todos os estados
        };
    }

    startMode(mode) {
        this.mode = mode;
        this.els.modeSelection.classList.add('hidden');
        this.els.gameArea.classList.remove('hidden');
        this.showToast(`Modo ${mode === 'video' ? 'Video Poker' : 'Texas'} Selecionado`);
    }

    updateChipsDisplay() {
        const state = APOSTAS.getChips();
        this.players.human.chips = state.chips;
        document.getElementById('poker-chips-amount').textContent = APOSTAS.formatChips(state.chips);
        document.getElementById('human-current-chips').textContent = APOSTAS.formatChips(state.chips);
        document.getElementById('bot1-chips').textContent = APOSTAS.formatChips(this.players.bot1.chips);
        document.getElementById('bot2-chips').textContent = APOSTAS.formatChips(this.players.bot2.chips);
        document.getElementById('pote-valor').textContent = APOSTAS.formatChips(this.pot);
    }

    startHand() {
        if (this.currentBet < this.tableMinBet) return this.showToast(`Aposta mínima é ${this.tableMinBet}`);
        
        // Pay Ante
        const state = APOSTAS.getChips();
        APOSTAS.setChips(state.chips - this.currentBet);
        this.pot += this.currentBet;
        
        // Bots also pay Ante
        this.players.bot1.chips -= this.currentBet;
        this.players.bot2.chips -= this.currentBet;
        this.pot += (this.currentBet * 2);

        this.updateChipsDisplay();
        this.deck = this.shuffle(this.buildDeck());
        this.phase = 'preflop';

        // Deal 2 cards to each
        Object.values(this.players).forEach(p => {
            p.hand = [this.deck.pop(), this.deck.pop()];
            p.status = 'active';
        });

        // Hide betting panel, show actions
        document.getElementById('panel-betting').classList.add('hidden');
        document.getElementById('panel-actions').classList.remove('hidden');

        this.renderTable();
        this.showToast('Cartas distribuídas!');
    }

    buildDeck() {
        const deck = [];
        for (const suit of SUITS) {
            for (const val of VALUES) {
                deck.push({ suit, val, display: VALUE_MAP[val] || val.toString() });
            }
        }
        return deck;
    }

    shuffle(deck) {
        const array = new Uint32Array(deck.length);
        window.crypto.getRandomValues(array);
        for (let i = deck.length - 1; i > 0; i--) {
            const j = array[i] % (i + 1);
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    renderTable() {
        // Render Bots cards (back only) with delay
        ['bot1', 'bot2'].forEach((id, pIdx) => {
            const container = document.getElementById(`${id}-cards`);
            container.innerHTML = '';
            this.players[id].hand.forEach((c, cIdx) => {
                const el = this.createCardElement(null, false);
                el.style.animationDelay = `${(pIdx * 2 + cIdx) * 0.2}s`;
                container.appendChild(el);
            });
        });

        // Render Human cards with delay
        const hCards = document.getElementById('human-cards');
        hCards.innerHTML = '';
        this.players.human.hand.forEach((c, i) => {
            const el = this.createCardElement(c, true);
            el.style.animationDelay = `${(4 + i) * 0.2}s`;
            hCards.appendChild(el);
            setTimeout(() => el.classList.add('flipped'), 1000 + (i * 200));
        });

        // Community cards
        const comm = document.getElementById('community-cards');
        comm.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const slot = document.createElement('div');
            slot.className = 'card-slot';
            if (this.community[i]) {
                const el = this.createCardElement(this.community[i], true);
                el.style.animationDelay = `${i * 0.1}s`;
                slot.appendChild(el);
                el.classList.add('flipped');
            }
            comm.appendChild(slot);
        }
    }

    createCardElement(card, faceUp) {
        const div = document.createElement('div');
        div.className = 'playing-card';
        if (!card) return div.innerHTML = '<div class="card-inner"><div class="card-back"></div></div>', div;

        const colorClass = ['hearts', 'diamonds'].includes(card.suit) ? 'card-red' : '';
        div.innerHTML = `
            <div class="card-inner">
                <div class="card-back"></div>
                <div class="card-front ${colorClass}">
                    <div class="card-value">${card.display}</div>
                    <div class="card-suit">${SUIT_SYMBOLS[card.suit]}</div>
                    <div class="card-value" style="transform:rotate(180deg)">${card.display}</div>
                </div>
            </div>
        `;
        return div;
    }

    async playerAction(action) {
        if (action === 'fold') {
            this.players.human.status = 'fold';
            this.showBubble('human', 'FOLD');
            return this.endHand('Banca venceu (Você correu)');
        }

        this.showBubble('human', action.toUpperCase());
        
        // Progress game phases
        if (this.phase === 'preflop') {
            await this.botTurns();
            this.phase = 'flop';
            this.community = [this.deck.pop(), this.deck.pop(), this.deck.pop()];
        } else if (this.phase === 'flop') {
            await this.botTurns();
            this.phase = 'turn';
            this.community.push(this.deck.pop());
        } else if (this.phase === 'turn') {
            await this.botTurns();
            this.phase = 'river';
            this.community.push(this.deck.pop());
        } else {
            await this.botTurns();
            return this.showdown();
        }

        this.renderTable();
    }

    async botTurns() {
        for (const botId of ['bot1', 'bot2']) {
            if (this.players[botId].status !== 'active') continue;
            
            await new Promise(r => setTimeout(r, 800));
            // Simple Bot AI: 20% chance to fold if they have nothing, else Check/Call
            const rand = Math.random();
            if (rand < 0.1) {
                this.players[botId].status = 'fold';
                this.showBubble(botId, 'FOLD');
            } else {
                this.showBubble(botId, 'CHECK');
            }
        }
    }

    showdown() {
        this.phase = 'showdown';
        this.renderTable();
        
        // Reveal Bots
        ['bot1', 'bot2'].forEach(id => {
            const container = document.getElementById(`${id}-cards`);
            container.innerHTML = '';
            this.players[id].hand.forEach(c => {
                const el = this.createCardElement(c, true);
                container.appendChild(el);
                el.classList.add('flipped');
            });
        });

        // Evaluate Winner
        const results = Object.values(this.players).filter(p => p.status === 'active').map(p => {
            return { player: p, eval: this.evaluateBestHand(p.hand, this.community) };
        });

        results.sort((a, b) => b.eval.score - a.eval.score);
        const winner = results[0];

        if (winner.player.id === 'human') {
            const state = APOSTAS.getChips();
            APOSTAS.setChips(state.chips + this.pot);
            this.showResult('VOCÊ VENCEU!', winner.eval.name, this.pot, true);
        } else {
            this.showResult(`${winner.player.name} VENCEU`, winner.eval.name, 0, false);
        }
    }

    evaluateBestHand(hole, community) {
        // Basic hand ranking for now (Simplified for JS performance in browser)
        // High Card to Royal Flush logic
        const all = [...hole, ...community];
        const counts = {};
        all.forEach(c => counts[c.val] = (counts[c.val] || 0) + 1);
        const freq = Object.values(counts).sort((a,b) => b-a);
        
        if (freq[0] === 4) return { score: 8, name: 'Quadra (Four of a Kind)' };
        if (freq[0] === 3 && freq[1] === 2) return { score: 7, name: 'Full House' };
        if (freq[0] === 3) return { score: 4, name: 'Trinca (Three of a Kind)' };
        if (freq[0] === 2 && freq[1] === 2) return { score: 3, name: 'Dois Pares' };
        if (freq[0] === 2) return { score: 2, name: 'Um Par' };
        
        return { score: 1, name: 'Carta Alta' };
    }

    showBubble(id, text) {
        const b = document.getElementById(`${id}-bubble`);
        b.textContent = text;
        b.classList.add('visible');
        setTimeout(() => b.classList.remove('visible'), 2000);
    }

    showResult(title, handName, payout, won) {
        const modal = document.getElementById('poker-result');
        document.getElementById('res-title').textContent = title;
        document.getElementById('res-hand-name').textContent = handName;
        document.getElementById('res-payout').textContent = won ? `+${APOSTAS.formatChips(payout)}` : 'PERDEU TUDO';
        
        const card = modal.querySelector('.casino-result-card');
        card.className = `casino-result-card ${won ? 'win' : 'lose'}`;
        
        this.updateChipsDisplay();
        modal.classList.remove('hidden');
        if (won) confetti({ particleCount: 200, spread: 90, origin: { y: 0.7 } });
    }

    showToast(msg) {
        const t = document.createElement('div');
        t.className = 'toast show';
        t.style.bottom = '100px';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 2500);
    }
}

let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new TexasHoldemGame();
});
