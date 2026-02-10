import { CONFIG } from './config';
import { Piece, GameState, Difficulty } from './types';
import { AudioManager } from './utils/audio';
import { Renderer } from './utils/renderer';
import { getSpeed, getDifficultyConfig, calculateLevel } from './difficulty';
import {
    saveGameRecord,
    getGameRecords,
    getVictoryCount,
    clearGameRecords,
    formatDuration,
    formatTimestamp
} from './utils/records';

export class TetrisGame {
    private state: GameState;
    private renderer: Renderer;
    private audio: AudioManager;
    private gameInterval: number | null = null;
    private dropInterval: number | null = null;
    private gameStartTime: number = 0; // 游戏开始时间

    private scoreElement: HTMLElement;
    private levelElement: HTMLElement;
    private difficultyNameElement: HTMLElement;
    private finalScoreElement: HTMLElement;
    private finalLevelElement: HTMLElement;
    private finalDifficultyElement: HTMLElement;
    private gameOverElement: HTMLElement;
    private startBtn: HTMLButtonElement;
    private resetBtn: HTMLButtonElement;
    private pauseBtn: HTMLButtonElement;
    private difficultyButtons: NodeListOf<HTMLButtonElement>;

    constructor() {
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        const nextCanvas = document.getElementById('nextCanvas') as HTMLCanvasElement;

        this.renderer = new Renderer(canvas, nextCanvas);
        this.audio = new AudioManager();

        this.scoreElement = document.getElementById('score')!;
        this.levelElement = document.getElementById('level')!;
        this.difficultyNameElement = document.getElementById('difficultyName')!;
        this.finalScoreElement = document.getElementById('finalScore')!;
        this.finalLevelElement = document.getElementById('finalLevel')!;
        this.finalDifficultyElement = document.getElementById('finalDifficulty')!;
        this.gameOverElement = document.getElementById('gameOver')!;
        this.startBtn = document.getElementById('startBtn') as HTMLButtonElement;
        this.resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;
        this.pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;
        this.difficultyButtons = document.querySelectorAll('.difficulty-btn');

        this.state = this.createInitialState();
        this.setupEventListeners();
        this.draw();
    }

    private createInitialState(): GameState {
        return {
            board: Array.from({ length: CONFIG.rows }, () => Array(CONFIG.cols).fill(0)),
            currentPiece: null,
            nextPiece: null,
            score: 0,
            level: 1,
            isPaused: false,
            isGameOver: false,
            isDropping: false,
            difficulty: Difficulty.NORMAL,
            isVictory: false
        };
    }

    private createPiece(): Piece {
        const type = Math.floor(Math.random() * (CONFIG.shapes.length - 1)) + 1;
        const shape = CONFIG.shapes[type];
        return {
            type,
            x: Math.floor((CONFIG.cols - shape[0].length) / 2),
            y: 0
        };
    }

    private collision(piece: Piece, offsetX: number = 0, offsetY: number = 0): boolean {
        const shape = CONFIG.shapes[piece.type];

        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = piece.x + col + offsetX;
                    const newY = piece.y + row + offsetY;

                    if (newX < 0 || newX >= CONFIG.cols || newY >= CONFIG.rows) {
                        return true;
                    }

                    if (newY >= 0 && this.state.board[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private mergePiece(): void {
        if (!this.state.currentPiece) return;

        const shape = CONFIG.shapes[this.state.currentPiece.type];
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const boardY = this.state.currentPiece.y + row;
                    const boardX = this.state.currentPiece.x + col;
                    if (boardY >= 0) {
                        this.state.board[boardY][boardX] = this.state.currentPiece.type;
                    }
                }
            }
        }
    }

    private clearLines(): void {
        let linesCleared = 0;

        for (let row = CONFIG.rows - 1; row >= 0; row--) {
            if (this.state.board[row].every(cell => cell !== 0)) {
                this.state.board.splice(row, 1);
                this.state.board.unshift(Array(CONFIG.cols).fill(0));
                linesCleared++;
                row++;
            }
        }

        if (linesCleared > 0) {
            this.audio.playClearSound();
            const points = [0, 100, 300, 500, 800];
            const config = getDifficultyConfig(this.state.difficulty);
            // 应用难度分数倍率
            this.state.score += Math.floor(points[linesCleared] * this.state.level * config.scoreMultiplier);
            this.updateScore();

            // 使用新的等级计算方法
            const newLevel = calculateLevel(this.state.difficulty, this.state.score);
            if (newLevel !== this.state.level) {
                this.state.level = newLevel;
                this.updateLevel();

                // 检查是否达到 50 级（通关）
                if (this.state.level >= 50) {
                    this.victory();
                }
            }
        }
    }

    moveLeft(): void {
        if (!this.state.currentPiece) return;

        if (!this.collision(this.state.currentPiece, -1, 0)) {
            this.state.currentPiece.x--;
            this.audio.playMoveSound();
        }
    }

    moveRight(): void {
        if (!this.state.currentPiece) return;

        if (!this.collision(this.state.currentPiece, 1, 0)) {
            this.state.currentPiece.x++;
            this.audio.playMoveSound();
        }
    }

    rotate(): void {
        if (!this.state.currentPiece) return;

        const oldType = this.state.currentPiece.type;
        const shape = CONFIG.shapes[oldType];
        const newShape = shape[0].map((_, i) => shape.map(row => row[i]).reverse());

        CONFIG.shapes[oldType] = newShape;

        if (this.collision(this.state.currentPiece)) {
            CONFIG.shapes[oldType] = shape;
        } else {
            this.audio.playRotateSound();
        }
    }

    moveDown(): void {
        if (!this.state.currentPiece) return;

        if (!this.collision(this.state.currentPiece, 0, 1)) {
            this.state.currentPiece.y++;
        } else {
            this.audio.playLandSound();
            this.mergePiece();
            this.clearLines();

            this.state.currentPiece = this.state.nextPiece;
            this.state.nextPiece = this.createPiece();
            this.renderer.drawNextPiece(this.state.nextPiece);

            if (this.state.currentPiece && this.collision(this.state.currentPiece)) {
                this.gameOver();
            }
        }
    }

    hardDrop(): void {
        if (!this.state.currentPiece) return;

        while (!this.collision(this.state.currentPiece, 0, 1)) {
            this.state.currentPiece.y++;
            this.state.score += 2;
        }
        this.updateScore();
        this.audio.playLandSound();
        this.mergePiece();
        this.clearLines();

        this.state.currentPiece = this.state.nextPiece;
        this.state.nextPiece = this.createPiece();
        this.renderer.drawNextPiece(this.state.nextPiece);

        if (this.state.currentPiece && this.collision(this.state.currentPiece)) {
            this.gameOver();
        }
    }

    startFastDrop(): void {
        if (this.state.isDropping || this.state.isPaused || this.state.isGameOver) return;

        this.state.isDropping = true;
        this.dropInterval = window.setInterval(() => {
            if (!this.state.isPaused && !this.state.isGameOver) {
                this.moveDown();
                this.state.score += 1;
                this.updateScore();
                this.draw();
            }
        }, 50);
    }

    stopFastDrop(): void {
        if (this.dropInterval) {
            clearInterval(this.dropInterval);
            this.dropInterval = null;
            this.state.isDropping = false;
        }
    }

    private updateScore(): void {
        this.scoreElement.textContent = this.state.score.toString();
    }

    private updateLevel(): void {
        this.levelElement.textContent = this.state.level.toString();

        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            // 使用新的速度曲线算法
            const speed = getSpeed(this.state.difficulty, this.state.level);
            this.gameInterval = window.setInterval(() => this.gameLoop(), speed);
        }
    }

    private updateDifficultyDisplay(): void {
        const config = getDifficultyConfig(this.state.difficulty);
        this.difficultyNameElement.textContent = config.name;
    }

    setDifficulty(difficulty: Difficulty): void {
        if (!this.state.isGameOver && this.gameInterval) {
            // 游戏进行中不允许切换难度
            return;
        }
        this.state.difficulty = difficulty;
        this.updateDifficultyDisplay();

        // 更新难度按钮状态
        this.difficultyButtons.forEach(btn => {
            if (btn.dataset.difficulty === difficulty) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    private gameLoop(): void {
        if (!this.state.isPaused && !this.state.isGameOver) {
            this.moveDown();
            this.draw();
        }
    }

    private draw(): void {
        this.renderer.drawBoard(this.state.board);
        if (this.state.currentPiece) {
            this.renderer.drawPiece(this.state.currentPiece);
        }
    }

    start(): void {
        // 先清除旧的 timer，防止多个 interval 叠加
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        this.stopFastDrop();

        const currentDifficulty = this.state.difficulty;
        this.state = this.createInitialState();
        this.state.difficulty = currentDifficulty;

        this.updateScore();
        this.updateLevel();
        this.updateDifficultyDisplay();

        // 更新难度按钮高亮状态
        this.difficultyButtons.forEach(btn => {
            if (btn.dataset.difficulty === currentDifficulty) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        this.state.currentPiece = this.createPiece();
        this.state.nextPiece = this.createPiece();
        this.renderer.drawNextPiece(this.state.nextPiece);

        this.closeModal('gameOver');
        this.startBtn.disabled = true;
        this.resetBtn.disabled = false;
        this.pauseBtn.disabled = false;

        // 禁用难度选择按钮
        this.difficultyButtons.forEach(btn => btn.disabled = true);

        // 使用新的速度计算
        const speed = getSpeed(this.state.difficulty, this.state.level);
        this.gameInterval = window.setInterval(() => this.gameLoop(), speed);

        // 记录游戏开始时间
        this.gameStartTime = Date.now();

        this.draw();
    }

    pause(): void {
        this.state.isPaused = !this.state.isPaused;
        this.pauseBtn.textContent = this.state.isPaused ? '继续' : '暂停';
    }

    private gameOver(): void {
        this.state.isGameOver = true;
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
        }
        this.stopFastDrop();
        this.audio.playGameOverSound();

        // 计算游戏时长
        const duration = Math.floor((Date.now() - this.gameStartTime) / 1000);

        // 保存游戏记录（失败）
        saveGameRecord({
            difficulty: this.state.difficulty,
            score: this.state.score,
            level: this.state.level,
            isVictory: false,
            duration
        });

        const config = getDifficultyConfig(this.state.difficulty);
        this.finalDifficultyElement.textContent = config.name;
        this.finalScoreElement.textContent = this.state.score.toString();
        this.finalLevelElement.textContent = this.state.level.toString();

        // 显示失败信息
        const gameOverTitle = document.getElementById('gameOverTitle')!;
        gameOverTitle.textContent = '游戏结束';
        gameOverTitle.style.color = '#ff4757';

        this.showModal('gameOver');
        this.startBtn.disabled = false;
        this.resetBtn.disabled = true;
        this.pauseBtn.disabled = true;

        // 重新启用难度选择按钮
        this.difficultyButtons.forEach(btn => btn.disabled = false);
    }

    private victory(): void {
        this.state.isGameOver = true;
        this.state.isVictory = true;

        if (this.gameInterval) {
            clearInterval(this.gameInterval);
        }
        this.stopFastDrop();

        // 计算游戏时长
        const duration = Math.floor((Date.now() - this.gameStartTime) / 1000);

        // 保存游戏记录（通关）
        saveGameRecord({
            difficulty: this.state.difficulty,
            score: this.state.score,
            level: this.state.level,
            isVictory: true,
            duration
        });

        const config = getDifficultyConfig(this.state.difficulty);
        this.finalDifficultyElement.textContent = config.name;
        this.finalScoreElement.textContent = this.state.score.toString();
        this.finalLevelElement.textContent = this.state.level.toString();

        // 显示通关信息
        const gameOverTitle = document.getElementById('gameOverTitle')!;
        gameOverTitle.textContent = '🎉 恭喜通关！';
        gameOverTitle.style.color = '#ffd700';

        this.showModal('gameOver');
        this.startBtn.disabled = false;
        this.resetBtn.disabled = true;
        this.pauseBtn.disabled = true;

        // 重新启用难度选择按钮
        this.difficultyButtons.forEach(btn => btn.disabled = false);
    }

    reset(): void {
        // 停止当前游戏
        this.state.isGameOver = true;
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        this.stopFastDrop();

        // 保存当前难度，重置后恢复
        const currentDifficulty = this.state.difficulty;

        // 重置界面
        this.state = this.createInitialState();
        this.state.difficulty = currentDifficulty;
        this.updateScore();
        this.updateLevel();
        this.updateDifficultyDisplay();
        this.draw();

        // 启用开始和难度选择
        this.startBtn.disabled = false;
        this.resetBtn.disabled = true;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = '暂停';
        this.difficultyButtons.forEach(btn => {
            btn.disabled = false;
            if (btn.dataset.difficulty === currentDifficulty) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    private setupEventListeners(): void {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (this.state.isGameOver) return;
            if (this.state.isPaused && e.key !== 'p' && e.key !== 'P') return;

            switch (e.key) {
                case 'ArrowLeft':
                    this.moveLeft();
                    this.draw();
                    break;
                case 'ArrowRight':
                    this.moveRight();
                    this.draw();
                    break;
                case 'ArrowDown':
                    if (!this.state.isDropping) {
                        this.startFastDrop();
                    }
                    break;
                case 'ArrowUp':
                    this.rotate();
                    this.draw();
                    break;
                case ' ':
                    e.preventDefault();
                    this.hardDrop();
                    this.draw();
                    break;
                case 'p':
                case 'P':
                    if (!this.state.isGameOver) this.pause();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowDown') {
                this.stopFastDrop();
            }
        });

        // 虚拟按键事件
        const virtualControls = document.getElementById('virtualControls');
        if (virtualControls) {
            // 使用事件委托
            virtualControls.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const target = (e.target as HTMLElement).closest('.virtual-btn-compact') as HTMLButtonElement;
                if (!target || this.state.isGameOver || this.state.isPaused) return;

                const action = target.dataset.action;
                switch (action) {
                    case 'left':
                        this.moveLeft();
                        this.draw();
                        break;
                    case 'right':
                        this.moveRight();
                        this.draw();
                        break;
                    case 'down':
                        if (!this.state.isDropping) {
                            this.startFastDrop();
                        }
                        break;
                    case 'rotate':
                        this.rotate();
                        this.draw();
                        break;
                    case 'drop':
                        this.hardDrop();
                        this.draw();
                        break;
                }
            }, { passive: false });

            virtualControls.addEventListener('touchend', (e) => {
                e.preventDefault();
                const target = (e.target as HTMLElement).closest('.virtual-btn-compact') as HTMLButtonElement;
                if (!target) return;

                const action = target.dataset.action;
                if (action === 'down') {
                    this.stopFastDrop();
                }
            }, { passive: false });

            // 防止长按导致的上下文菜单
            virtualControls.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        }

        this.startBtn.addEventListener('click', () => this.start());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.pauseBtn.addEventListener('click', () => this.pause());
        document.getElementById('restartBtn')!.addEventListener('click', () => {
            this.closeModal('gameOver');
            this.start();
        });

        // 难度选择按钮事件
        this.difficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const difficulty = btn.dataset.difficulty as Difficulty;
                this.setDifficulty(difficulty);
            });
        });

        // 帮助按钮事件
        document.getElementById('helpBtn')!.addEventListener('click', () => {
            this.showModal('helpModal');
        });

        document.getElementById('closeHelp')!.addEventListener('click', () => {
            this.closeModal('helpModal');
        });

        // 记录按钮事件
        document.getElementById('recordsBtn')!.addEventListener('click', () => {
            this.showRecordsModal();
        });

        document.getElementById('closeRecords')!.addEventListener('click', () => {
            this.closeModal('recordsModal');
        });

        document.getElementById('clearRecordsBtn')!.addEventListener('click', () => {
            if (confirm('确定要清空所有游戏记录吗？')) {
                this.clearRecords();
            }
        });

        // 点击模态框外部关闭
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    private showModal(modalId: string): void {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    }

    private closeModal(modalId: string): void {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }

    private showRecordsModal(): void {
        this.renderRecords('all');
        this.showModal('recordsModal');

        // 设置标签页点击事件
        document.querySelectorAll('.records-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const target = e.target as HTMLButtonElement;
                const difficulty = target.dataset.difficulty as Difficulty | 'all';

                // 更新激活状态
                document.querySelectorAll('.records-tab').forEach(t => t.classList.remove('active'));
                target.classList.add('active');

                // 渲染对应难度的记录
                this.renderRecords(difficulty);
            });
        });
    }

    private renderRecords(filterDifficulty: Difficulty | 'all'): void {
        const records = getGameRecords();
        const filteredRecords = filterDifficulty === 'all'
            ? records
            : records.filter(r => r.difficulty === filterDifficulty);

        const recordsList = document.getElementById('recordsList')!;
        const victoryCountElement = document.getElementById('victoryCount')!;

        // 更新通关次数
        const victoryCount = filterDifficulty === 'all'
            ? getVictoryCount()
            : getVictoryCount(filterDifficulty);
        victoryCountElement.textContent = victoryCount.toString();

        // 渲染记录列表
        if (filteredRecords.length === 0) {
            recordsList.innerHTML = '<div class="empty-records">暂无游戏记录</div>';
            return;
        }

        recordsList.innerHTML = filteredRecords.map(record => {
            const config = getDifficultyConfig(record.difficulty);
            const statusClass = record.isVictory ? 'victory' : 'defeat';
            const statusText = record.isVictory ? '🎉 通关' : '❌ 失败';

            return `
                <div class="record-item ${statusClass}">
                    <div class="record-header">
                        <span class="record-status ${statusClass}">${statusText}</span>
                        <span class="record-time">${formatTimestamp(record.timestamp)}</span>
                    </div>
                    <div class="record-details">
                        <div class="record-detail">
                            <span class="record-detail-label">难度</span>
                            <span class="record-detail-value">${config.name}</span>
                        </div>
                        <div class="record-detail">
                            <span class="record-detail-label">分数</span>
                            <span class="record-detail-value">${record.score}</span>
                        </div>
                        <div class="record-detail">
                            <span class="record-detail-label">等级</span>
                            <span class="record-detail-value">${record.level}</span>
                        </div>
                        <div class="record-detail">
                            <span class="record-detail-label">时长</span>
                            <span class="record-detail-value">${formatDuration(record.duration)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    private clearRecords(): void {
        clearGameRecords();
        this.renderRecords('all');
    }
}
