class LabirintoGame {
    constructor() {
        this.difficulty = 'easy';
        this.size = 4;
        this.grid = [];
        this.emptyPos = { r: 0, c: 0 };
        this.startPos = { r: 0, c: 0 };
        this.endPos = { r: 0, c: 0 };
        this.moves = 0;
        this.isGameOver = false;
        
        this.timer = null;
        this.timeElapsed = 0;
        this.timerStarted = false;

        this.config = {
            easy: { size: 5, walls: 1, decoys: 3 },
            medium: { size: 6, walls: 3, decoys: 6 },
            hard: { size: 7, walls: 5, decoys: 10 }
        };

        this.pipeDefs = {
            'straight-v': { dirs: [0, 2], svg: '<path class="pipe-path" d="M 50 0 L 50 100" />' },
            'straight-h': { dirs: [1, 3], svg: '<path class="pipe-path" d="M 0 50 L 100 50" />' },
            'corner-tr': { dirs: [0, 1], svg: '<path class="pipe-path" d="M 50 0 Q 50 50 100 50" />' },
            'corner-rb': { dirs: [1, 2], svg: '<path class="pipe-path" d="M 100 50 Q 50 50 50 100" />' },
            'corner-bl': { dirs: [2, 3], svg: '<path class="pipe-path" d="M 50 100 Q 50 50 0 50" />' },
            'corner-lt': { dirs: [3, 0], svg: '<path class="pipe-path" d="M 0 50 Q 50 50 50 0" />' }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDifficulty();
        this.startNewGame();
        
        if (!localStorage.getItem("labirinto_visited")) {
            document.getElementById("help-modal").classList.add("active");
            localStorage.setItem("labirinto_visited", "true");
        }
    }

    loadDifficulty() {
        const activeBtn = document.querySelector('.diff-btn.active-mode');
        if (activeBtn) {
            this.difficulty = activeBtn.dataset.level;
        }
        this.size = this.config[this.difficulty].size;
    }

    startNewGame() {
        this.isGameOver = false;
        this.moves = 0;
        this.timerStarted = false;
        this.timeElapsed = 0;
        clearInterval(this.timer);
        this.updateTimerDisplay();
        document.getElementById('moves-count').textContent = '0';
        
        const btnHeaderNew = document.getElementById("btn-persistent-new-game");
        if (btnHeaderNew) btnHeaderNew.style.display = 'none';

        this.generateLevel();
        this.renderBoard();
    }

    getDir(fr, fc, tr, tc) {
        if (tr < fr) return 0; // Top
        if (tc > fc) return 1; // Right
        if (tr > fr) return 2; // Bottom
        if (tc < fc) return 3; // Left
        return -1;
    }

    getOppositeDir(dir) {
        return (dir + 2) % 4;
    }

    generateLevel() {
        let path = null;
        // Keep trying until we get a path that leaves enough empty space
        while (!path || path.length > this.size * this.size - 3) {
            path = this.findRandomPath();
        }

        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(null));

        // Assign start
        this.startPos = path[0];
        const startOutDir = this.getDir(path[0].r, path[0].c, path[1].r, path[1].c);
        this.grid[path[0].r][path[0].c] = {
            type: 'start',
            dirs: [startOutDir],
            svg: this.getEndSvg(startOutDir)
        };

        // Assign end
        this.endPos = path[path.length - 1];
        const endInDir = this.getDir(path[path.length - 1].r, path[path.length - 1].c, path[path.length - 2].r, path[path.length - 2].c);
        this.grid[path[path.length - 1].r][path[path.length - 1].c] = {
            type: 'end',
            dirs: [endInDir],
            svg: this.getEndSvg(endInDir)
        };

        // Assign path pipes
        for (let i = 1; i < path.length - 1; i++) {
            const prevDir = this.getDir(path[i].r, path[i].c, path[i-1].r, path[i-1].c);
            const nextDir = this.getDir(path[i].r, path[i].c, path[i+1].r, path[i+1].c);
            const pipeKey = this.getPipeKey([prevDir, nextDir]);
            this.grid[path[i].r][path[i].c] = {
                type: 'wood',
                pipe: pipeKey,
                dirs: this.pipeDefs[pipeKey].dirs,
                svg: this.pipeDefs[pipeKey].svg
            };
        }

        // Fill remaining spaces
        let emptySpaces = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (!this.grid[r][c]) emptySpaces.push({r, c});
            }
        }

        // Shuffle empty spaces to place walls and empty block
        emptySpaces.sort(() => Math.random() - 0.5);

        // Place empty block (1)
        const emptyCell = emptySpaces.pop();
        this.grid[emptyCell.r][emptyCell.c] = { type: 'empty' };
        this.emptyPos = { r: emptyCell.r, c: emptyCell.c };

        // Place walls
        let wallsToPlace = this.config[this.difficulty].walls;
        while (wallsToPlace > 0 && emptySpaces.length > 0) {
            const w = emptySpaces.pop();
            this.grid[w.r][w.c] = { type: 'metal' };
            wallsToPlace--;
        }

        // Fill decoys (random pipes that are not part of the path)
        let decoysToPlace = this.config[this.difficulty].decoys;
        const pipeKeys = Object.keys(this.pipeDefs);
        
        while (decoysToPlace > 0 && emptySpaces.length > 0) {
            const pos = emptySpaces.pop();
            const randPipe = pipeKeys[Math.floor(Math.random() * pipeKeys.length)];
            this.grid[pos.r][pos.c] = {
                type: 'wood',
                pipe: randPipe,
                dirs: this.pipeDefs[randPipe].dirs,
                svg: this.pipeDefs[randPipe].svg
            };
            decoysToPlace--;
        }
        
        // Fill the absolute rest with BLANK tiles (movable but no pipe)
        emptySpaces.forEach(pos => {
            this.grid[pos.r][pos.c] = {
                type: 'blank',
                svg: '' // No pipe
            };
        });

        // Shuffle the board to make it a puzzle
        this.shuffleBoard();
    }

    findRandomPath() {
        let startR = Math.floor(Math.random() * this.size);
        let startC = 0;
        let endR = Math.floor(Math.random() * this.size);
        let endC = this.size - 1;

        let path = [];
        let visited = new Set();

        const dfs = (r, c) => {
            if (r === endR && c === endC) {
                path.push({r, c});
                return true;
            }
            visited.add(`${r},${c}`);
            path.push({r, c});

            let dirs = [[0,1], [1,0], [0,-1], [-1,0]];
            dirs.sort(() => Math.random() - 0.5);

            for (let [dr, dc] of dirs) {
                let nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size && !visited.has(`${nr},${nc}`)) {
                    if (dfs(nr, nc)) return true;
                }
            }
            path.pop();
            return false;
        };

        dfs(startR, startC);
        return path;
    }

    getEndSvg(dir) {
        let d = '';
        if (dir === 0) d = "M 50 50 L 50 0";
        if (dir === 1) d = "M 50 50 L 100 50";
        if (dir === 2) d = "M 50 50 L 50 100";
        if (dir === 3) d = "M 50 50 L 0 50";
        return `<path class="pipe-path" d="${d}" /><circle cx="50" cy="50" r="15" fill="rgba(0,0,0,0.5)" />`;
    }

    getPipeKey(dirs) {
        const sorted = [...dirs].sort();
        const dStr = sorted.join(',');
        if (dStr === '0,2') return 'straight-v';
        if (dStr === '1,3') return 'straight-h';
        if (dStr === '0,1') return 'corner-tr';
        if (dStr === '1,2') return 'corner-rb';
        if (dStr === '2,3') return 'corner-bl';
        if (dStr === '0,3') return 'corner-lt';
        return 'straight-h'; // fallback
    }

    shuffleBoard() {
        let { r, c } = this.emptyPos;
        let moves = 0;
        let lastR = -1, lastC = -1;

        // Perform 500 random valid moves backwards from solved state
        while (moves < 500) {
            let dirs = [[0,1], [1,0], [0,-1], [-1,0]];
            let validMoves = [];
            for (let [dr, dc] of dirs) {
                let nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
                    // Cannot move start, end, or metal
                    let tile = this.grid[nr][nc];
                    // Prevent immediate back-and-forth
                    if ((tile.type === 'wood' || tile.type === 'blank') && !(nr === lastR && nc === lastC)) {
                        validMoves.push({nr, nc});
                    }
                }
            }

            if (validMoves.length > 0) {
                let move = validMoves[Math.floor(Math.random() * validMoves.length)];
                // Swap
                let temp = this.grid[move.nr][move.nc];
                this.grid[move.nr][move.nc] = this.grid[r][c];
                this.grid[r][c] = temp;
                
                lastR = r; lastC = c;
                r = move.nr; c = move.nc;
                moves++;
            } else {
                // If stuck, reset lastR/lastC to allow backtracking
                lastR = -1; lastC = -1;
            }
        }
        this.emptyPos = { r, c };
    }

    renderBoard() {
        const container = document.getElementById('board-container');
        container.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        container.innerHTML = '';

        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const tileData = this.grid[r][c];
                const tileEl = document.createElement('div');
                tileEl.className = `tile ${tileData.type}`;
                tileEl.dataset.r = r;
                tileEl.dataset.c = c;

                if (tileData.type !== 'empty') {
                    tileEl.innerHTML = `<svg class="pipe-svg" viewBox="0 0 100 100">${tileData.svg}</svg>`;
                }

                if (tileData.type === 'metal') {
                    tileEl.innerHTML += `
                        <div class="screw tl"></div><div class="screw tr"></div>
                        <div class="screw bl"></div><div class="screw br"></div>
                    `;
                }

                if (tileData.type === 'start') {
                    // Add ball inside start
                    tileEl.innerHTML += `<div class="ball" id="the-ball" style="top: 35%; left: 35%;"></div>`;
                }

                tileEl.addEventListener('click', () => this.handleTileClick(r, c));
                container.appendChild(tileEl);
            }
        }
    }

    handleTileClick(r, c) {
        if (this.isGameOver) return;
        
        const tile = this.grid[r][c];
        if (tile.type !== 'wood' && tile.type !== 'blank') return;

        // Check if adjacent to empty
        const dr = Math.abs(r - this.emptyPos.r);
        const dc = Math.abs(c - this.emptyPos.c);
        
        if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
            // Start timer on first move
            if (!this.timerStarted) {
                this.timerStarted = true;
                this.startTimer();
            }

            // Swap in logic
            this.grid[this.emptyPos.r][this.emptyPos.c] = tile;
            this.grid[r][c] = { type: 'empty' };
            this.emptyPos = { r, c };
            
            this.moves++;
            document.getElementById('moves-count').textContent = this.moves;
            
            this.renderBoard();
            this.checkSolution();
        }
    }

    checkSolution() {
        let currentR = this.startPos.r;
        let currentC = this.startPos.c;
        let currentDir = this.grid[currentR][currentC].dirs[0]; // outgoing dir from start
        
        let pathCells = [{r: currentR, c: currentC}];

        while (true) {
            // Move to next cell
            let nextR = currentR;
            let nextC = currentC;
            if (currentDir === 0) nextR--;
            if (currentDir === 1) nextC++;
            if (currentDir === 2) nextR++;
            if (currentDir === 3) nextC--;

            // Check boundaries
            if (nextR < 0 || nextR >= this.size || nextC < 0 || nextC >= this.size) break;

            let nextTile = this.grid[nextR][nextC];
            if (nextTile.type === 'empty' || nextTile.type === 'metal') break;

            let requiredInDir = this.getOppositeDir(currentDir);

            if (!nextTile.dirs.includes(requiredInDir)) break; // path breaks

            pathCells.push({r: nextR, c: nextC});

            if (nextTile.type === 'end') {
                this.winGame(pathCells);
                return;
            }

            // Update current for next iteration
            currentR = nextR;
            currentC = nextC;
            // The new outgoing dir is the one that is NOT the requiredInDir
            currentDir = nextTile.dirs[0] === requiredInDir ? nextTile.dirs[1] : nextTile.dirs[0];
        }
    }

    winGame(pathCells) {
        this.isGameOver = true;
        clearInterval(this.timer);
        this.saveStats(true);

        // Highlight path
        pathCells.forEach(({r, c}) => {
            const el = document.querySelector(`.tile[data-r="${r}"][data-c="${c}"]`);
            if (el) el.classList.add('connected');
        });

        // Ball Animation (optional visual enhancement, just show modal for now)
        setTimeout(() => {
            const modal = document.getElementById('game-modal');
            document.getElementById('modal-text').innerHTML = `
                Incrível! Você resolveu o labirinto!<br>
                Nível: <b>${this.difficulty.toUpperCase()}</b><br>
                Movimentos: <b>${this.moves}</b><br>
                Tempo: <b>${this.formatTime(this.timeElapsed)}</b>
            `;
            modal.classList.add('active');

            const btnHeaderNew = document.getElementById("btn-persistent-new-game");
            if (btnHeaderNew) btnHeaderNew.style.display = 'flex';
        }, 800);
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeElapsed++;
            this.updateTimerDisplay();
        }, 1000);
    }

    updateTimerDisplay() {
        const el = document.getElementById('game-timer');
        if (el) el.textContent = this.formatTime(this.timeElapsed);
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    saveStats(won) {
        let stats = JSON.parse(localStorage.getItem('labirinto_stats')) || { played: 0, wins: 0 };
        stats.played++;
        if (won) stats.wins++;
        localStorage.setItem('labirinto_stats', JSON.stringify(stats));
    }

    updateStatsDisplay() {
        let stats = JSON.parse(localStorage.getItem('labirinto_stats')) || { played: 0, wins: 0 };
        document.getElementById('stat-played').textContent = stats.played;
        document.getElementById('stat-wins').textContent = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) + '%' : '0%';
    }

    setupEventListeners() {
        // Difficulty changes
        document.body.addEventListener('click', (e) => {
            if (e.target.classList.contains('diff-btn')) {
                setTimeout(() => {
                    this.loadDifficulty();
                    this.startNewGame();
                }, 50);
            }
        });

        const btnHelp = document.getElementById('btn-help-trigger');
        const helpModal = document.getElementById('help-modal');
        if (btnHelp) btnHelp.addEventListener('click', () => helpModal.classList.add('active'));
        
        const btnStats = document.getElementById('btn-stats-trigger');
        const statsModal = document.getElementById('stats-modal');
        if (btnStats) btnStats.addEventListener('click', () => {
            this.updateStatsDisplay();
            statsModal.classList.add('active');
        });

        document.querySelectorAll('.modal-close, #btn-close-help, #btn-close-stats').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal-overlay').classList.remove('active');
            });
        });

        const gameModal = document.getElementById('game-modal');
        document.getElementById('btn-new-game-modal').addEventListener('click', () => {
            gameModal.classList.remove('active');
            this.startNewGame();
        });

        document.getElementById('btn-persistent-new-game').addEventListener('click', () => {
            this.startNewGame();
        });

        document.querySelectorAll('.modal-overlay').forEach(m => {
            m.addEventListener('click', (e) => {
                if (e.target === m) m.classList.remove('active');
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.labirintoGame = new LabirintoGame();
});
