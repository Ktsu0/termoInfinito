/* =============================================
   BLACKJACK 21 — blackjack.js
   ============================================= */

class BlackjackGame {
    constructor() {
        this.deck        = [];
        this.playerHand  = [];
        this.dealerHand  = [];
        this.currentBet  = 0;
        this.gameActive  = false;

        this.els = {
            chipsAmount:  document.getElementById('bj-chips-amount'),
            betDisplay:   document.getElementById('bet-display'),
            playerCards:  document.getElementById('player-cards'),
            dealerCards:  document.getElementById('dealer-cards'),
            playerScore:  document.getElementById('player-score'),
            dealerScore:  document.getElementById('dealer-score'),
            betSection:   document.getElementById('bet-section'),
            gameActions:  document.getElementById('game-actions'),
            result:       document.getElementById('bj-result'),
            resultIcon:   document.getElementById('result-icon'),
            resultTitle:  document.getElementById('result-title'),
            resultSub:    document.getElementById('result-sub'),
            resultChips:  document.getElementById('result-chips-total'),
            btnDeal:      document.getElementById('btn-deal'),
            btnHit:       document.getElementById('btn-hit'),
            btnStand:     document.getElementById('btn-stand'),
            btnDouble:    document.getElementById('btn-double'),
            btnClearBet:  document.getElementById('btn-clear-bet'),
            btnPlayAgain: document.getElementById('btn-play-again'),
            toast:        document.getElementById('toast'),
        };

        this.init();
    }

    init() {
        this.updateChipsDisplay();
        this.setupEvents();
        this.checkZeroChips();
    }

    // ─── CHIPS ────────────────────────────────────
    updateChipsDisplay() {
        const state = APOSTAS.getChips();
        this.els.chipsAmount.textContent = APOSTAS.formatChips(state.chips);
    }

    getChips() { return APOSTAS.getChips().chips; }

    checkZeroChips() {
        const state = APOSTAS.getChips();
        if (state.chips === 0) {
            this.showToast('Você está sem fichas! Aguarde o cooldown de 1h no hub de Apostas.');
            this.els.btnDeal.disabled = true;
        }
    }

    // ─── DECK ─────────────────────────────────────
    buildDeck() {
        const suits  = ['♠','♥','♦','♣'];
        const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
        const deck   = [];
        for (const suit of suits) {
            for (const val of values) {
                deck.push({ suit, val, isRed: suit === '♥' || suit === '♦' });
            }
        }
        // Use 6 decks (standard casino)
        const sixDeck = [];
        for (let i = 0; i < 6; i++) sixDeck.push(...deck);
        return sixDeck;
    }

    shuffleDeck(deck) {
        // Embaralhamento Fisher-Yates alimentado por Criptografia (CSPRNG)
        const array = new Uint32Array(deck.length);
        window.crypto.getRandomValues(array);

        for (let i = deck.length - 1; i > 0; i--) {
            // Usa o valor aleatório criptográfico para determinar a troca
            const j = array[i] % (i + 1);
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    drawCard() { return this.deck.pop(); }

    cardValue(card) {
        if (card.val === 'A') return 11;
        if (['J','Q','K'].includes(card.val)) return 10;
        return parseInt(card.val);
    }

    handTotal(hand) {
        let total = 0;
        let aces  = 0;
        for (const card of hand) {
            total += this.cardValue(card);
            if (card.val === 'A') aces++;
        }
        while (total > 21 && aces > 0) {
            total -= 10;
            aces--;
        }
        return total;
    }

    isBusted(hand) { return this.handTotal(hand) > 21; }
    isBlackjack(hand) { return hand.length === 2 && this.handTotal(hand) === 21; }

    // ─── RENDERING ────────────────────────────────
    renderCard(card, hidden = false) {
        const el = document.createElement('div');
        el.className = 'bj-playing-card' + (hidden ? ' hidden-card' : ` ${card.isRed ? 'red' : 'black'}`);
        if (!hidden) {
            el.innerHTML = `
                <span class="card-value-top">${card.val}${card.suit}</span>
                <span class="card-suit-center">${card.suit}</span>
                <span class="card-value-bottom">${card.val}${card.suit}</span>
            `;
        }
        return el;
    }

    renderHands(hideDealer = true) {
        this.els.playerCards.innerHTML = '';
        this.els.dealerCards.innerHTML = '';

        this.playerHand.forEach(c => this.els.playerCards.appendChild(this.renderCard(c)));

        this.dealerHand.forEach((c, i) => {
            const isHidden = hideDealer && i === 1;
            this.els.dealerCards.appendChild(this.renderCard(c, isHidden));
        });

        const playerTotal = this.handTotal(this.playerHand);
        this.els.playerScore.textContent = playerTotal;
        this.els.playerScore.className   = 'bj-score-badge' + (this.isBusted(this.playerHand) ? ' bust' : this.isBlackjack(this.playerHand) ? ' bj' : '');

        if (hideDealer) {
            this.els.dealerScore.textContent = this.cardValue(this.dealerHand[0]);
            this.els.dealerScore.className   = 'bj-score-badge';
        } else {
            const dt = this.handTotal(this.dealerHand);
            this.els.dealerScore.textContent = dt;
            this.els.dealerScore.className   = 'bj-score-badge' + (this.isBusted(this.dealerHand) ? ' bust' : this.isBlackjack(this.dealerHand) ? ' bj' : '');
        }
    }

    // ─── GAME FLOW ────────────────────────────────
    deal() {
        if (this.currentBet <= 0) {
            this.showToast('Faça uma aposta primeiro!');
            return;
        }
        const chips = this.getChips();
        if (this.currentBet > chips) {
            this.showToast('Aposta maior que suas fichas!');
            return;
        }

        // Deduct bet
        APOSTAS.setChips(chips - this.currentBet);
        this.updateChipsDisplay();

        this.deck        = this.shuffleDeck(this.buildDeck());
        this.playerHand  = [this.drawCard(), this.drawCard()];
        this.dealerHand  = [this.drawCard(), this.drawCard()];
        this.gameActive  = true;

        this.els.betSection.classList.add('hidden');
        this.els.gameActions.classList.remove('hidden');
        this.els.result.classList.add('hidden');

        this.renderHands(true);

        // Double only valid at start with enough chips
        this.els.btnDouble.disabled = this.getChips() < this.currentBet;

        // Immediate blackjack check
        if (this.isBlackjack(this.playerHand)) {
            setTimeout(() => this.stand(), 600);
        }
    }

    hit() {
        if (!this.gameActive) return;
        this.playerHand.push(this.drawCard());
        this.els.btnDouble.disabled = true;
        this.renderHands(true);

        if (this.isBusted(this.playerHand)) {
            this.endRound('bust');
        }
    }

    double() {
        if (!this.gameActive) return;
        const extra = Math.min(this.currentBet, this.getChips());
        APOSTAS.setChips(this.getChips() - extra);
        this.currentBet += extra;
        this.els.betDisplay.textContent = APOSTAS.formatChips(this.currentBet);
        this.updateChipsDisplay();

        this.playerHand.push(this.drawCard());
        this.renderHands(true);

        if (this.isBusted(this.playerHand)) {
            this.endRound('bust');
        } else {
            this.stand();
        }
    }

    stand() {
        if (!this.gameActive) return;
        // Dealer plays
        while (this.handTotal(this.dealerHand) < 17) {
            this.dealerHand.push(this.drawCard());
        }
        this.renderHands(false);
        this.evaluate();
    }

    evaluate() {
        const pTotal = this.handTotal(this.playerHand);
        const dTotal = this.handTotal(this.dealerHand);
        const pBJ    = this.isBlackjack(this.playerHand);
        const dBJ    = this.isBlackjack(this.dealerHand);
        const dBust  = this.isBusted(this.dealerHand);

        let outcome, payout, delta;

        if (pBJ && dBJ) {
            outcome = 'push';  payout = this.currentBet; delta = 0;
        } else if (pBJ) {
            outcome = 'bj';    payout = Math.floor(this.currentBet * 2.5); delta = Math.floor(this.currentBet * 1.5);
        } else if (dBust || pTotal > dTotal) {
            outcome = 'win';   payout = this.currentBet * 2; delta = this.currentBet;
        } else if (pTotal === dTotal) {
            outcome = 'push';  payout = this.currentBet; delta = 0;
        } else {
            outcome = 'lose';  payout = 0; delta = -this.currentBet;
        }

        const newChips = this.getChips() + payout;
        APOSTAS.setChips(newChips);
        this.updateChipsDisplay();
        this.endRound(outcome, delta, newChips);
    }

    endRound(outcome, delta = null, finalChips = null) {
        this.gameActive = false;
        this.els.gameActions.classList.add('hidden');

        const map = {
            bust: { icon:'💥', title:'BUST!',      titleCls:'lose', sub: `−${APOSTAS.formatChips(Math.abs(this.currentBet))} fichas` },
            win:  { icon:'🏆', title:'VITÓRIA!',   titleCls:'win',  sub: `+${APOSTAS.formatChips(delta || 0)}` },
            bj:   { icon:'🌟', title:'BIG WIN!',   titleCls:'win',  sub: `+${APOSTAS.formatChips(delta || 0)}` },
            lose: { icon:'💔', title:'PERDEU',     titleCls:'lose', sub: `−${APOSTAS.formatChips(Math.abs(delta || 0))}` },
            push: { icon:'🤝', title:'EMPATE',     titleCls:'push', sub: `0` },
        };

        const r = map[outcome] || map.lose;

        this.renderHands(false);

        // Delay showing modal so player can see the final cards
        setTimeout(() => {
            const cardBody = document.getElementById('casino-card-body');
            cardBody.className = `casino-result-card ${r.titleCls}`;
            
            this.els.resultIcon.textContent  = r.icon;
            this.els.resultTitle.textContent = r.title;
            this.els.resultSub.textContent   = r.sub;

            const chips = APOSTAS.getChips().chips;
            this.els.resultChips.textContent = APOSTAS.formatChips(chips);

            if (this.els.result) {
                this.els.result.style.display = 'flex';
                this.els.result.classList.remove('hidden');
            }
        }, 800);
    }

    resetBet() {
        this.currentBet = 0;
        this.els.betDisplay.textContent = '0';
    }

    addToBet(val) {
        const chips = this.getChips();
        if (this.currentBet + val > chips) {
            this.showToast('Fichas insuficientes!');
            return;
        }
        this.currentBet += val;
        this.els.betDisplay.textContent = APOSTAS.formatChips(this.currentBet);
    }

    newRound() {
        // Reset state
        this.currentBet = 0;
        this.playerHand = [];
        this.dealerHand = [];
        this.gameActive = false;

        // UI Reset
        this.els.betDisplay.textContent  = '0';
        this.els.playerCards.innerHTML   = '';
        this.els.dealerCards.innerHTML   = '';
        this.els.playerScore.textContent = '0';
        this.els.dealerScore.textContent = '?';
        
        // Reset classes
        this.els.playerScore.className   = 'bj-score-badge';
        this.els.dealerScore.className   = 'bj-score-badge';

        // Visibility toggle - Force hide using display none
        const modal = document.getElementById('bj-result');
        if (modal) modal.style.display = 'none';
        
        this.els.betSection.classList.remove('hidden');
        this.els.gameActions.classList.add('hidden');

        // Refresh chips and check status
        this.updateChipsDisplay();
        this.checkZeroChips();
    }

    showToast(msg) {
        this.els.toast.textContent = msg;
        this.els.toast.classList.add('show');
        setTimeout(() => this.els.toast.classList.remove('show'), 2500);
    }

    // ─── EVENTS ───────────────────────────────────
    setupEvents() {
        // Chips
        document.querySelectorAll('.chip').forEach(btn => {
            btn.addEventListener('click', () => this.addToBet(parseInt(btn.dataset.val)));
        });

        this.els.btnClearBet.addEventListener('click',  () => this.resetBet());
        this.els.btnDeal.addEventListener('click',      () => this.deal());
        this.els.btnHit.addEventListener('click',       () => this.hit());
        this.els.btnStand.addEventListener('click',     () => this.stand());
        this.els.btnDouble.addEventListener('click',    () => this.double());
        this.els.btnPlayAgain.addEventListener('click', () => this.newRound());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window._bj = new BlackjackGame();
});
