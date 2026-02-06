#!/usr/bin/env node

/**
 * 速度曲线对比脚本
 * 用于可视化三种难度模式的速度变化
 */

const difficulties = {
    easy: {
        name: '简单',
        initial: 1000,
        decay: 0.92,
        min: 200
    },
    normal: {
        name: '普通',
        initial: 800,
        decay: 0.88,
        min: 120
    },
    hard: {
        name: '困难',
        initial: 600,
        decay: 0.85,
        min: 80
    }
};

function calculateSpeed(config, level) {
    const speed = config.initial * Math.pow(config.decay, level - 1);
    return Math.max(config.min, Math.round(speed));
}

console.log('俄罗斯方块 - 速度曲线对比\n');
console.log('=' .repeat(70));
console.log('等级'.padEnd(8) + '简单模式'.padEnd(15) + '普通模式'.padEnd(15) + '困难模式');
console.log('-'.repeat(70));

const levels = [1, 2, 3, 5, 7, 10, 15, 20, 25, 30];

levels.forEach(level => {
    const easy = calculateSpeed(difficulties.easy, level);
    const normal = calculateSpeed(difficulties.normal, level);
    const hard = calculateSpeed(difficulties.hard, level);

    console.log(
        `${level}`.padEnd(8) +
        `${easy}ms`.padEnd(15) +
        `${normal}ms`.padEnd(15) +
        `${hard}ms`
    );
});

console.log('=' .repeat(70));
console.log('\n速度说明：数值越小，方块下落越快\n');

// 绘制简单的 ASCII 图表
console.log('速度变化趋势图:');
console.log('-'.repeat(70));

const maxSpeed = 1000;
const chartLevels = [1, 5, 10, 15, 20, 25];

chartLevels.forEach(level => {
    const easy = calculateSpeed(difficulties.easy, level);
    const normal = calculateSpeed(difficulties.normal, level);
    const hard = calculateSpeed(difficulties.hard, level);

    const easyBar = '█'.repeat(Math.floor(easy / 20));
    const normalBar = '▓'.repeat(Math.floor(normal / 20));
    const hardBar = '▒'.repeat(Math.floor(hard / 20));

    console.log(`Lv${level}`.padEnd(6));
    console.log(`  简单 ${easyBar} ${easy}ms`);
    console.log(`  普通 ${normalBar} ${normal}ms`);
    console.log(`  困难 ${hardBar} ${hard}ms`);
    console.log('');
});

console.log('\n速度公式:');
console.log(`  简单: ${difficulties.easy.initial} × ${difficulties.easy.decay}^(level-1), 最低 ${difficulties.easy.min}ms`);
console.log(`  普通: ${difficulties.normal.initial} × ${difficulties.normal.decay}^(level-1), 最低 ${difficulties.normal.min}ms`);
console.log(`  困难: ${difficulties.hard.initial} × ${difficulties.hard.decay}^(level-1), 最低 ${difficulties.hard.min}ms`);
