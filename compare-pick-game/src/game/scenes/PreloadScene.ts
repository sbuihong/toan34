// src/game/scenes/PreloadScene.ts
import Phaser from 'phaser';
import type { LessonPackage } from '../types/lesson';

type DifficultyLevel = 1 | 2 | 3;

type PreloadData = {
    lessonId: string;
    difficulty?: DifficultyLevel; // nhận thêm từ LessonSelectScene
};

export class PreloadScene extends Phaser.Scene {
    private lessonId!: string;
    private selectedDifficulty: DifficultyLevel = 3; // mặc định: chơi full nếu không truyền
    private lessonData!: LessonPackage;

    constructor() {
        super('PreloadScene');
    }

    init(data: PreloadData) {
        this.lessonId = data.lessonId;
        // nếu không truyền difficulty (ví dụ replay từ SummaryScene) thì cho = 3
        this.selectedDifficulty = data.difficulty ?? 3;
    }

    preload() {
        // === UI CHUNG ===
        this.load.image('icon', 'assets/ui/icon.png');

        // Panel nền câu hỏi & câu trả lời
        this.load.image('panel_bg', 'assets/ui/panel_bg.png');
        this.load.image('panel_bg_correct', 'assets/ui/panel_bg_ok.png');
        this.load.image('panel_bg_wrong', 'assets/ui/panel_bg_wrong.png');
        this.load.image('panel_bg_1', 'assets/ui/panel_bg_1.png');
        this.load.image('panel_bg_1_correct', 'assets/ui/panel_bg_1_ok.png');
        this.load.image('panel_bg_1_wrong', 'assets/ui/panel_bg_1_wrong.png');

        // Thanh câu hỏi (khung câu hỏi)
        this.load.image('question_bar', 'assets/ui/question_bar.png');

        this.load.image('boy', 'assets/characters/boy.png');
        this.load.image('squirrel', 'assets/characters/squirrel.png');

        // === UI KẾT THÚC BÀI HỌC ===
        this.load.image('banner_congrat', 'assets/ui/banner_congrat.png');
        this.load.image('btn_reset', 'assets/ui/btn_reset.png');
        this.load.image('btn_exit', 'assets/ui/btn_exit.png');

        // === AUDIO CHUNG ===
        this.load.audio('voice_rotate', 'audio/sfx/rotate.mp3');
        this.load.audio('complete', 'audio/sfx/complete.mp3');
        this.load.audio('fireworks', 'audio/sfx/fireworks.mp3');
        this.load.audio('applause', 'audio/sfx/applause.mp3');
        this.load.audio('sfx-click', 'audio/sfx/click.mp3');
        this.load.audio('correct', 'audio/sfx/correct.mp3');
        this.load.audio('wrong', 'audio/sfx/wrong.mp3');
        this.load.audio('correct_answer_1', 'audio/sfx/correct_answer_1.mp3');
        this.load.audio('correct_answer_2', 'audio/sfx/correct_answer_2.mp3');
        this.load.audio('correct_answer_3', 'audio/sfx/correct_answer_3.mp3');
        this.load.audio('correct_answer_4', 'audio/sfx/correct_answer_4.mp3');

        // === JSON BÀI HỌC ===
        // XÓA JSON CŨ TRƯỚC
        if (this.cache.json.exists('lessonData')) {
            this.cache.json.remove('lessonData');
        }
        this.load.json('lessonData', `lessons/${this.lessonId}.json`);
    }

    create() {
        const rawLesson = this.cache.json.get('lessonData') as LessonPackage;

        // 1) Lọc theo độ khó
        let filteredItems = rawLesson.items.filter((item) => {
            const d = (item as any).difficulty ?? 1;
            return d === this.selectedDifficulty; // hoặc <= nếu bạn đổi logic
        });

        // 2) Random và giới hạn tối đa 5 câu
        const MAX_QUESTIONS = 5;

        if (filteredItems.length > MAX_QUESTIONS) {
            // copy ra mảng mới để không đụng mảng gốc
            const shuffled = Phaser.Utils.Array.Shuffle(filteredItems.slice());
            filteredItems = shuffled.slice(0, MAX_QUESTIONS);
        } else {
            // nếu muốn vẫn random thứ tự khi <= 5
            filteredItems = Phaser.Utils.Array.Shuffle(filteredItems.slice());
        }

        // 3) Tạo lessonForPlay SAU KHI đã lọc + random + cắt
        const lessonForPlay: LessonPackage = {
            ...rawLesson,
            items: filteredItems,
        };

        // 4) preload asset cho đúng bộ câu đã chọn
        this.preloadLessonAssets(lessonForPlay).then(() => {
            this.lessonData = lessonForPlay;
            this.scene.start('LessonScene', {
                lesson: this.lessonData,
                difficulty: this.selectedDifficulty,
            });
        });
    }

    private async preloadLessonAssets(lesson: LessonPackage) {
        // preload hình trong lesson
        lesson.items.forEach((item) => {
            item.options.forEach((opt) => {
                if (!this.textures.exists(opt.image)) {
                    this.load.image(opt.image, opt.image);
                }
            });

            if (item.promptAudio) {
                this.load.audio(item.promptAudio, item.promptAudio);
            }
        });

        if (lesson.defaultPromptAudio) {
            this.load.audio(
                lesson.defaultPromptAudio,
                lesson.defaultPromptAudio
            );
        }

        return new Promise<void>((resolve) => {
            this.load.once(Phaser.Loader.Events.COMPLETE, () => resolve());
            this.load.start();
        });
    }
}
