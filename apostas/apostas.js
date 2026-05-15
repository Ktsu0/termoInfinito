/* apostas.js — Hub controller */
document.addEventListener('DOMContentLoaded', () => {
    const chipsAmountEl   = document.getElementById('chips-amount');
    const chipsBannerVal  = document.getElementById('chips-banner-value');
    const cooldownDisplay = document.getElementById('cooldown-display');
    const cooldownTimer   = document.getElementById('cooldown-timer');
    const chipsActions    = document.getElementById('chips-actions');
    const btnReset        = document.getElementById('btn-reset-chips');
    const toast           = document.getElementById('toast');

    // Reset modal
    const resetModal      = document.getElementById('reset-modal');
    const currentChipsMod = document.getElementById('current-chips-modal');
    const btnConfirmReset = document.getElementById('btn-confirm-reset');
    const btnCancelReset  = document.getElementById('btn-cancel-reset');

    let cooldownInterval = null;

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    function updateUI() {
        const state = APOSTAS.getChips();
        const chips = state.chips;
        const fmt   = APOSTAS.formatChips(chips);

        // Header
        chipsAmountEl.textContent = fmt;
        chipsBannerVal.textContent = fmt;
        chipsBannerVal.className = 'chips-value' + (chips === 0 ? ' zero' : chips < 200 ? ' low' : '');

        if (chips === 0 && state.zerodAt) {
            // Show cooldown
            chipsActions.classList.add('hidden');
            cooldownDisplay.classList.remove('hidden');
            startCooldown();
        } else {
            // Show reset button (enabled only if can reset)
            chipsActions.classList.remove('hidden');
            cooldownDisplay.classList.add('hidden');
            btnReset.disabled = !APOSTAS.canManualReset();

            if (cooldownInterval) {
                clearInterval(cooldownInterval);
                cooldownInterval = null;
            }
        }
    }

    function startCooldown() {
        if (cooldownInterval) clearInterval(cooldownInterval);
        cooldownInterval = setInterval(() => {
            const remaining = APOSTAS.getCooldownRemaining();
            if (remaining <= 0) {
                clearInterval(cooldownInterval);
                cooldownInterval = null;
                updateUI();
                showToast('⏰ Suas fichas foram restauradas!');
                return;
            }
            cooldownTimer.textContent = APOSTAS.formatTime(remaining);
        }, 1000);
        // Initial render
        const remaining = APOSTAS.getCooldownRemaining();
        cooldownTimer.textContent = APOSTAS.formatTime(remaining);
    }

    // Reset button
    btnReset.addEventListener('click', () => {
        const state = APOSTAS.getChips();
        currentChipsMod.textContent = APOSTAS.formatChips(state.chips);
        resetModal.classList.add('active');
    });

    btnConfirmReset.addEventListener('click', () => {
        APOSTAS.manualReset();
        resetModal.classList.remove('active');
        updateUI();
        showToast('✅ Fichas reiniciadas para 5.000!');
    });

    btnCancelReset.addEventListener('click', () => {
        resetModal.classList.remove('active');
    });

    resetModal.addEventListener('click', (e) => {
        if (e.target === resetModal) resetModal.classList.remove('active');
    });

    // Init
    updateUI();
    // Refresh every 10s in case time passed
    setInterval(updateUI, 10000);
});
