import { Difficulty, DifficultyConfig } from './types';

/**
 * 难度配置
 * 使用指数衰减曲线来计算速度，更符合游戏体验
 */
export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
    [Difficulty.EASY]: {
        name: '简单',
        description: '适合新手，速度较慢',
        initialSpeed: 1000,
        // 指数衰减公式: speed = initialSpeed * 0.92^(level-1)
        // 速度下降较慢，最低到 200ms
        speedCurve: (level: number) => {
            const speed = 1000 * Math.pow(0.92, level - 1);
            return Math.max(200, Math.round(speed));
        },
        scoreMultiplier: 1.0,
        levelUpThreshold: 1200, // 每 1200 分升一级
        specialProbability: 0.05 // 5% 概率生成特殊单格方块（type 8）
    },

    [Difficulty.NORMAL]: {
        name: '普通',
        description: '标准难度，平衡体验',
        initialSpeed: 800,
        // 指数衰减公式: speed = initialSpeed * 0.88^(level-1)
        // 速度下降适中，最低到 120ms
        speedCurve: (level: number) => {
            const speed = 800 * Math.pow(0.88, level - 1);
            return Math.max(120, Math.round(speed));
        },
        scoreMultiplier: 1.5,
        levelUpThreshold: 1000, // 每 1000 分升一级
        specialProbability: 0.02 // 2% 概率生成特殊单格方块（type 8）
    },

    [Difficulty.HARD]: {
        name: '困难',
        description: '高手挑战，速度很快',
        initialSpeed: 600,
        // 指数衰减公式: speed = initialSpeed * 0.85^(level-1)
        // 速度下降较快，最低到 80ms
        speedCurve: (level: number) => {
            const speed = 600 * Math.pow(0.85, level - 1);
            return Math.max(80, Math.round(speed));
        },
        scoreMultiplier: 2.0,
        levelUpThreshold: 800, // 每 800 分升一级
        specialProbability: 0.01 // 1% 概率生成特殊单格方块（type 8）
    }
};

/**
 * 获取指定难度和等级的下落速度
 */
export function getSpeed(difficulty: Difficulty, level: number): number {
    return DIFFICULTY_CONFIGS[difficulty].speedCurve(level);
}

/**
 * 获取难度配置
 */
export function getDifficultyConfig(difficulty: Difficulty): DifficultyConfig {
    return DIFFICULTY_CONFIGS[difficulty];
}

/**
 * 计算升级所需分数（非线性）
 * 使用指数增长：每升一级所需分数按 1.15 倍增长
 * 例如：1级->2级需要1000分，2级->3级需要1150分，3级->4级需要1322分...
 */
export function getNextLevelScore(difficulty: Difficulty, currentLevel: number): number {
    const baseThreshold = DIFFICULTY_CONFIGS[difficulty].levelUpThreshold;
    // 计算从 1 级到目标等级所需的累计分数
    let totalScore = 0;
    for (let i = 1; i < currentLevel; i++) {
        totalScore += Math.floor(baseThreshold * Math.pow(1.15, i - 1));
    }
    return totalScore;
}

/**
 * 根据分数计算当前等级（非线性）
 * 使用指数增长模型，前期升级快，后期升级慢
 * 每升一级所需分数增加 15%
 */
export function calculateLevel(difficulty: Difficulty, score: number): number {
    const baseThreshold = DIFFICULTY_CONFIGS[difficulty].levelUpThreshold;
    let level = 1;
    let accumulatedScore = 0;

    // 迭代计算当前分数对应的等级
    while (true) {
        const scoreNeeded = Math.floor(baseThreshold * Math.pow(1.15, level - 1));
        if (accumulatedScore + scoreNeeded > score) {
            break;
        }
        accumulatedScore += scoreNeeded;
        level++;

        // 防止无限循环（设置最大等级为 50）
        if (level >= 50) {
            break;
        }
    }

    return level;
}

/**
 * 获取当前等级的升级进度信息
 * 返回：当前等级起始分数、下一等级所需分数、升级进度百分比
 */
export function getLevelProgress(difficulty: Difficulty, score: number): {
    currentLevel: number;
    currentLevelScore: number;
    nextLevelScore: number;
    progressPercent: number;
} {
    const currentLevel = calculateLevel(difficulty, score);
    const currentLevelScore = getNextLevelScore(difficulty, currentLevel);
    const nextLevelScore = getNextLevelScore(difficulty, currentLevel + 1);

    const scoreInLevel = score - currentLevelScore;
    const scoreNeeded = nextLevelScore - currentLevelScore;
    const progressPercent = Math.min(100, Math.floor((scoreInLevel / scoreNeeded) * 100));

    return {
        currentLevel,
        currentLevelScore,
        nextLevelScore,
        progressPercent
    };
}
