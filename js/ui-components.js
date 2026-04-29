function injectUI() {
    const isRoot = document.body.dataset.root === "true";
    const prefix = isRoot ? '' : '../';

    const diffContainer = document.getElementById('global-difficulty-selector');
    if (diffContainer) {
        diffContainer.outerHTML = `
          <div class="diff-dropdown-container" id="difficulty-dropdown">
            <button class="btn-outros-jogos diff-dropdown-trigger" id="diff-dropdown-btn" title="Dificuldade">
              <span id="diff-current-label">FÁCIL</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="diff-chevron">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="diff-dropdown-menu" id="diff-dropdown-menu">
              <button class="diff-dropdown-item active-mode diff-btn" data-level="easy" id="diff-easy">FÁCIL</button>
              <button class="diff-dropdown-item diff-btn" data-level="medium" id="diff-medium">MÉDIO</button>
              <button class="diff-dropdown-item diff-btn" data-level="hard" id="diff-hard">DIFÍCIL</button>
            </div>
          </div>
        `;
        
        // Add dropdown toggle logic
        const diffBtn = document.getElementById('diff-dropdown-btn');
        const diffMenu = document.getElementById('diff-dropdown-menu');
        const diffLabel = document.getElementById('diff-current-label');

        if (diffBtn && diffMenu) {
            diffBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                diffMenu.classList.toggle('show');
                diffBtn.classList.toggle('open');
            });
            
            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (!diffBtn.contains(e.target) && !diffMenu.contains(e.target)) {
                    diffMenu.classList.remove('show');
                    diffBtn.classList.remove('open');
                }
            });

            // Update label when a difficulty is clicked
            const diffBtns = diffMenu.querySelectorAll('.diff-btn');
            diffBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    diffLabel.textContent = btn.textContent;
                    diffBtns.forEach(b => b.classList.remove('active-mode'));
                    btn.classList.add('active-mode');
                    diffMenu.classList.remove('show');
                    diffBtn.classList.remove('open');
                });
            });
        }
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
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
                  </svg>
                </div>
                <span class="jogo-card-nome">TERMO</span>
              </div>
              <div class="jogo-card" onclick="window.location.href='${prefix}sequence/sequence.html'" title="Jogar Sequence">
                <div class="jogo-card-img jogo-card-sequence">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m21 2-19.6 19.6"/><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.4 9.4"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>
                  </svg>
                </div>
                <span class="jogo-card-nome">SEQUENCE</span>
              </div>
              <div class="jogo-card" onclick="window.location.href='${prefix}conexo/conexo.html'" title="Jogar Conexo">
                <div class="jogo-card-img jogo-card-conexo">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </div>
                <span class="jogo-card-nome">CONEXO</span>
              </div>
              <div class="jogo-card" onclick="window.location.href='${prefix}sudoku/sudoku.html'" title="Jogar Sudoku">
                <div class="jogo-card-img jogo-card-sudoku">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /><path d="M9 3v18" /><path d="M15 3v18" />
                  </svg>
                </div>
                <span class="jogo-card-nome">SUDOKU</span>
              </div>
              <div class="jogo-card" onclick="window.location.href='${prefix}cores/cores.html'" title="Jogar Cores">
                <div class="jogo-card-img jogo-card-cores">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="13.5" cy="6.5" r=".5" /><circle cx="17.5" cy="10.5" r=".5" /><circle cx="8.5" cy="7.5" r=".5" /><circle cx="6.5" cy="12.5" r=".5" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.5-.58 1.5-1.5 0-.43-.17-.83-.44-1.13-.24-.27-.4-.64-.4-1.03 0-.88.72-1.6 1.6-1.6H16c2.2 0 4-1.8 4-4 0-4.42-3.58-8-8-8z" />
                  </svg>
                </div>
                <span class="jogo-card-nome">CORES</span>
              </div>
              <div class="jogo-card" onclick="window.location.href='${prefix}palavras/palavras.html'" title="Jogar Caça Palavras">
                <div class="jogo-card-img jogo-card-palavras">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <span class="jogo-card-nome">PALAVRAS</span>
              </div>
              <div class="jogo-card" onclick="window.location.href='${prefix}cruzadinha/cruzadinha.html'" title="Jogar Cruzadinha">
                <div class="jogo-card-img jogo-card-cruzadinha">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
                  </svg>
                </div>
                <span class="jogo-card-nome">CRUZADINHA</span>
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
