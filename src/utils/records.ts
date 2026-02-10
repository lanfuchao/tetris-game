import { GameRecord, Difficulty } from '../types';

const STORAGE_KEY = 'tetris_game_records';
const MAX_RECORDS = 20; // 最多保存 20 条记录

/**
 * 保存游戏记录
 */
export function saveGameRecord(record: Omit<GameRecord, 'id' | 'timestamp'>): void {
    const records = getGameRecords();

    const newRecord: GameRecord = {
        ...record,
        id: generateId(),
        timestamp: Date.now()
    };

    records.unshift(newRecord); // 添加到开头

    // 限制记录数量
    if (records.length > MAX_RECORDS) {
        records.splice(MAX_RECORDS);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/**
 * 获取所有游戏记录
 */
export function getGameRecords(): GameRecord[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        return JSON.parse(data);
    } catch (error) {
        console.error('Failed to load game records:', error);
        return [];
    }
}

/**
 * 获取最高分记录（按难度分类）
 */
export function getHighScore(difficulty: Difficulty): GameRecord | null {
    const records = getGameRecords();
    const difficultyRecords = records.filter(r => r.difficulty === difficulty);

    if (difficultyRecords.length === 0) return null;

    // 按分数降序排序
    difficultyRecords.sort((a, b) => b.score - a.score);
    return difficultyRecords[0];
}

/**
 * 获取通关记录数量
 */
export function getVictoryCount(difficulty?: Difficulty): number {
    const records = getGameRecords();
    return records.filter(r =>
        r.isVictory && (difficulty ? r.difficulty === difficulty : true)
    ).length;
}

/**
 * 清除所有记录
 */
export function clearGameRecords(): void {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 格式化时长
 */
export function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 格式化时间戳
 */
export function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}
