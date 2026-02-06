import { CONFIG } from '../config';
import { Piece } from '../types';

export class Renderer {
    private ctx: CanvasRenderingContext2D;
    private nextCtx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement, nextCanvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d')!;
        this.nextCtx = nextCanvas.getContext('2d')!;
    }

    drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
        ctx.fillStyle = color;
        ctx.fillRect(x * CONFIG.blockSize, y * CONFIG.blockSize, CONFIG.blockSize, CONFIG.blockSize);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.strokeRect(x * CONFIG.blockSize, y * CONFIG.blockSize, CONFIG.blockSize, CONFIG.blockSize);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(
            x * CONFIG.blockSize + 2,
            y * CONFIG.blockSize + 2,
            CONFIG.blockSize - 4,
            CONFIG.blockSize - 4
        );
    }

    drawBoard(board: number[][]): void {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, CONFIG.cols * CONFIG.blockSize, CONFIG.rows * CONFIG.blockSize);

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
                        CONFIG.colors[piece.type]!
                    );
                }
            }
        }
    }

    drawNextPiece(nextPiece: Piece | null): void {
        this.nextCtx.fillStyle = '#000';
        this.nextCtx.fillRect(0, 0, 120, 120);

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
                            CONFIG.colors[nextPiece.type]!
                        );
                    }
                }
            }
        }
    }
}
