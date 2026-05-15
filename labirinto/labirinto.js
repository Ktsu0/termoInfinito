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
        this.selectedTile = null;
        this.stars = []; // {r, c, collected: false}
        this.collectedStars = 0;
        
        this.timer = null;
        this.timeElapsed = 0;
        this.timerStarted = false;

        this.config = {
            easy: { size: 5, walls: 1, decoys: 2, empty: 3 },
            medium: { size: 6, walls: 2, decoys: 4, empty: 4 },
            hard: { size: 7, walls: 3, decoys: 6, empty: 5 }
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
        this.selectedTile = null;
        this.timerStarted = false;
        this.timeElapsed = 0;
        clearInterval(this.timer);
        this.updateTimerDisplay();
        document.getElementById('moves-count').textContent = '0';
        
        const btnHeaderNew = document.getElementById("btn-persistent-new-game");
        if (btnHeaderNew) btnHeaderNew.classList.remove("visible");

        this.generateLevel();
        this.renderBoard();
        this.updatePipeFlow();
        this.updateStarStatus();
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
                svg: this.pipeDefs[pipeKey].svg,
                rotation: 0
            };
        }

        // Place Stars on the solution path
        this.stars = [];
        let pathIndices = [];
        for(let i=1; i<path.length-1; i++) pathIndices.push(i);
        pathIndices.sort(() => Math.random() - 0.5);
        
        const numStars = Math.min(3, pathIndices.length);
        for(let i=0; i<numStars; i++) {
            const idx = pathIndices[i];
            const p = path[idx];
            this.grid[p.r][p.c].hasStar = true;
            this.stars.push({ r: p.r, c: p.c });
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

        // Place empty blocks
        let emptyToPlace = this.config[this.difficulty].empty || 1;
        while (emptyToPlace > 0 && emptySpaces.length > 0) {
            const emptyCell = emptySpaces.pop();
            this.grid[emptyCell.r][emptyCell.c] = { type: 'empty' };
            emptyToPlace--;
        }
        
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
                svg: this.pipeDefs[randPipe].svg,
                rotation: Math.floor(Math.random() * 4) * 90
            };
            // Apply initial rotation to dirs
            for(let j=0; j < (this.grid[pos.r][pos.c].rotation/90); j++) {
                this.grid[pos.r][pos.c].dirs = this.grid[pos.r][pos.c].dirs.map(d => (d + 1) % 4);
            }
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
        let moves = 0;
        const totalMoves = 300;

        while (moves < totalMoves) {
            // Find all empty positions
            let empties = [];
            for (let r = 0; r < this.size; r++) {
                for (let c = 0; c < this.size; c++) {
                    if (this.grid[r][c].type === 'empty') empties.push({r, c});
                }
            }

            // Pick a random empty space
            const empty = empties[Math.floor(Math.random() * empties.length)];
            
            // Find valid neighbors to swap with
            let dirs = [[0,1], [1,0], [0,-1], [-1,0]];
            let validMoves = [];
            for (let [dr, dc] of dirs) {
                let nr = empty.r + dr, nc = empty.c + dc;
                if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
                    let tile = this.grid[nr][nc];
                    if (tile.type === 'wood' || tile.type === 'blank') {
                        validMoves.push({nr, nc});
                    }
                }
            }

            if (validMoves.length > 0) {
                let move = validMoves[Math.floor(Math.random() * validMoves.length)];
                // Swap
                let temp = this.grid[move.nr][move.cn || move.nc]; // Fix nc
                this.grid[move.nr][move.nc] = this.grid[empty.r][empty.c];
                this.grid[empty.r][empty.c] = temp;
                moves++;
            }
        }
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
                    let rotationStyle = tileData.rotation ? `style="transform: rotate(${tileData.rotation}deg)"` : '';
                    tileEl.innerHTML = `<svg class="pipe-svg" viewBox="0 0 100 100" ${rotationStyle}>${tileData.svg}</svg>`;
                    
                    if (tileData.hasStar) {
                        tileEl.innerHTML += `<div class="tile-star ${tileData.starCollected ? 'collected' : ''}">⭐</div>`;
                    }
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

                if (this.selectedTile && this.selectedTile.r === r && this.selectedTile.c === c) {
                    tileEl.classList.add('selected');
                }

                tileEl.addEventListener('click', () => this.handleTileClick(r, c));
                container.appendChild(tileEl);
            }
        }
    }

    handleTileClick(r, c) {
        if (this.isGameOver) return;
        
        const clickedTile = this.grid[r][c];
        const dirs = [[0,1], [1,0], [0,-1], [-1,0]];

        // Case 1: Clicking an EMPTY space
        if (clickedTile.type === 'empty') {
            // Check if a piece is selected and adjacent
            if (this.selectedTile) {
                const isAdjacent = Math.abs(this.selectedTile.r - r) + Math.abs(this.selectedTile.c - c) === 1;
                if (isAdjacent) {
                    this.movePiece(this.selectedTile.r, this.selectedTile.c, r, c);
                    return;
                }
            }
            
            // If no selected piece or not adjacent, check if there's only ONE movable adjacent piece
            let movableNeighbors = [];
            for (let [dr, dc] of dirs) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
                    const neighbor = this.grid[nr][nc];
                    if (neighbor.type === 'wood' || neighbor.type === 'blank') {
                        movableNeighbors.push({r: nr, c: nc});
                    }
                }
            }

            if (movableNeighbors.length === 1) {
                this.movePiece(movableNeighbors[0].r, movableNeighbors[0].c, r, c);
            }
            return;
        }

        // Case 2: Clicking a PIECE (wood or blank)
        if (clickedTile.type === 'wood' || clickedTile.type === 'blank') {
            // New Mechanic: Single Click Rotates
            if (clickedTile.type === 'wood') {
                this.rotatePiece(r, c);
                return;
            }

            // Find empty neighbors for sliding
            let emptyNeighbors = [];
            for (let [dr, dc] of dirs) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
                    if (this.grid[nr][nc].type === 'empty') {
                        emptyNeighbors.push({r: nr, c: nc});
                    }
                }
            }

            if (emptyNeighbors.length === 0) return;

            if (emptyNeighbors.length === 1) {
                // Only one way to go, move immediately
                this.movePiece(r, c, emptyNeighbors[0].r, emptyNeighbors[0].c);
            } else {
                // Multiple ways to go, toggle selection
                if (this.selectedTile && this.selectedTile.r === r && this.selectedTile.c === c) {
                    this.selectedTile = null;
                } else {
                    this.selectedTile = {r, c};
                }
                this.renderBoard();
            }
        }
    }

    rotatePiece(r, c) {
        if (!this.timerStarted) {
            this.timerStarted = true;
            this.startTimer();
        }
        const tile = this.grid[r][c];
        tile.rotation = (tile.rotation || 0) + 90;
        // Update directions
        tile.dirs = tile.dirs.map(d => (d + 1) % 4);
        
        this.renderBoard();
        this.updatePipeFlow();
        this.updateStarStatus();
        this.checkSolution();
    }

    updateStarStatus() {
        // A star is collected if it is part of the path connected to start
        let currentR = this.startPos.r;
        let currentC = this.startPos.c;
        let currentDir = this.grid[currentR][currentC].dirs[0]; 
        
        this.collectedStars = 0;
        // Reset all stars first
        for(let r=0; r<this.size; r++) {
            for(let c=0; c<this.size; c++) {
                if(this.grid[r][c].hasStar) this.grid[r][c].starCollected = false;
            }
        }

        while (true) {
            let nextR = currentR;
            let nextC = currentC;
            if (currentDir === 0) nextR--;
            if (currentDir === 1) nextC++;
            if (currentDir === 2) nextR++;
            if (currentDir === 3) nextC--;

            if (nextR < 0 || nextR >= this.size || nextC < 0 || nextC >= this.size) break;

            let nextTile = this.grid[nextR][nextC];
            if (nextTile.type === 'empty' || nextTile.type === 'metal') break;

            let requiredInDir = this.getOppositeDir(currentDir);
            if (!nextTile.dirs || !nextTile.dirs.includes(requiredInDir)) break;

            if (nextTile.hasStar) {
                if (!nextTile.starCollected) {
                    nextTile.starCollected = true;
                    // Visual feedback: Trigger pop animation
                    const starEl = document.querySelector(`.tile[data-r="${nextR}"][data-c="${nextC}"] .tile-star`);
                    if (starEl) {
                        starEl.classList.add('pop');
                        setTimeout(() => starEl.classList.remove('pop'), 500);
                    }
                }
                this.collectedStars++;
            }

            if (nextTile.type === 'end') break;

            currentR = nextR;
            currentC = nextC;
            currentDir = nextTile.dirs[0] === requiredInDir ? nextTile.dirs[1] : nextTile.dirs[0];
        }
        
        // Refresh board to show stars
        const tilesWithStars = document.querySelectorAll('.tile-star');
        tilesWithStars.forEach(s => {
            const tile = s.closest('.tile');
            const r = tile.dataset.r, c = tile.dataset.c;
            if (this.grid[r][c].starCollected) s.classList.add('collected');
            else s.classList.remove('collected');
        });
    }

    movePiece(fromR, fromC, toR, toC) {
        if (!this.timerStarted) {
            this.timerStarted = true;
            this.startTimer();
        }

        const piece = this.grid[fromR][fromC];
        this.grid[toR][toC] = piece;
        this.grid[fromR][fromC] = { type: 'empty' };
        
        this.moves++;
        document.getElementById('moves-count').textContent = this.moves;
        this.selectedTile = null;
        
        this.renderBoard();
        this.updatePipeFlow();
        this.checkSolution();
    }

    updatePipeFlow() {
        // Clear previous connection status
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const el = document.querySelector(`.tile[data-r="${r}"][data-c="${c}"]`);
                if (el) el.classList.remove('connected-to-start');
            }
        }

        // Trace from start
        let currentR = this.startPos.r;
        let currentC = this.startPos.c;
        let currentDir = this.grid[currentR][currentC].dirs[0]; 
        
        const startEl = document.querySelector(`.tile[data-r="${currentR}"][data-c="${currentC}"]`);
        if (startEl) startEl.classList.add('connected-to-start');

        while (true) {
            let nextR = currentR;
            let nextC = currentC;
            if (currentDir === 0) nextR--;
            if (currentDir === 1) nextC++;
            if (currentDir === 2) nextR++;
            if (currentDir === 3) nextC--;

            if (nextR < 0 || nextR >= this.size || nextC < 0 || nextC >= this.size) break;

            let nextTile = this.grid[nextR][nextC];
            if (nextTile.type === 'empty' || nextTile.type === 'metal') break;

            let requiredInDir = this.getOppositeDir(currentDir);
            if (!nextTile.dirs || !nextTile.dirs.includes(requiredInDir)) break;

            const nextEl = document.querySelector(`.tile[data-r="${nextR}"][data-c="${nextC}"]`);
            if (nextEl) nextEl.classList.add('connected-to-start');

            if (nextTile.type === 'end') break;

            currentR = nextR;
            currentC = nextC;
            currentDir = nextTile.dirs[0] === requiredInDir ? nextTile.dirs[1] : nextTile.dirs[0];
            if (currentDir === undefined) break;
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

        // Highlight path with animated flow
        pathCells.forEach(({r, c}) => {
            const el = document.querySelector(`.tile[data-r="${r}"][data-c="${c}"]`);
            if (el) el.classList.add('win-path');
        });

        setTimeout(() => {
            const modal = document.getElementById('game-modal');
            const modalContent = modal.querySelector(".modal");
            const title = document.getElementById("modal-title");
            const text = document.getElementById("modal-text");
            const icon = document.getElementById("result-icon");

            modalContent.classList.remove("win", "lose");
            modalContent.classList.add("win");

            title.textContent = "VITÓRIA!";
            icon.textContent = "🏆";
            text.textContent = "Incrível! Você resolveu o labirinto e conectou os fluxos!";

            document.getElementById("res-stat-moves").textContent = this.moves;
            document.getElementById("res-stat-time").textContent = this.formatTime(this.timeElapsed);
            
            // Show stars in modal
            const starDisplay = '⭐'.repeat(this.collectedStars) + 'outline_star'.repeat(3 - this.collectedStars)
                .replace(/outline_star/g, '☆');
            text.innerHTML += `<div style="font-size: 1.5rem; margin-top: 10px;">${starDisplay}</div>`;

            modal.classList.add('active');

            const btnHeaderNew = document.getElementById("btn-persistent-new-game");
            if (btnHeaderNew) btnHeaderNew.classList.add('visible');
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

        // Drag/Swipe Support
        this.dragStart = null;
        const container = document.getElementById('board-container');

        container.addEventListener('mousedown', (e) => this.handleDragStart(e));
        container.addEventListener('touchstart', (e) => this.handleDragStart(e), { passive: false });

        window.addEventListener('mouseup', (e) => this.handleDragEnd(e));
        window.addEventListener('touchend', (e) => this.handleDragEnd(e));
    }

    handleDragStart(e) {
        if (this.isGameOver) return;
        const tileEl = e.target.closest('.tile');
        if (!tileEl) return;

        const r = parseInt(tileEl.dataset.r);
        const c = parseInt(tileEl.dataset.c);
        const tile = this.grid[r][c];

        if (tile.type !== 'wood' && tile.type !== 'blank') return;

        const point = e.touches ? e.touches[0] : e;
        this.dragStart = {
            x: point.clientX,
            y: point.clientY,
            r: r,
            c: c
        };
    }

    handleDragEnd(e) {
        if (!this.dragStart) return;

        const point = e.changedTouches ? e.changedTouches[0] : e;
        const dx = point.clientX - this.dragStart.x;
        const dy = point.clientY - this.dragStart.y;
        const threshold = 30;

        if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
            let dr = 0, dc = 0;
            if (Math.abs(dx) > Math.abs(dy)) {
                dc = dx > 0 ? 1 : -1;
            } else {
                dr = dy > 0 ? 1 : -1;
            }

            const targetR = this.dragStart.r + dr;
            const targetC = this.dragStart.c + dc;

            if (targetR >= 0 && targetR < this.size && targetC >= 0 && targetC < this.size) {
                if (this.grid[targetR][targetC].type === 'empty') {
                    this.movePiece(this.dragStart.r, this.dragStart.c, targetR, targetC);
                }
            }
        }

        this.dragStart = null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.labirintoGame = new LabirintoGame();
});
