export enum Language {
    ZH_CN = 'zh-CN',
    EN = 'en'
}

export interface Translation {
    // 游戏标题和按钮
    gameTitle: string;
    start: string;
    end: string;
    pause: string;
    resume: string;

    // 信息显示
    score: string;
    level: string;
    difficulty: string;
    blockType: string;
    next: string;

    // 难度
    easy: string;
    normal: string;
    hard: string;

    // 方块类型
    block3: string;
    block4: string;
    block5: string;

    // 游戏结束
    gameOver: string;
    victory: string;
    finalScore: string;
    finalLevel: string;

    // 帮助
    help: string;
    helpTitle: string;
    controls: string;
    keyLeft: string;
    keyRight: string;
    keyDown: string;
    keyUp: string;
    spaceKey: string;
    keySpace: string;
    keyP: string;
    helpDifficultyTitle: string;
    easyDesc: string;
    normalDesc: string;
    hardDesc: string;

    // 游戏记录
    records: string;
    recordsTitle: string;
    filter: string;
    all: string;
    time: string;
    duration: string;
    victoryStatus: string;
    victoryCount: string;
    victoryYes: string;
    noRecords: string;
    clearRecords: string;
    confirmClear: string;

    // 其他
    close: string;
    clickToSwitch: string;
    switchLanguage: string;
    switchDifficulty: string;
    switchBlockType: string;
}

export const translations: Record<Language, Translation> = {
    [Language.ZH_CN]: {
        gameTitle: '俄罗斯方块',
        start: '开始',
        end: '结束',
        pause: '暂停',
        resume: '继续',

        score: '得分',
        level: '等级',
        difficulty: '难度',
        blockType: '方块',
        next: '下一个',

        easy: '简单',
        normal: '普通',
        hard: '困难',

        block3: '3格',
        block4: '4格',
        block5: '5格',

        gameOver: '游戏结束',
        victory: '🎉 恭喜通关！',
        finalScore: '最终得分',
        finalLevel: '最终等级',

        help: '帮助',
        helpTitle: '游戏控制',
        controls: '操作说明',
        keyLeft: '左移',
        keyRight: '右移',
        keyDown: '快速下落（按住）',
        keyUp: '旋转',
        spaceKey: '空格',
        keySpace: '瞬间落地',
        keyP: '暂停/继续',
        helpDifficultyTitle: '难度说明',
        easyDesc: '- 速度慢，1.0x分数，适合新手',
        normalDesc: '- 速度中等，1.5x分数，标准体验',
        hardDesc: '- 速度快，2.0x分数，极限挑战',

        records: '游戏记录',
        recordsTitle: '游戏记录',
        filter: '筛选',
        all: '全部',
        time: '时间',
        duration: '时长',
        victoryStatus: '通关',
        victoryCount: '通关次数',
        victoryYes: '是',
        noRecords: '暂无游戏记录',
        clearRecords: '清空记录',
        confirmClear: '确定要清空所有游戏记录吗？',

        close: '关闭',
        clickToSwitch: '点击切换',
        switchLanguage: '切换语言',
        switchDifficulty: '点击切换难度',
        switchBlockType: '点击切换方块类型'
    },
    [Language.EN]: {
        gameTitle: 'Tetris',
        start: 'Start',
        end: 'End',
        pause: 'Pause',
        resume: 'Resume',

        score: 'Score',
        level: 'Level',
        difficulty: 'Difficulty',
        blockType: 'Block',
        next: 'Next',

        easy: 'Easy',
        normal: 'Normal',
        hard: 'Hard',

        block3: '3-Block',
        block4: '4-Block',
        block5: '5-Block',

        gameOver: 'Game Over',
        victory: '🎉 Victory!',
        finalScore: 'Final Score',
        finalLevel: 'Final Level',

        help: 'Help',
        helpTitle: 'Game Controls',
        controls: 'Controls',
        keyLeft: 'Move Left',
        keyRight: 'Move Right',
        keyDown: 'Soft Drop (Hold)',
        keyUp: 'Rotate',
        spaceKey: 'Space',
        keySpace: 'Hard Drop',
        keyP: 'Pause/Resume',
        helpDifficultyTitle: 'Difficulty',
        easyDesc: '- Slow speed, 1.0x score, for beginners',
        normalDesc: '- Medium speed, 1.5x score, standard',
        hardDesc: '- Fast speed, 2.0x score, extreme',

        records: 'Records',
        recordsTitle: 'Game Records',
        filter: 'Filter',
        all: 'All',
        time: 'Time',
        duration: 'Duration',
        victoryStatus: 'Victory',
        victoryCount: 'Victories',
        victoryYes: 'Yes',
        noRecords: 'No records yet',
        clearRecords: 'Clear Records',
        confirmClear: 'Are you sure you want to clear all records?',

        close: 'Close',
        clickToSwitch: 'Click to switch',
        switchLanguage: 'Switch Language',
        switchDifficulty: 'Click to switch difficulty',
        switchBlockType: 'Click to switch block type'
    }
};

export class I18n {
    private currentLanguage: Language;

    constructor() {
        // 从 localStorage 读取保存的语言，或使用默认语言
        const savedLang = localStorage.getItem('tetris_language');
        this.currentLanguage = savedLang === Language.EN ? Language.EN : Language.ZH_CN;
    }

    getCurrentLanguage(): Language {
        return this.currentLanguage;
    }

    setLanguage(lang: Language): void {
        this.currentLanguage = lang;
        localStorage.setItem('tetris_language', lang);
        document.documentElement.lang = lang;
    }

    toggleLanguage(): void {
        const newLang = this.currentLanguage === Language.ZH_CN ? Language.EN : Language.ZH_CN;
        this.setLanguage(newLang);
    }

    t(key: keyof Translation): string {
        return translations[this.currentLanguage][key];
    }

    getDifficultyName(difficulty: string): string {
        switch (difficulty) {
            case 'easy':
                return this.t('easy');
            case 'normal':
                return this.t('normal');
            case 'hard':
                return this.t('hard');
            default:
                return difficulty;
        }
    }

    getBlockTypeName(blockType: string): string {
        switch (blockType) {
            case 'tromino':
                return this.t('block3');
            case 'tetromino':
                return this.t('block4');
            case 'pentomino':
                return this.t('block5');
            default:
                return blockType;
        }
    }
}
