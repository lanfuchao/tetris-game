import { CONFIG } from './config';
import { Piece, GameState, Difficulty } from './types';
import { AudioManager } from './utils/audio';
import { Renderer } from './utils/renderer';
import { getSpeed, getDifficultyConfig, calculateLevel, DIFFICULTY_CONFIGS } from './difficulty';
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
    private moveLeftInterval: number | null = null;
    private moveRightInterval: number | null = null;
    private rotateInterval: number | null = null;
    private moveLeftTimeout: number | null = null;
    private moveRightTimeout: number | null = null;
    private rotateTimeout: number | null = null;
    private gameStartTime: number = 0; // 游戏开始时间

    private scoreElement: HTMLElement;
    private levelElement: HTMLElement;
    private difficultyNameElement: HTMLElement;
    private finalScoreElement: HTMLElement;
    private finalLevelElement: HTMLElement;
    private finalDifficultyElement: HTMLElement;
    private gameOverElement: HTMLElement;
    private startBtn: HTMLButtonElement;
    private pauseBtn: HTMLButtonElement;
    private difficultyToggle: HTMLButtonElement;

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
        this.pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;
        this.difficultyToggle = document.getElementById('difficultyToggle') as HTMLButtonElement;

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
        let specialProbability = DIFFICULTY_CONFIGS[this.state.difficulty].specialProbability;
        const isSpecialPiece = Math.random() < specialProbability;
        const type = isSpecialPiece ? 8 : Math.floor(Math.random() * 7) + 1;
        const shape = CONFIG.shapes[type];

        return {
            type,
            x: Math.floor((CONFIG.cols - shape[0].length) / 2),
            y: 0,
            isSpecial: isSpecialPiece
        };
    }

    private collision(piece: Piece, offsetX: number = 0, offsetY: number = 0): boolean {
        const shape = CONFIG.shapes[piece.type];

        // 特殊方块的碰撞检测：可以穿透其他方块
        if (piece.isSpecial) {
            for (let row = 0; row < shape.length; row++) {
                for (let col = 0; col < shape[row].length; col++) {
                    if (shape[row][col]) {
                        const newX = piece.x + col + offsetX;
                        const newY = piece.y + row + offsetY;

                        // 检查左右边界
                        if (newX < 0 || newX >= CONFIG.cols) {
                            return true;
                        }

                        // 检查底部边界
                        if (newY >= CONFIG.rows) {
                            return true;
                        }

                        // 特殊方块向下移动：穿透其他方块，直到下方没有空格子
                        if (offsetY > 0) {
                            // 检查是否到达最底行
                            if (newY === CONFIG.rows - 1) {
                                // 到达最底行，停止
                                return true;
                            }
                            // 检查从新位置向下是否还有空格子
                            // 如果下方全是方块（没有空格子了），则停止
                            let hasEmptyBelow = false;
                            for (let checkY = newY + 1; checkY < CONFIG.rows; checkY++) {
                                if (this.state.board[checkY][newX] === 0) {
                                    hasEmptyBelow = true;
                                    break;
                                }
                            }
                            // 如果下方没有空格子了，停止
                            if (!hasEmptyBelow) {
                                return true;
                            }
                            // 否则继续穿透下落
                        }

                        // 水平移动时仍然检查目标位置（不能穿过墙壁般的方块柱）
                        if (offsetX !== 0 && offsetY === 0) {
                            if (newY >= 0 && newY < CONFIG.rows && this.state.board[newY][newX]) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        }

        // 普通方块的碰撞检测
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

        const piece = this.state.currentPiece;
        const shape = CONFIG.shapes[piece.type];

        // 如果是特殊方块，找到它应该停留的位置（穿透到有方块的上方）
        if (piece.isSpecial) {
            for (let row = 0; row < shape.length; row++) {
                for (let col = 0; col < shape[row].length; col++) {
                    if (shape[row][col]) {
                        const x = piece.x + col;
                        let y = piece.y + row;

                        // 向下寻找第一个有方块的位置或底部
                        while (y + 1 < CONFIG.rows && !this.state.board[y + 1][x]) {
                            y++;
                        }

                        // 放置方块
                        if (y >= 0 && y < CONFIG.rows) {
                            this.state.board[y][x] = piece.type;
                        }
                    }
                }
            }
            return;
        }

        // 普通方块的合并逻辑
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

    startMoveLeft(): void {
        if (this.moveLeftInterval || this.state.isPaused || this.state.isGameOver) return;

        // 立即执行一次
        this.moveLeft();
        this.draw();

        // 延迟后开始连续移动
        this.moveLeftTimeout = window.setTimeout(() => {
            if (!this.state.isGameOver && !this.state.isPaused) {
                this.moveLeftInterval = window.setInterval(() => {
                    if (!this.state.isPaused && !this.state.isGameOver) {
                        this.moveLeft();
                        this.draw();
                    }
                }, 100);
            }
        }, 200);
    }

    stopMoveLeft(): void {
        if (this.moveLeftTimeout) {
            clearTimeout(this.moveLeftTimeout);
            this.moveLeftTimeout = null;
        }
        if (this.moveLeftInterval) {
            clearInterval(this.moveLeftInterval);
            this.moveLeftInterval = null;
        }
    }

    startMoveRight(): void {
        if (this.moveRightInterval || this.state.isPaused || this.state.isGameOver) return;

        // 立即执行一次
        this.moveRight();
        this.draw();

        // 延迟后开始连续移动
        this.moveRightTimeout = window.setTimeout(() => {
            if (!this.state.isGameOver && !this.state.isPaused) {
                this.moveRightInterval = window.setInterval(() => {
                    if (!this.state.isPaused && !this.state.isGameOver) {
                        this.moveRight();
                        this.draw();
                    }
                }, 100);
            }
        }, 200);
    }

    stopMoveRight(): void {
        if (this.moveRightTimeout) {
            clearTimeout(this.moveRightTimeout);
            this.moveRightTimeout = null;
        }
        if (this.moveRightInterval) {
            clearInterval(this.moveRightInterval);
            this.moveRightInterval = null;
        }
    }

    startRotate(): void {
        if (this.rotateInterval || this.state.isPaused || this.state.isGameOver) return;

        // 立即执行一次
        this.rotate();
        this.draw();

        // 延迟后开始连续旋转
        this.rotateTimeout = window.setTimeout(() => {
            if (!this.state.isGameOver && !this.state.isPaused) {
                this.rotateInterval = window.setInterval(() => {
                    if (!this.state.isPaused && !this.state.isGameOver) {
                        this.rotate();
                        this.draw();
                    }
                }, 150);
            }
        }, 300);
    }

    stopRotate(): void {
        if (this.rotateTimeout) {
            clearTimeout(this.rotateTimeout);
            this.rotateTimeout = null;
        }
        if (this.rotateInterval) {
            clearInterval(this.rotateInterval);
            this.rotateInterval = null;
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

    toggleDifficulty(): void {
        // 循环切换难度：简单 -> 普通 -> 困难 -> 简单
        const difficulties = [Difficulty.EASY, Difficulty.NORMAL, Difficulty.HARD];
        const currentIndex = difficulties.indexOf(this.state.difficulty);
        const nextIndex = (currentIndex + 1) % difficulties.length;
        this.state.difficulty = difficulties[nextIndex];
        this.updateDifficultyDisplay();
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
        this.stopMoveLeft();
        this.stopMoveRight();
        this.stopRotate();

        const currentDifficulty = this.state.difficulty;
        this.state = this.createInitialState();
        this.state.difficulty = currentDifficulty;

        this.updateScore();
        this.updateLevel();
        this.updateDifficultyDisplay();

        this.state.currentPiece = this.createPiece();
        this.state.nextPiece = this.createPiece();
        this.renderer.drawNextPiece(this.state.nextPiece);

        this.closeModal('gameOver');

        // 开始按钮变为结束按钮
        this.startBtn.textContent = '结束';
        this.startBtn.classList.remove('primary');
        this.startBtn.classList.add('warning');
        this.pauseBtn.disabled = false;

        // 禁用难度选择按钮
        this.difficultyToggle.disabled = true;

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

        // 清空下一个方块显示
        this.renderer.drawNextPiece(null);

        this.showModal('gameOver');

        // 恢复开始按钮
        this.startBtn.textContent = '开始';
        this.startBtn.classList.remove('warning');
        this.startBtn.classList.add('primary');
        this.pauseBtn.disabled = true;

        // 重新启用难度选择按钮
        this.difficultyToggle.disabled = false;
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

        // 清空下一个方块显示
        this.renderer.drawNextPiece(null);

        this.showModal('gameOver');

        // 恢复开始按钮
        this.startBtn.textContent = '开始';
        this.startBtn.classList.remove('warning');
        this.startBtn.classList.add('primary');
        this.pauseBtn.disabled = true;

        // 重新启用难度选择按钮
        this.difficultyToggle.disabled = false;
    }

    reset(): void {
        // 停止当前游戏
        this.state.isGameOver = true;
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        this.stopFastDrop();
        this.stopMoveLeft();
        this.stopMoveRight();
        this.stopRotate();

        // 保存当前难度，重置后恢复
        const currentDifficulty = this.state.difficulty;

        // 重置界面
        this.state = this.createInitialState();
        this.state.difficulty = currentDifficulty;
        this.updateScore();
        this.updateLevel();
        this.updateDifficultyDisplay();
        this.draw();

        // 清空下一个方块显示
        this.renderer.drawNextPiece(null);

        // 恢复开始按钮
        this.startBtn.textContent = '开始';
        this.startBtn.classList.remove('warning');
        this.startBtn.classList.add('primary');
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = '暂停';

        // 重新启用难度选择按钮
        this.difficultyToggle.disabled = false;
    }

    private setupEventListeners(): void {
        // 键盘事件 - keydown 支持长按
        document.addEventListener('keydown', (e) => {
            if (this.state.isGameOver) return;
            if (this.state.isPaused && e.key !== 'p' && e.key !== 'P') return;

            // 防止重复触发（已经在长按中）
            if (e.repeat) return;

            switch (e.key) {
                case 'ArrowLeft':
                    this.startMoveLeft();
                    break;
                case 'ArrowRight':
                    this.startMoveRight();
                    break;
                case 'ArrowDown':
                    if (!this.state.isDropping) {
                        this.startFastDrop();
                    }
                    break;
                case 'ArrowUp':
                    this.startRotate();
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

        // 键盘事件 - keyup 停止长按
        document.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    this.stopMoveLeft();
                    break;
                case 'ArrowRight':
                    this.stopMoveRight();
                    break;
                case 'ArrowDown':
                    this.stopFastDrop();
                    break;
                case 'ArrowUp':
                    this.stopRotate();
                    break;
            }
        });

        // 虚拟按键事件 - 支持长按
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
                        this.startMoveLeft();
                        break;
                    case 'right':
                        this.startMoveRight();
                        break;
                    case 'down':
                        if (!this.state.isDropping) {
                            this.startFastDrop();
                        }
                        break;
                    case 'rotate':
                        this.startRotate();
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
                switch (action) {
                    case 'left':
                        this.stopMoveLeft();
                        break;
                    case 'right':
                        this.stopMoveRight();
                        break;
                    case 'down':
                        this.stopFastDrop();
                        break;
                    case 'rotate':
                        this.stopRotate();
                        break;
                }
            }, { passive: false });

            // 防止长按导致的上下文菜单
            virtualControls.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        }

        // 开始/结束按钮（合并）
        this.startBtn.addEventListener('click', () => {
            if (this.startBtn.textContent === '开始') {
                this.start();
            } else {
                this.reset();
            }
        });

        this.pauseBtn.addEventListener('click', () => this.pause());

        document.getElementById('restartBtn')!.addEventListener('click', () => {
            this.closeModal('gameOver');
            this.start();
        });

        // 难度切换按钮事件
        this.difficultyToggle.addEventListener('click', () => {
            if (this.state.isGameOver || !this.gameInterval) {
                this.toggleDifficulty();
            }
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
