import { CONFIG } from '../config';
import { Piece } from '../types';

export class Renderer {
    private ctx: CanvasRenderingContext2D;
    private nextCtx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement, nextCanvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d')!;
        this.nextCtx = nextCanvas.getContext('2d')!;
    }

    drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, isSpecial: boolean = false): void {
        // 特殊方块使用特别的样式
        if (isSpecial) {
            this.drawSpecialBlock(ctx, x, y, color);
            return;
        }

        // 普通方块的绘制逻辑
        const blockX = x * CONFIG.blockSize;
        const blockY = y * CONFIG.blockSize;
        const size = CONFIG.blockSize;

        // 保存上下文状态
        ctx.save();

        // 1. 绘制外发光效果（水晶光晕）
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // 2. 绘制主体渐变（从中心向外）
        const gradient = ctx.createRadialGradient(
            blockX + size * 0.3,
            blockY + size * 0.3,
            0,
            blockX + size * 0.5,
            blockY + size * 0.5,
            size * 0.9
        );

        // 解析颜色并创建亮色变体
        const brightColor = this.brightenColor(color, 40);
        gradient.addColorStop(0, brightColor);
        gradient.addColorStop(0.6, color);
        gradient.addColorStop(1, this.darkenColor(color, 30));

        ctx.fillStyle = gradient;
        ctx.fillRect(blockX, blockY, size, size);

        // 清除阴影以避免影响后续绘制
        ctx.shadowBlur = 0;

        // 3. 绘制深色边框（水晶边缘）
        ctx.strokeStyle = this.darkenColor(color, 50);
        ctx.lineWidth = 2;
        ctx.strokeRect(blockX + 1, blockY + 1, size - 2, size - 2);

        // 4. 左上角高光（水晶反光）
        const highlightGradient = ctx.createLinearGradient(
            blockX,
            blockY,
            blockX + size * 0.5,
            blockY + size * 0.5
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.moveTo(blockX + 3, blockY + 3);
        ctx.lineTo(blockX + size * 0.4, blockY + 3);
        ctx.lineTo(blockX + 3, blockY + size * 0.4);
        ctx.closePath();
        ctx.fill();

        // 5. 内部高光条（垂直）
        const innerHighlight = ctx.createLinearGradient(
            blockX + size * 0.2,
            blockY,
            blockX + size * 0.35,
            blockY
        );
        innerHighlight.addColorStop(0, 'rgba(255, 255, 255, 0)');
        innerHighlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        innerHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = innerHighlight;
        ctx.fillRect(blockX + size * 0.2, blockY + 4, size * 0.15, size - 8);

        // 6. 右下角阴影（水晶深度）
        const shadowGradient = ctx.createLinearGradient(
            blockX + size * 0.6,
            blockY + size * 0.6,
            blockX + size - 2,
            blockY + size - 2
        );
        shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');

        ctx.fillStyle = shadowGradient;
        ctx.beginPath();
        ctx.moveTo(blockX + size - 3, blockY + size * 0.6);
        ctx.lineTo(blockX + size - 3, blockY + size - 3);
        ctx.lineTo(blockX + size * 0.6, blockY + size - 3);
        ctx.closePath();
        ctx.fill();

        // 恢复上下文状态
        ctx.restore();
    }

    // 辅助函数：使颜色变亮
    private brightenColor(color: string, amount: number): string {
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount);
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount);
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount);
        return `rgb(${r}, ${g}, ${b})`;
    }

    // 辅助函数：使颜色变暗
    private darkenColor(color: string, amount: number): string {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
        return `rgb(${r}, ${g}, ${b})`;
    }

    drawBoard(board: number[][]): void {
        // 绘制深色背景
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, CONFIG.cols * CONFIG.blockSize, CONFIG.rows * CONFIG.blockSize);

        // 绘制细微网格效果
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.lineWidth = 1;

        for (let row = 0; row <= CONFIG.rows; row++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, row * CONFIG.blockSize);
            this.ctx.lineTo(CONFIG.cols * CONFIG.blockSize, row * CONFIG.blockSize);
            this.ctx.stroke();
        }

        for (let col = 0; col <= CONFIG.cols; col++) {
            this.ctx.beginPath();
            this.ctx.moveTo(col * CONFIG.blockSize, 0);
            this.ctx.lineTo(col * CONFIG.blockSize, CONFIG.rows * CONFIG.blockSize);
            this.ctx.stroke();
        }

        // 绘制方块
        for (let row = 0; row < CONFIG.rows; row++) {
            for (let col = 0; col < CONFIG.cols; col++) {
                if (board[row][col]) {
                    this.drawBlock(this.ctx, col, row, CONFIG.colors[board[row][col]]!);
                }
            }
        }
    }

    drawPiece(piece: Piece, context?: CanvasRenderingContext2D, offsetX: number = 0, offsetY: number = 0): void {
        const ctx = context || this.ctx;
        const shape = CONFIG.shapes[piece.type];

        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    this.drawBlock(
                        ctx,
                        piece.x + col + offsetX,
                        piece.y + row + offsetY,
                        CONFIG.colors[piece.type]!,
                        piece.isSpecial || false
                    );
                }
            }
        }
    }

    drawNextPiece(nextPiece: Piece | null): void {
        // 深色背景
        this.nextCtx.fillStyle = '#0a0a0a';
        this.nextCtx.fillRect(0, 0, 120, 120);

        // 绘制细微网格
        this.nextCtx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        this.nextCtx.lineWidth = 1;

        for (let i = 0; i <= 4; i++) {
            this.nextCtx.beginPath();
            this.nextCtx.moveTo(0, i * CONFIG.blockSize);
            this.nextCtx.lineTo(120, i * CONFIG.blockSize);
            this.nextCtx.stroke();

            this.nextCtx.beginPath();
            this.nextCtx.moveTo(i * CONFIG.blockSize, 0);
            this.nextCtx.lineTo(i * CONFIG.blockSize, 120);
            this.nextCtx.stroke();
        }

        if (nextPiece) {
            const shape = CONFIG.shapes[nextPiece.type];
            const offsetX = (4 - shape[0].length) / 2;
            const offsetY = (4 - shape.length) / 2;

            for (let row = 0; row < shape.length; row++) {
                for (let col = 0; col < shape[row].length; col++) {
                    if (shape[row][col]) {
                        this.drawBlock(
                            this.nextCtx,
                            col + offsetX,
                            row + offsetY,
                            CONFIG.colors[nextPiece.type]!,
                            nextPiece.isSpecial || false
                        );
                    }
                }
            }
        }
    }

    // 绘制特殊水晶方块
    private drawSpecialBlock(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
        const blockX = x * CONFIG.blockSize;
        const blockY = y * CONFIG.blockSize;
        const size = CONFIG.blockSize;
        const centerX = blockX + size / 2;
        const centerY = blockY + size / 2;

        ctx.save();

        // 1. 强烈的外发光（多层光晕）
        for (let i = 3; i > 0; i--) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 20 * i;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.6);
            glowGradient.addColorStop(0, color);
            glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

            ctx.fillStyle = glowGradient;
            ctx.fillRect(blockX, blockY, size, size);
        }

        ctx.shadowBlur = 0;

        // 2. 钻石形状主体
        ctx.beginPath();
        ctx.moveTo(centerX, blockY + 3);           // 顶部
        ctx.lineTo(blockX + size - 3, centerY);    // 右侧
        ctx.lineTo(centerX, blockY + size - 3);    // 底部
        ctx.lineTo(blockX + 3, centerY);           // 左侧
        ctx.closePath();

        // 3. 钻石渐变填充
        const diamondGradient = ctx.createRadialGradient(
            centerX - size * 0.2,
            centerY - size * 0.2,
            0,
            centerX,
            centerY,
            size * 0.6
        );
        diamondGradient.addColorStop(0, '#FFFFFF');
        diamondGradient.addColorStop(0.3, '#FFED4E');
        diamondGradient.addColorStop(0.7, '#FFD700');
        diamondGradient.addColorStop(1, '#FFA500');

        ctx.fillStyle = diamondGradient;
        ctx.fill();

        // 4. 钻石边框
        ctx.strokeStyle = '#FF8C00';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 5. 内部高光线
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - size * 0.15, blockY + size * 0.3);
        ctx.lineTo(centerX - size * 0.15, blockY + size * 0.5);
        ctx.stroke();

        // 6. 顶部亮点
        const highlightGradient = ctx.createRadialGradient(
            centerX,
            blockY + size * 0.25,
            0,
            centerX,
            blockY + size * 0.25,
            size * 0.2
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.arc(centerX, blockY + size * 0.25, size * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // 7. 底部反光
        const reflectionGradient = ctx.createLinearGradient(
            centerX,
            blockY + size * 0.7,
            centerX,
            blockY + size - 3
        );
        reflectionGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        reflectionGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = reflectionGradient;
        ctx.beginPath();
        ctx.moveTo(centerX, blockY + size * 0.7);
        ctx.lineTo(blockX + size * 0.7, blockY + size - 3);
        ctx.lineTo(blockX + size * 0.3, blockY + size - 3);
        ctx.closePath();
        ctx.fill();

        // 8. 星光效果
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.5;
        const sparkleSize = size * 0.15;

        // 横向星光
        ctx.beginPath();
        ctx.moveTo(centerX - sparkleSize, centerY);
        ctx.lineTo(centerX + sparkleSize, centerY);
        ctx.stroke();

        // 纵向星光
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - sparkleSize);
        ctx.lineTo(centerX, centerY + sparkleSize);
        ctx.stroke();

        ctx.restore();
    }
}
