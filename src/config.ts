import { GameConfig, BlockType, Shape } from './types';
import { TROMINO_SHAPES, TETROMINO_SHAPES, PENTOMINO_SHAPES, BLOCK_COLORS } from './blockShapes';

export const CONFIG: GameConfig = {
    cols: 10,
    rows: 20,
    blockSize: 30,
    colors: BLOCK_COLORS,
    shapes: TETROMINO_SHAPES  // 默认使用4格方块
};

// 特殊单格方块（穿透方块）
export const SPECIAL_SINGLE_BLOCK: Shape = [[8]];

// 深拷贝形状数组
function deepCopyShapes(shapes: Shape[]): Shape[] {
    return shapes.map(shape => shape.map(row => [...row]));
}

// 根据方块类型获取对应的形状集合（返回深拷贝）
export function getShapesForBlockType(blockType: BlockType): Shape[] {
    switch (blockType) {
        case BlockType.TROMINO:
            return deepCopyShapes(TROMINO_SHAPES);
        case BlockType.TETROMINO:
            return deepCopyShapes(TETROMINO_SHAPES);
        case BlockType.PENTOMINO:
            return deepCopyShapes(PENTOMINO_SHAPES);
        default:
            return deepCopyShapes(TETROMINO_SHAPES);
    }
}

// 获取指定方块类型的普通方块数量（不包括索引0）
export function getNormalBlockCount(blockType: BlockType): number {
    return getShapesForBlockType(blockType).length - 1;
}
