/* =============================================
   POKÉDEX GAME — pokedex.js
   Uses PokéAPI (https://pokeapi.co/) to fetch
   real Pokémon data (Gen 1–3, IDs 1–386)
   ============================================= */

class PokedexGame {
    constructor() {
        this.MAX_ATTEMPTS = 10;
        this.TOTAL_POKEMON = 1025; // Up to Gen 9

        this.genRanges = {
            '1': { start: 1, end: 151 },
            '2': { start: 152, end: 251 },
            '3': { start: 252, end: 386 },
            '4': { start: 387, end: 493 },
            '5': { start: 494, end: 649 },
            '6': { start: 650, end: 721 },
            '7': { start: 722, end: 809 },
            '8': { start: 810, end: 898 },
            '9': { start: 899, end: 1025 }
        };

        this.selectedGens = ['1', '2', '3']; // Default classic set
        this.pokemonCache = new Map(); // Global cache for current session
        this.secretPokemon = null;
        this.guesses = [];
        this.attemptsLeft = this.MAX_ATTEMPTS;
        this.isGameOver = false;
        this.currentSuggestionIndex = -1;

        // All Gen 1-3 pokemon list (name → id) — loaded lazily
        this.pokemonList = [];
        this.isLoading = true;

        this.stats = this.loadStats();
        this.init();
    }

    async init() {
        this.showLoading(true);
        await this.loadPokemonList();
        this.setupEventListeners();
        await this.startNewGame();
        this.showLoading(false);

        if (!localStorage.getItem('pokedex_visited')) {
            document.getElementById('help-modal').classList.add('active');
            localStorage.setItem('pokedex_visited', 'true');
        }
    }

    showLoading(show) {
        let overlay = document.getElementById('loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="pokeball-spinner"></div>
                <p>Carregando Pokédex...</p>
            `;
            document.body.appendChild(overlay);
        }
        overlay.classList.toggle('hidden', !show);
        this.isLoading = show;
    }

    // ─── DATA LOADING ──────────────────────────────
    async loadPokemonList() {
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${this.TOTAL_POKEMON}`);
            const data = await res.json();
            this.pokemonList = data.results.map((p, i) => ({
                id: i + 1,
                name: p.name,
                displayName: this.formatName(p.name)
            }));
        } catch (e) {
            console.error('Failed to load pokémon list:', e);
            this.showToast('Erro ao conectar com a PokéAPI. Verifique sua conexão.');
        }
    }

    async fetchPokemonData(nameOrId) {
        // Check cache first
        if (this.pokemonCache.has(nameOrId)) {
            return this.pokemonCache.get(nameOrId);
        }

        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`);
            if (!res.ok) return null;
            const data = await res.json();

            // Determine generation
            const id = data.id;
            let generation = 0;
            for (const gen in this.genRanges) {
                if (gen === 'all' || gen === '1-3') continue;
                if (id >= this.genRanges[gen].start && id <= this.genRanges[gen].end) {
                    generation = parseInt(gen);
                    break;
                }
            }

            const type1 = data.types[0]?.type.name || '—';
            const type2 = data.types[1]?.type.name || null;

            const pokemonData = {
                id,
                name: data.name,
                displayName: this.formatName(data.name),
                generation,
                type1,
                type2,
                height: data.height,
                weight: data.weight,
                sprite: data.sprites.front_default ||
                        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
            };

            // Store in cache
            this.pokemonCache.set(id, pokemonData);
            this.pokemonCache.set(data.name, pokemonData);
            
            return pokemonData;
        } catch (e) {
            console.error(`Failed to fetch ${nameOrId}:`, e);
            return null;
        }
    }

    formatName(name) {
        return name
            .split('-')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join('-');
    }

    // ─── GAME LOGIC ────────────────────────────────
    async startNewGame() {
        this.showLoading(true);
        this.isGameOver = false;
        this.guesses = [];
        this.attemptsLeft = this.MAX_ATTEMPTS;
        this.currentSuggestionIndex = -1;

        // Pick random secret within Union of selected ranges
        const selectedRanges = this.selectedGens.map(g => this.genRanges[g]);
        // Simple way: pick a random Gen from selected, then a random Id in it
        const randomGenKey = this.selectedGens[Math.floor(Math.random() * this.selectedGens.length)];
        const range = this.genRanges[randomGenKey];
        const randomId = Math.floor(Math.random() * (range.end - range.start + 1)) + range.start;
        this.secretPokemon = await this.fetchPokemonData(randomId);

        if (!this.secretPokemon) {
            this.showToast('Erro ao carregar o Pokémon. Tente novamente.');
            this.showLoading(false);
            return;
        }

        // Reset UI
        document.getElementById('guesses-container').innerHTML = `
            <div class="empty-state"><span>⚡ Faça seu primeiro palpite!</span></div>
        `;
        document.getElementById('attempts-left').textContent = this.attemptsLeft;
        document.getElementById('guess-input').value = '';
        this.hideSuggestions();

        const gameModal = document.getElementById('game-modal');
        if (gameModal) gameModal.classList.remove('active');

        const btnNew = document.getElementById('btn-persistent-new-game');
        if (btnNew) btnNew.classList.remove('visible');

        this.showLoading(false);
        console.log('[PokéDex] Secret:', this.secretPokemon.displayName, `(#${this.secretPokemon.id})`);
    }

    async handleGuess() {
        if (this.isGameOver || this.isLoading) return;

        const input = document.getElementById('guess-input');
        const rawVal = input.value.trim().toLowerCase();
        if (!rawVal) return;

        // Match against pokemon list
        const match = this.pokemonList.find(p =>
            p.name.toLowerCase() === rawVal ||
            p.displayName.toLowerCase() === rawVal
        );

        if (!match) {
            this.showToast('Pokémon não encontrado! Use as sugestões.');
            return;
        }

        // Check already guessed
        if (this.guesses.some(g => g.id === match.id)) {
            this.showToast('Você já chutou esse Pokémon!');
            return;
        }

        // Check cache first to avoid showing loading screen
        let pokemonData = this.pokemonCache.get(match.id);
        
        if (!pokemonData) {
            this.showLoading(true);
            pokemonData = await this.fetchPokemonData(match.id);
            this.showLoading(false);
        }

        if (!pokemonData) {
            this.showToast('Erro ao buscar dados. Tente novamente.');
            return;
        }

        this.guesses.push(pokemonData);
        this.attemptsLeft--;
        document.getElementById('attempts-left').textContent = this.attemptsLeft;
        input.value = '';
        this.hideSuggestions();

        this.renderGuessRow(pokemonData);

        if (pokemonData.id === this.secretPokemon.id) {
            this.endGame(true);
        } else if (this.attemptsLeft <= 0) {
            this.endGame(false);
        }
    }

    compareHint(guessVal, secretVal) {
        if (guessVal === secretVal) return 'correct';
        if (guessVal < secretVal) return 'higher';
        return 'lower';
    }

    compareText(guessVal, secretVal) {
        return guessVal === secretVal ? 'correct' : 'wrong';
    }

    renderGuessRow(pokemon) {
        const container = document.getElementById('guesses-container');
        const emptyState = container.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        const secret = this.secretPokemon;

        const genStatus    = this.compareHint(pokemon.generation, secret.generation);
        const type1Status  = this.compareText(pokemon.type1, secret.type1);
        const type2Status  = this.compareText(pokemon.type2 || 'none', secret.type2 || 'none');
        const heightStatus = this.compareHint(pokemon.height, secret.height);
        const weightStatus = this.compareHint(pokemon.weight, secret.weight);
        const idStatus     = this.compareHint(pokemon.id, secret.id);

        const arrowIcon = (status) => {
            if (status === 'correct') return '';
            return status === 'higher'
                ? '<span class="cell-arrow">🔼</span>'
                : '<span class="cell-arrow">🔽</span>';
        };

        const typeBadge = (type) => type
            ? `<span class="type-badge type-${type}">${type}</span>`
            : '<span style="opacity:0.4">—</span>';

        const heightM  = (pokemon.height / 10).toFixed(1) + 'm';
        const weightKg = (pokemon.weight / 10).toFixed(1) + 'kg';

        const row = document.createElement('div');
        row.className = 'guess-row';
        row.innerHTML = `
            <div class="cell-pokemon">
                <img src="${pokemon.sprite}" alt="${pokemon.displayName}" loading="lazy">
                <span class="cell-pokemon-name">${pokemon.displayName}</span>
            </div>
            <div class="cell-hint ${genStatus}">
                ${arrowIcon(genStatus)}
                <span>Gen ${pokemon.generation}</span>
            </div>
            <div class="cell-hint ${type1Status}">
                ${typeBadge(pokemon.type1)}
            </div>
            <div class="cell-hint ${type2Status}">
                ${typeBadge(pokemon.type2)}
            </div>
            <div class="cell-hint ${heightStatus}">
                ${arrowIcon(heightStatus)}
                <span>${heightM}</span>
            </div>
            <div class="cell-hint ${weightStatus}">
                ${arrowIcon(weightStatus)}
                <span>${weightKg}</span>
            </div>
            <div class="cell-hint ${idStatus}">
                ${arrowIcon(idStatus)}
                <span>#${pokemon.id}</span>
            </div>
        `;

        // Insert at top
        container.insertBefore(row, container.firstChild);
    }

    // ─── END GAME ──────────────────────────────────
    endGame(won) {
        this.isGameOver = true;
        this.saveStats(won);

        setTimeout(() => {
            const modal = document.getElementById('game-modal');
            const modalContent = modal.querySelector('.modal');
            const title = document.getElementById('modal-title');
            const text = document.getElementById('modal-text');
            const icon = document.getElementById('result-icon');
            const reveal = document.getElementById('pokemon-reveal');

            modalContent.classList.remove('win', 'lose');
            modalContent.classList.add(won ? 'win' : 'lose');

            const secret = this.secretPokemon;
            const guessCount = this.MAX_ATTEMPTS - this.attemptsLeft;

            if (won) {
                title.textContent = 'ACERTOU!';
                icon.textContent = '🏆';
                text.textContent = `Incrível! Era o ${secret.displayName}!`;
            } else {
                title.textContent = 'FIM DE JOGO!';
                icon.textContent = '😔';
                text.textContent = `Era o ${secret.displayName}. Tente novamente!`;
            }

            document.getElementById('res-stat-guesses').textContent = guessCount;
            document.getElementById('res-stat-gen').textContent = `Gen ${secret.generation}`;

            const type2Html = secret.type2
                ? `<span class="type-badge type-${secret.type2}">${secret.type2}</span>`
                : '';
            reveal.innerHTML = `
                <img src="${secret.sprite}" alt="${secret.displayName}">
                <div class="pokemon-reveal-types">
                    <span class="type-badge type-${secret.type1}">${secret.type1}</span>
                    ${type2Html}
                </div>
            `;

            modal.classList.add('active');

            const btnNew = document.getElementById('btn-persistent-new-game');
            if (btnNew) btnNew.classList.add('visible');
        }, 400);
    }

    // ─── SUGGESTIONS ───────────────────────────────
    handleInput(e) {
        const val = e.target.value.trim().toLowerCase();
        if (!val) { this.hideSuggestions(); return; }

        const matches = this.pokemonList.filter(p => {
            const inRange = this.selectedGens.some(g => {
                const r = this.genRanges[g];
                return p.id >= r.start && p.id <= r.end;
            });
            return inRange && (p.name.toLowerCase().includes(val) || p.displayName.toLowerCase().includes(val));
        }).slice(0, 8);

        if (matches.length > 0) {
            const list = document.getElementById('suggestions-list');
            list.innerHTML = matches.map(p => {
                const displayVal = p.displayName.toLowerCase();
                const idx = displayVal.indexOf(val);
                let highlighted = p.displayName;
                if (idx !== -1) {
                    highlighted = p.displayName.substring(0, idx)
                        + `<b>${p.displayName.substring(idx, idx + val.length)}</b>`
                        + p.displayName.substring(idx + val.length);
                }
                const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;
                return `
                    <li class="suggestion-item" data-name="${p.name}">
                        <img src="${spriteUrl}" alt="${p.displayName}" loading="lazy">
                        <span>${highlighted}</span>
                    </li>
                `;
            }).join('');
            list.classList.remove('hidden');
            this.currentSuggestionIndex = -1;
        } else {
            this.hideSuggestions();
        }
    }

    hideSuggestions() {
        const list = document.getElementById('suggestions-list');
        if (list) { list.innerHTML = ''; list.classList.add('hidden'); }
        this.currentSuggestionIndex = -1;
    }

    selectSuggestion(name) {
        document.getElementById('guess-input').value = this.formatName(name);
        this.hideSuggestions();
        this.handleGuess();
    }

    updateActiveSuggestion(items) {
        items.forEach((item, i) => {
            item.classList.toggle('active', i === this.currentSuggestionIndex);
            if (i === this.currentSuggestionIndex) item.scrollIntoView({ block: 'nearest' });
        });
    }

    // ─── STATS ─────────────────────────────────────
    loadStats() {
        try {
            return JSON.parse(localStorage.getItem('pokedex_stats')) || { played: 0, wins: 0, streak: 0, maxStreak: 0 };
        } catch {
            return { played: 0, wins: 0, streak: 0, maxStreak: 0 };
        }
    }

    saveStats(won) {
        this.stats.played++;
        if (won) {
            this.stats.wins++;
            this.stats.streak++;
            if (this.stats.streak > this.stats.maxStreak) this.stats.maxStreak = this.stats.streak;
        } else {
            this.stats.streak = 0;
        }
        localStorage.setItem('pokedex_stats', JSON.stringify(this.stats));
    }

    updateStatsUI() {
        const pct = this.stats.played > 0
            ? Math.round((this.stats.wins / this.stats.played) * 100)
            : 0;
        document.getElementById('stat-played').textContent = this.stats.played;
        document.getElementById('stat-wins').textContent = pct + '%';
        document.getElementById('stat-streak').textContent = this.stats.streak;
        document.getElementById('stat-max-streak').textContent = this.stats.maxStreak;
    }

    showToast(msg) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // ─── EVENTS ────────────────────────────────────
    setupEventListeners() {
        const input = document.getElementById('guess-input');
        const submitBtn = document.getElementById('btn-submit-guess');
        const suggestionsList = document.getElementById('suggestions-list');
        
        // Multi-Select Generation Logic
        const genBtn = document.getElementById('gen-dropdown-btn');
        const genMenu = document.getElementById('gen-dropdown-menu');
        const genLabel = document.getElementById('gen-current-label');
        const genOptions = genMenu.querySelectorAll('.gen-option');
        let genChanged = false;

        const closeGenMenu = () => {
            if (genMenu.classList.contains('show')) {
                genMenu.classList.remove('show');
                if (genChanged) {
                    genChanged = false;
                    this.startNewGame();
                }
            }
        };

        genBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (genMenu.classList.contains('show')) {
                closeGenMenu();
            } else {
                genMenu.classList.add('show');
            }
        });

        document.addEventListener('click', (e) => {
            if (!genBtn.contains(e.target) && !genMenu.contains(e.target)) {
                closeGenMenu();
            }
        });

        genOptions.forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const gen = opt.dataset.gen;
                
                if (opt.classList.contains('selected')) {
                    if (this.selectedGens.length > 1) {
                        opt.classList.remove('selected');
                        this.selectedGens = this.selectedGens.filter(g => g !== gen);
                        genChanged = true;
                    } else {
                        this.showToast('Selecione pelo menos uma geração!');
                    }
                } else {
                    opt.classList.add('selected');
                    this.selectedGens.push(gen);
                    genChanged = true;
                }

                // Update Label
                this.selectedGens.sort((a,b) => a-b);
                if (this.selectedGens.length === 9) genLabel.textContent = 'Todas as Gens';
                else genLabel.textContent = 'Gen ' + this.selectedGens.join(', ');
            });
        });

        // Submit
        submitBtn.addEventListener('click', () => this.handleGuess());
        input.addEventListener('keydown', (e) => {
            const items = suggestionsList.querySelectorAll('.suggestion-item');
            if (!suggestionsList.classList.contains('hidden') && items.length > 0) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.currentSuggestionIndex = (this.currentSuggestionIndex + 1) % items.length;
                    this.updateActiveSuggestion(items);
                    return;
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.currentSuggestionIndex = (this.currentSuggestionIndex - 1 + items.length) % items.length;
                    this.updateActiveSuggestion(items);
                    return;
                }
                if (e.key === 'Enter' && this.currentSuggestionIndex > -1) {
                    e.preventDefault();
                    this.selectSuggestion(items[this.currentSuggestionIndex].dataset.name);
                    return;
                }
                if (e.key === 'Escape') { this.hideSuggestions(); return; }
            }
            if (e.key === 'Enter') { e.preventDefault(); this.handleGuess(); }
        });

        input.addEventListener('input', (e) => this.handleInput(e));

        // Suggestion click
        suggestionsList.addEventListener('click', (e) => {
            const item = e.target.closest('.suggestion-item');
            if (item) this.selectSuggestion(item.dataset.name);
        });

        // Close suggestions on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.guess-wrapper')) this.hideSuggestions();
        });

        // New game buttons
        document.getElementById('btn-persistent-new-game').addEventListener('click', () => this.startNewGame());
        document.getElementById('btn-new-game-modal').addEventListener('click', () => {
            document.getElementById('game-modal').classList.remove('active');
            this.startNewGame();
        });

        // Help
        document.getElementById('btn-help-trigger').addEventListener('click', () => {
            document.getElementById('help-modal').classList.add('active');
        });
        document.getElementById('btn-close-help-x').addEventListener('click', () => {
            document.getElementById('help-modal').classList.remove('active');
        });
        document.getElementById('btn-close-help').addEventListener('click', () => {
            document.getElementById('help-modal').classList.remove('active');
        });

        // Stats
        document.getElementById('btn-stats-trigger').addEventListener('click', () => {
            this.updateStatsUI();
            document.getElementById('stats-modal').classList.add('active');
        });
        document.getElementById('btn-close-stats-x').addEventListener('click', () => {
            document.getElementById('stats-modal').classList.remove('active');
        });
        document.getElementById('btn-close-stats').addEventListener('click', () => {
            document.getElementById('stats-modal').classList.remove('active');
        });

        // Close game modal X
        document.getElementById('btn-close-modal-x').addEventListener('click', () => {
            document.getElementById('game-modal').classList.remove('active');
            const btnNew = document.getElementById('btn-persistent-new-game');
            if (btnNew) btnNew.classList.add('visible');
        });

        // Click outside modals
        document.querySelectorAll('.modal-overlay').forEach(m => {
            m.addEventListener('click', (e) => {
                if (e.target === m) m.classList.remove('active');
            });
        });
    }
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
    window._pokedexGame = new PokedexGame();
});
