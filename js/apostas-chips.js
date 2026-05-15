/* =============================================
   APOSTAS — Shared Chips System
   ============================================= */
const APOSTAS = {
    STARTING_CHIPS: 5000,
    COOLDOWN_MS: 60 * 60 * 1000, // 1 hora
    STORAGE_KEY: 'apostas_state',

    getState() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            const state = raw ? JSON.parse(raw) : {};
            return {
                chips: state.chips ?? this.STARTING_CHIPS,
                lastReset: state.lastReset ?? Date.now(),
                zerodAt: state.zerodAt ?? null,
            };
        } catch {
            return { chips: this.STARTING_CHIPS, lastReset: Date.now(), zerodAt: null };
        }
    },

    saveState(state) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    },

    getChips() {
        let state = this.getState();
        // Auto-restore if zeroed and cooldown passed
        if (state.zerodAt && (Date.now() - state.zerodAt) >= this.COOLDOWN_MS) {
            state = { chips: this.STARTING_CHIPS, lastReset: Date.now(), zerodAt: null };
            this.saveState(state);
        }
        return state;
    },

    setChips(amount) {
        const state = this.getState();
        state.chips = Math.max(0, amount);
        if (state.chips === 0 && !state.zerodAt) {
            state.zerodAt = Date.now();
        } else if (state.chips > 0) {
            state.zerodAt = null;
        }
        this.saveState(state);
        return state;
    },

    canManualReset() {
        const state = this.getState();
        return (Date.now() - state.lastReset) >= this.COOLDOWN_MS;
    },

    manualReset() {
        const state = { chips: this.STARTING_CHIPS, lastReset: Date.now(), zerodAt: null };
        this.saveState(state);
        return state;
    },

    formatChips(n) {
        return n.toLocaleString('pt-BR');
    },

    getCooldownRemaining() {
        const state = this.getState();
        const t = state.zerodAt;
        if (!t) return 0;
        return Math.max(0, this.COOLDOWN_MS - (Date.now() - t));
    },

    formatTime(ms) {
        const s = Math.floor(ms / 1000);
        const h = Math.floor(s / 3600).toString().padStart(2, '0');
        const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${h}:${m}:${sec}`;
    }
};
