import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

type DifficultyLevel = 1 | 2 | 3;

export class SummaryScene extends Phaser.Scene {
    private lessonId!: string;
    private score!: number;
    private total!: number;
    private difficulty: DifficultyLevel = 3; // thêm field

    constructor() {
        super('SummaryScene');
    }

    init(data: {
        lessonId: string;
        score: number;
        total: number;
        difficulty?: DifficultyLevel;
    }) {
        this.lessonId = data.lessonId;
        this.score = data.score;
        this.total = data.total;
        this.difficulty = data.difficulty ?? 3; // nhận lại độ khó vừa chơi
    }

    create() {
        // Title
        this.add
            .text(GAME_WIDTH / 2, 200, 'Hoàn thành bài học', {
                fontSize: '30px',
                color: '#000',
                align: 'center',
            })
            .setOrigin(0.5);

        // Result
        this.add
            .text(
                GAME_WIDTH / 2,
                260,
                `Con đã trả lời đúng ${this.score}/${this.total} câu`,
                {
                    fontSize: '24px',
                    color: '#2E7D32',
                }
            )
            .setOrigin(0.5);

        // Nút chơi lại bài hiện tại
        const replayBtn = this.add
            .rectangle(GAME_WIDTH / 2, 340, 220, 55, 0x42a5f5, 1)
            .setInteractive({ useHandCursor: true });

        this.add
            .text(GAME_WIDTH / 2, 340, 'Chơi lại', {
                fontSize: '22px',
                color: '#fff',
            })
            .setOrigin(0.5);

        replayBtn.on('pointerdown', () => {
            // 🔥 replay đúng lesson + đúng độ khó
            this.scene.start('PreloadScene', {
                lessonId: this.lessonId,
                difficulty: this.difficulty,
            });
        });

        // Nút về menu chọn bài
        const menuBtn = this.add
            .rectangle(GAME_WIDTH / 2, 410, 220, 55, 0x9e9e9e, 1)
            .setInteractive({ useHandCursor: true });

        this.add
            .text(GAME_WIDTH / 2, 410, 'Chọn bài khác', {
                fontSize: '20px',
                color: '#fff',
            })
            .setOrigin(0.5);

        menuBtn.on('pointerdown', () => {
            this.scene.start('LessonSelectScene');
        });
    }
}
