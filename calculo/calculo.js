/**
 * CÁLCULO - Lógica do Jogo
 */

class CalculoGame {
    constructor() {
        this.difficulty = 'easy';
        this.size = 2; // NxN operands
        this.lives = 3;
        this.timer = 0;
        this.timerInterval = null;
        this.gameStarted = false;
        this.isGameOver = false;
        
        // Grid Data
        this.operands = []; // size x size
        this.rowOps = []; // size x (size - 1)
        this.colOps = []; // (size - 1) x size
        this.rowRes = []; // size
        this.config = {
            easy: { numEqs: 11, fixedRatio: 0.45, useMulDiv: false },
            medium: { numEqs: 15, fixedRatio: 0.35, useMulDiv: false },
            hard: { numEqs: 25, fixedRatio: 0.30, useMulDiv: true }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPanZoom();
        this.startNewGame();
        this.setupDragAndDrop();
    }

    setupPanZoom() {
        this.boardScale = 1;
        this.boardPanX = 0;
        this.boardPanY = 0;
        
        const playArea = document.getElementById('calculo-play-area');
        const gridEl = document.getElementById('calculo-grid');
        
        this.updateBoardTransform = () => {
            gridEl.style.transform = `translate(${this.boardPanX}px, ${this.boardPanY}px) scale(${this.boardScale})`;
        };

        document.getElementById('btn-zoom-in').addEventListener('click', () => {
            this.boardScale = Math.min(2.5, this.boardScale + 0.2);
            this.updateBoardTransform();
        });
        
        document.getElementById('btn-zoom-out').addEventListener('click', () => {
            this.boardScale = Math.max(0.4, this.boardScale - 0.2);
            this.updateBoardTransform();
        });
        
        document.getElementById('btn-zoom-reset').addEventListener('click', () => {
            this.boardScale = 1;
            this.boardPanX = 0;
            this.boardPanY = 0;
            this.updateBoardTransform();
        });

        playArea.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.boardScale = Math.min(Math.max(0.4, this.boardScale + delta), 2.5);
            this.updateBoardTransform();
        }, { passive: false });

        let isPanning = false;
        let startX = 0, startY = 0;
        let initialPanX = 0, initialPanY = 0;

        playArea.addEventListener('pointerdown', (e) => {
            if (e.target.closest('.calc-piece') || e.target.closest('.calc-cell.blank') || e.target.closest('.zoom-controls')) return;
            if (e.button && e.button !== 0) return;
            
            isPanning = true;
            startX = e.clientX;
            startY = e.clientY;
            initialPanX = this.boardPanX;
            initialPanY = this.boardPanY;
            playArea.style.cursor = 'grabbing';
            e.preventDefault();
        });

        window.addEventListener('pointermove', (e) => {
            if (!isPanning) return;
            this.boardPanX = initialPanX + (e.clientX - startX);
            this.boardPanY = initialPanY + (e.clientY - startY);
            this.updateBoardTransform();
        });

        window.addEventListener('pointerup', () => {
            if (isPanning) {
                isPanning = false;
                playArea.style.cursor = 'default';
            }
        });
    }

    setupEventListeners() {
        // Difficulty Selection
        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('.diff-btn');
            if (btn) {
                this.difficulty = btn.dataset.level;
                this.startNewGame();
            }
        });

        // Modals & Controls
        document.getElementById('btn-persistent-new-game').addEventListener('click', () => this.startNewGame());
        document.getElementById('btn-new-game-modal').addEventListener('click', () => {
            document.getElementById('game-modal').classList.remove('active');
            this.startNewGame();
        });

        document.getElementById('btn-help-trigger').addEventListener('click', () => {
            document.getElementById('help-modal').classList.add('active');
        });
        document.getElementById('btn-stats-trigger').addEventListener('click', () => {
            this.updateStatsDisplay();
            document.getElementById('stats-modal').classList.add('active');
        });

        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal-overlay');
                if (modal) modal.classList.remove('active');
            });
        });
    }

    startNewGame() {
        this.isGameOver = false;
        this.timer = 0;
        this.lives = 3;
        this.gameStarted = false;
        
        const cfg = this.config[this.difficulty];
        
        this.stopTimer();
        this.updateTimerDisplay();
        this.updateLivesDisplay();
        
        const btnHeaderNew = document.getElementById("btn-persistent-new-game");
        if (btnHeaderNew) btnHeaderNew.classList.remove("visible");

        this.generatePuzzle(cfg);
        this.renderBoard();
        this.renderBank();

        // Reset Pan/Zoom
        this.boardScale = 1;
        this.boardPanX = 0;
        this.boardPanY = 0;
        if (this.updateBoardTransform) this.updateBoardTransform();
    }

    generatePuzzle(cfg) {
        const gridSize = 45; // Canvas maior para suportar muito mais equações
        let grid = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
        let equations = []; 
        let operandsList = []; 
        
        const getOp = () => {
            if (!cfg.useMulDiv) return Math.random() > 0.5 ? '+' : '-';
            const r = Math.random();
            if (r < 0.3) return '+';
            if (r < 0.6) return '-';
            if (r < 0.8) return '*';
            return '/';
        };

        const getVal = () => Math.floor(Math.random() * 19) + 1; 

        const isValidResult = (res) => Number.isInteger(res) && res >= 0 && res <= 200;

        const canPlace = (r, c, dir, intersectIdx) => {
            if (dir === 0 && (c < 0 || c + 4 >= gridSize)) return false;
            if (dir === 1 && (r < 0 || r + 4 >= gridSize)) return false;

            for (let i = 0; i < 5; i++) {
                let cr = dir === 0 ? r : r + i;
                let cc = dir === 0 ? c + i : c;
                
                if (i === intersectIdx) {
                    if (!grid[cr][cc] || grid[cr][cc].type !== 'operand') return false;
                } else {
                    if (grid[cr][cc] !== null) return false;
                    const neighbors = [ [cr-1, cc], [cr+1, cc], [cr, cc-1], [cr, cc+1] ];
                    for (let [nr, nc] of neighbors) {
                        if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
                            const isPartOfEq = (dir === 0 && nr === r && nc >= c && nc <= c+4) ||
                                               (dir === 1 && nc === c && nr >= r && nr <= r+4);
                            if (!isPartOfEq && grid[nr][nc] !== null) {
                                return false; 
                            }
                        }
                    }
                }
            }
            return true;
        };

        const placeEquation = (r, c, dir, val1, op, val2, res) => {
            const cells = [
                { type: 'operand', value: val1, fixed: false, r: r, c: c },
                { type: 'operator', value: op, fixed: true, r: dir===0?r:r+1, c: dir===0?c+1:c },
                { type: 'operand', value: val2, fixed: false, r: dir===0?r:r+2, c: dir===0?c+2:c },
                { type: 'equals', value: '=', fixed: true, r: dir===0?r:r+3, c: dir===0?c+3:c },
                { type: 'operand', value: res, fixed: false, r: dir===0?r:r+4, c: dir===0?c+4:c }
            ];

            for(let i=0; i<5; i++){
                 cells[i].r = dir === 0 ? r : r + i;
                 cells[i].c = dir === 0 ? c + i : c;
            }

            for (let i = 0; i < 5; i++) {
                let cr = cells[i].r;
                let cc = cells[i].c;
                grid[cr][cc] = cells[i];
                
                if (i === 0 || i === 2 || i === 4) { 
                    let existing = operandsList.find(o => o.r === cr && o.c === cc);
                    if (existing) {
                        if (dir === 0) existing.usedH = true;
                        if (dir === 1) existing.usedV = true;
                    } else {
                        operandsList.push({ r: cr, c: cc, value: cells[i].value, usedH: dir === 0, usedV: dir === 1 });
                    }
                }
            }
            
            equations.push({
                dir, r, c,
                opStr: op,
                op1_r: cells[0].r, op1_c: cells[0].c,
                op2_r: cells[2].r, op2_c: cells[2].c,
                res_r: cells[4].r, res_c: cells[4].c
            });
        };

        let totalEqsPlaced = 0;
        let masterAttempts = 0;
        
        while (totalEqsPlaced < cfg.numEqs && masterAttempts < 10) {
            masterAttempts++;
            grid = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
            equations = [];
            operandsList = [];
            
            let val1 = getVal(), val2 = getVal(), op = getOp();
            let res = eval(`${val1}${op}${val2}`);
            while(!isValidResult(res)) {
                val1 = getVal(); val2 = getVal(); op = getOp();
                res = eval(`${val1}${op}${val2}`);
            }
            
            placeEquation(Math.floor(gridSize / 2), Math.floor(gridSize / 2) - 2, 0, val1, op, val2, res);
            totalEqsPlaced = 1;
            
            let attempts = 0;
            while (totalEqsPlaced < cfg.numEqs && attempts < 1500) {
                attempts++;
                let intersect = operandsList[Math.floor(Math.random() * operandsList.length)];
                let dir = intersect.usedH && !intersect.usedV ? 1 : (!intersect.usedH && intersect.usedV ? 0 : -1);
                if (dir === -1) continue;

                let intersectIdxOptions = [0, 2, 4];
                let intersectIdx = intersectIdxOptions[Math.floor(Math.random() * 3)];
                
                let r = dir === 0 ? intersect.r : intersect.r - intersectIdx;
                let c = dir === 0 ? intersect.c - intersectIdx : intersect.c;

                if (canPlace(r, c, dir, intersectIdx)) {
                    let v1, v2, nop, nres;
                    if (intersectIdx === 0) {
                        v1 = intersect.value; v2 = getVal(); nop = getOp(); nres = eval(`${v1}${nop}${v2}`);
                    } else if (intersectIdx === 2) {
                        v1 = getVal(); v2 = intersect.value; nop = getOp(); nres = eval(`${v1}${nop}${v2}`);
                    } else { 
                        nres = intersect.value;
                        let found = false;
                        for(let i=0; i<100; i++) {
                            v1 = getVal(); nop = getOp();
                            if (nop === '+') v2 = nres - v1;
                            if (nop === '-') v2 = v1 - nres;
                            if (nop === '*') { v2 = nres / v1; if(!Number.isInteger(v2)) continue; }
                            if (nop === '/') { v2 = v1 / nres; if(!Number.isInteger(v2) || v2===0) continue; }
                            
                            if (v2 >= 1 && v2 <= 100) { found = true; break; }
                        }
                        if (!found) continue;
                    }
                    
                    if (isValidResult(nres)) {
                        placeEquation(r, c, dir, v1, nop, v2, nres);
                        totalEqsPlaced++;
                    }
                }
            }
        }

        let minR = gridSize, maxR = -1, minC = gridSize, maxC = -1;
        for(let r=0; r<gridSize; r++){
            for(let c=0; c<gridSize; c++){
                if(grid[r][c] !== null) {
                    if(r < minR) minR = r;
                    if(r > maxR) maxR = r;
                    if(c < minC) minC = c;
                    if(c > maxC) maxC = c;
                }
            }
        }
        
        let trimmedGrid = [];
        for(let r=minR; r<=maxR; r++) {
            trimmedGrid.push(grid[r].slice(minC, maxC + 1));
        }

        equations.forEach(eq => {
            eq.r -= minR; eq.c -= minC;
            eq.op1_r -= minR; eq.op1_c -= minC;
            eq.op2_r -= minR; eq.op2_c -= minC;
            eq.res_r -= minR; eq.res_c -= minC;
        });
        
        operandsList.forEach(op => {
            op.r -= minR; op.c -= minC;
        });

        let numFixed = Math.max(1, Math.floor(operandsList.length * cfg.fixedRatio));
        let fixedCount = 0;

        // Distribuição inteligente: tenta colocar pelo menos 1 dica por equação primeiro
        let shuffledEqs = [...equations].sort(() => Math.random() - 0.5);
        for (let eq of shuffledEqs) {
            if (fixedCount >= numFixed) break;
            
            let ops = [
                operandsList.find(o => o.r === eq.op1_r && o.c === eq.op1_c),
                operandsList.find(o => o.r === eq.op2_r && o.c === eq.op2_c),
                operandsList.find(o => o.r === eq.res_r && o.c === eq.res_c)
            ];
            
            // Se nenhum operando desta equação for fixo ainda
            if (!ops.some(o => o && o.fixed)) {
                let unFixedOps = ops.filter(o => o && !o.fixed);
                if (unFixedOps.length > 0) {
                    let toFix = unFixedOps[Math.floor(Math.random() * unFixedOps.length)];
                    toFix.fixed = true;
                    fixedCount++;
                }
            }
        }

        // Se ainda precisar de mais dicas, distribui aleatoriamente entre os que sobraram
        if (fixedCount < numFixed) {
            let unfixedAll = operandsList.filter(o => !o.fixed).sort(() => Math.random() - 0.5);
            for (let i = 0; i < (numFixed - fixedCount) && i < unfixedAll.length; i++) {
                unfixedAll[i].fixed = true;
            }
        }

        // Aplica o status 'fixed' ao grid final
        operandsList.forEach(op => {
            if (op.fixed) {
                trimmedGrid[op.r][op.c].fixed = true;
            }
        });

        this.grid = trimmedGrid;
        this.equations = equations;
        this.operandsList = operandsList;
    }

    formatOp(op) {
        if (op === '*') return '×';
        if (op === '/') return '÷';
        return op;
    }

    formatOpForEval(op) {
        if (op === '×') return '*';
        if (op === '÷') return '/';
        return op;
    }

    renderBoard() {
        const gridEl = document.getElementById('calculo-grid');
        gridEl.innerHTML = '';
        
        const rows = this.grid.length;
        const cols = this.grid[0].length;
        
        gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        gridEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cellData = this.grid[r][c];
                const cell = document.createElement('div');
                cell.className = 'calc-cell';
                
                if (cellData === null) {
                    cell.classList.add('empty');
                } else {
                    if (cellData.type === 'operand') {
                        if (cellData.fixed) {
                            cell.classList.add('fixed-operand');
                            cell.textContent = cellData.value;
                        } else {
                            cell.classList.add('blank');
                            cell.dataset.r = r;
                            cell.dataset.c = c;
                        }
                    } else if (cellData.type === 'operator') {
                        cell.classList.add('operator');
                        cell.textContent = this.formatOp(cellData.value);
                    } else if (cellData.type === 'equals') {
                        cell.classList.add('equals');
                        cell.textContent = '=';
                    } else if (cellData.type === 'result') {
                        cell.classList.add('result');
                        cell.textContent = cellData.value;
                    }
                }
                
                gridEl.appendChild(cell);
            }
        }
    }

    renderBank() {
        const bank = document.getElementById('calc-bank');
        bank.innerHTML = '';
        
        let pieces = [];
        for(let r=0; r<this.grid.length; r++){
            for(let c=0; c<this.grid[r].length; c++){
                let cellData = this.grid[r][c];
                if(cellData && cellData.type === 'operand' && !cellData.fixed) {
                    pieces.push(cellData.value);
                }
            }
        }
        
        pieces.sort(() => Math.random() - 0.5);
        
        pieces.forEach((val, i) => {
            const p = document.createElement('div');
            p.className = 'calc-piece';
            p.textContent = val;
            p.dataset.id = i;
            bank.appendChild(p);
        });
    }

    setupDragAndDrop() {
        let activePiece = null;
        let clone = null;
        let offsetX = 0, offsetY = 0;
        let isDragging = false;
        let dragStartX = 0, dragStartY = 0;
        
        this.selectedPiece = null;
        this.selectedBlank = null;
        this.justDragged = false;

        const moveClone = (x, y) => {
            clone.style.left = `${x - offsetX}px`;
            clone.style.top = `${y - offsetY}px`;
        };

        const clearSelection = () => {
            if (this.selectedPiece) this.selectedPiece.classList.remove('selected');
            if (this.selectedBlank) this.selectedBlank.classList.remove('selected');
            this.selectedPiece = null;
            this.selectedBlank = null;
        };

        const moveToBlank = (piece, blank) => {
            if (!this.gameStarted) {
                this.gameStarted = true;
                this.startTimer();
            }
            
            const existingPiece = blank.querySelector('.calc-piece');
            if (existingPiece && existingPiece !== piece) {
                document.getElementById('calc-bank').appendChild(existingPiece);
            }
            blank.appendChild(piece);
            this.validateMove(piece, blank);
        };

        document.addEventListener('click', (e) => {
            if (this.isGameOver || this.justDragged) return;

            const blank = e.target.closest('.calc-cell.blank');
            const piece = e.target.closest('.calc-piece');

            if (blank && !piece) {
                // Clicou num espaço vazio
                if (this.selectedPiece) {
                    moveToBlank(this.selectedPiece, blank);
                    clearSelection();
                } else {
                    clearSelection();
                    this.selectedBlank = blank;
                    blank.classList.add('selected');
                }
            } else if (piece) {
                // Clicou numa peça
                if (this.selectedBlank) {
                    moveToBlank(piece, this.selectedBlank);
                    clearSelection();
                } else {
                    clearSelection();
                    this.selectedPiece = piece;
                    piece.classList.add('selected');
                }
            } else if (!e.target.closest('.game-info') && !e.target.closest('.modal-overlay') && !e.target.closest('header')) {
                // Clicou fora, mas não em controles, limpa a seleção
                clearSelection();
            }
        });

        document.addEventListener('pointerdown', (e) => {
            if (this.isGameOver) return;
            const piece = e.target.closest('.calc-piece');
            if (!piece) return;
            
            // Ignora se não for botão esquerdo/touch
            if (e.button && e.button !== 0) return;
            
            e.preventDefault();
            activePiece = piece;
            isDragging = false;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            this.justDragged = false;
            
            const rect = piece.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        });

        document.addEventListener('pointermove', (e) => {
            if (!activePiece) return;
            
            if (!isDragging && (Math.abs(e.clientX - dragStartX) > 5 || Math.abs(e.clientY - dragStartY) > 5)) {
                isDragging = true;
                clearSelection();

                clone = activePiece.cloneNode(true);
                clone.classList.add('dragging-clone');
                document.body.appendChild(clone);
                
                activePiece.classList.add('invisible');
                
                if (!this.gameStarted) {
                    this.gameStarted = true;
                    this.startTimer();
                }
                
                document.querySelectorAll('.calc-cell.blank').forEach(b => b.classList.add('highlight'));
            }

            if (isDragging && clone) {
                moveClone(e.clientX, e.clientY);
            }
        });

        document.addEventListener('pointerup', (e) => {
            if (!activePiece) return;
            
            if (isDragging && clone) {
                this.justDragged = true;
                setTimeout(() => this.justDragged = false, 100);

                document.querySelectorAll('.calc-cell.blank').forEach(b => b.classList.remove('highlight'));
                
                clone.style.display = 'none';
                const target = document.elementFromPoint(e.clientX, e.clientY);
                clone.style.display = '';
                
                const dropZone = target ? target.closest('.calc-cell.blank') : null;
                const bankZone = target ? target.closest('.calculo-bank-area') : null;
                
                activePiece.classList.remove('invisible');
                
                if (dropZone) {
                    moveToBlank(activePiece, dropZone);
                } else if (bankZone || (target && target.closest('.calculo-main-layout'))) {
                    document.getElementById('calc-bank').appendChild(activePiece);
                }
                
                clone.remove();
                clone = null;
            } else {
                // Foi só um clique, o evento 'click' nativo vai cuidar disso
            }
            
            activePiece = null;
        });
    }

    validateMove(piece, dropZone) {
        const r = parseInt(dropZone.dataset.r);
        const c = parseInt(dropZone.dataset.c);
        
        let errorFound = false;

        const affectedEqs = this.equations.filter(eq => 
            (eq.op1_r === r && eq.op1_c === c) || (eq.op2_r === r && eq.op2_c === c) || (eq.res_r === r && eq.res_c === c)
        );

        affectedEqs.forEach(eq => {
            const getVal = (r, c) => {
                const cellData = this.grid[r][c];
                if (cellData.fixed) return cellData.value;
                const cellEl = document.querySelector(`.calc-cell.blank[data-r="${r}"][data-c="${c}"]`);
                const p = cellEl ? cellEl.querySelector('.calc-piece') : null;
                return p ? parseInt(p.textContent) : null;
            };

            const val1 = getVal(eq.op1_r, eq.op1_c);
            const val2 = getVal(eq.op2_r, eq.op2_c);
            const resVal = getVal(eq.res_r, eq.res_c);

            if (val1 !== null && val2 !== null && resVal !== null) {
                let evalRes = eval(`${val1}${eq.opStr}${val2}`);
                if (evalRes !== resVal) {
                    errorFound = true;
                }
            }
        });

        if (errorFound) {
            dropZone.classList.add('error-flash');
            setTimeout(() => dropZone.classList.remove('error-flash'), 800);
            document.getElementById('calc-bank').appendChild(piece);
            this.loseLife();
        } else {
            if (document.querySelectorAll('#calc-bank .calc-piece').length === 0) {
                this.winGame();
            }
        }
    }

    loseLife() {
        this.lives--;
        this.updateLivesDisplay();
        if (this.lives <= 0) this.gameOver(false);
    }

    updateLivesDisplay() {
        const hearts = document.querySelectorAll('.heart-icon');
        hearts.forEach((h, i) => {
            if (i >= this.lives) h.classList.add('lost');
            else h.classList.remove('lost');
        });
    }

    winGame() {
        this.gameOver(true);
    }

    gameOver(won) {
        this.isGameOver = true;
        this.stopTimer();
        this.saveStats(won);

        setTimeout(() => {
            const modal = document.getElementById('game-modal');
            const modalContent = modal.querySelector(".modal");
            const title = document.getElementById("modal-title");
            const text = document.getElementById("modal-text");
            const icon = document.getElementById("result-icon");

            modalContent.classList.remove("win", "lose");
            
            if (won) {
                modalContent.classList.add("win");
                title.textContent = "VITÓRIA!";
                icon.textContent = "🏆";
                text.textContent = "Genial! Você completou todas as equações matemáticas!";
            } else {
                modalContent.classList.add("lose");
                title.textContent = "GAME OVER";
                icon.textContent = "💔";
                text.textContent = "Suas vidas acabaram! Atenção aos sinais e à ordem das operações.";
            }

            document.getElementById("res-stat-time").textContent = this.formatTime(this.timer);
            modal.classList.add('active');
            
            const btnHeaderNew = document.getElementById("btn-persistent-new-game");
            if (btnHeaderNew) btnHeaderNew.classList.add('visible');
        }, 500);
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    updateTimerDisplay() {
        const display = document.getElementById('game-timer');
        if (display) display.textContent = this.formatTime(this.timer);
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    saveStats(won) {
        let stats = JSON.parse(localStorage.getItem('calculo_stats')) || { played: 0, wins: 0 };
        stats.played++;
        if (won) stats.wins++;
        localStorage.setItem('calculo_stats', JSON.stringify(stats));
    }

    updateStatsDisplay() {
        let stats = JSON.parse(localStorage.getItem('calculo_stats')) || { played: 0, wins: 0 };
        document.getElementById('stat-played').textContent = stats.played;
        const winPct = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
        document.getElementById('stat-wins').textContent = winPct + '%';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.calculoGame = new CalculoGame();
});
