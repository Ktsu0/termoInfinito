function injectUI() {
    const isRoot = document.body.dataset.root === "true";
    const prefix = isRoot ? '' : '../';

    const diffContainer = document.getElementById('global-difficulty-selector');
    if (diffContainer) {
        diffContainer.outerHTML = `
          <nav class="mode-selector" id="difficulty-selector">
            <button class="btn btn-secondary active-mode diff-btn" data-level="easy" id="diff-easy">FÁCIL</button>
            <button class="btn btn-secondary diff-btn" data-level="medium" id="diff-medium">MÉDIO</button>
            <button class="btn btn-secondary diff-btn" data-level="hard" id="diff-hard">DIFÍCIL</button>
          </nav>
        `;
    }

    const jogosContainer = document.getElementById('global-outros-jogos-modal');
    if (jogosContainer) {
        jogosContainer.outerHTML = `
        <div class="modal-overlay" id="outros-jogos-modal">
          <div class="modal">
            <button class="modal-close" id="btn-close-outros-jogos" aria-label="Fechar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h2>🎮 Outros Jogos</h2>
            <p class="outros-jogos-subtitle">Escolha um jogo para jogar agora</p>
            <div class="outros-jogos-grid">
              <div class="jogo-card" onclick="window.location.href='${prefix}index.html'" title="Jogar Termo">
                <div class="jogo-card-img jogo-card-termo">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="3" y1="15" x2="21" y2="15"></line>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                    <line x1="15" y1="3" x2="15" y2="21"></line>
                  </svg>
                </div>
                <span class="jogo-card-nome">TERMO</span>
              </div>
              <div class="jogo-card" onclick="window.location.href='${prefix}sequence/sequence.html'" title="Jogar Sequence">
                <div class="jogo-card-img jogo-card-sequence">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
                    <path d="M6 12h4"></path><path d="M8 10v4"></path>
                    <line x1="15" y1="13" x2="15.01" y2="13"></line>
                    <line x1="18" y1="11" x2="18.01" y2="11"></line>
                  </svg>
                </div>
                <span class="jogo-card-nome">SEQUENCE</span>
              </div>
              <div class="jogo-card" onclick="window.location.href='${prefix}conexo/conexo.html'" title="Jogar Conexo">
                <div class="jogo-card-img jogo-card-conexo">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                  </svg>
                </div>
                <span class="jogo-card-nome">CONEXO</span>
              </div>
              <div class="jogo-card" onclick="window.location.href='${prefix}sudoku/sudoku.html'" title="Jogar Sudoku">
                <div class="jogo-card-img jogo-card-sudoku">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                    <line x1="15" y1="3" x2="15" y2="21"></line>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="3" y1="15" x2="21" y2="15"></line>
                  </svg>
                </div>
                <span class="jogo-card-nome">SUDOKU</span>
              </div>
              <div class="jogo-card" onclick="window.location.href='${prefix}cores/cores.html'" title="Jogar Cores">
                <div class="jogo-card-img jogo-card-cores">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="8" cy="8" r="3"></circle>
                    <circle cx="16" cy="8" r="3"></circle>
                    <circle cx="8" cy="16" r="3"></circle>
                    <circle cx="16" cy="16" r="3"></circle>
                  </svg>
                </div>
                <span class="jogo-card-nome">CORES</span>
              </div>
              <div class="jogo-card" onclick="window.location.href='${prefix}palavras/palavras.html'" title="Jogar Caça Palavras">
                <div class="jogo-card-img jogo-card-palavras">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </div>
                <span class="jogo-card-nome">PALAVRAS</span>
              </div>
            </div>
          </div>
        </div>
        `;
        
        // Atachar evento de fechar
        document.getElementById('btn-close-outros-jogos').addEventListener('click', () => {
            document.getElementById('outros-jogos-modal').classList.remove('active');
        });
        document.getElementById('outros-jogos-modal').addEventListener('click', (e) => {
            if (e.target.id === 'outros-jogos-modal') {
                e.target.classList.remove('active');
            }
        });

        // Atachar evento de abrir
        const btnOpen = document.getElementById('btn-outros-jogos');
        if (btnOpen) {
            btnOpen.addEventListener('click', () => {
                document.getElementById('outros-jogos-modal').classList.add('active');
            });
        }
    }
}

injectUI();
