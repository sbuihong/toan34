import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import type { LessonConcept } from '../types/lesson';
import { domBackgroundManager } from '../domBackground';

type DifficultyLevel = 1 | 2 | 3;
type LessonOption = {
    lessonId: string;
    concept: LessonConcept;
    title: string;
    subtitle: string;
};

const LESSON_OPTIONS: LessonOption[] = [
    {
        lessonId: 'height_basic_01',
        concept: 'HEIGHT',
        title: 'Cao / Thấp',
        subtitle: 'So sánh chiều cao',
    },
    {
        lessonId: 'size_basic_01',
        concept: 'SIZE',
        title: 'To / Nhỏ / Bằng nhau',
        subtitle: 'So sánh kích thước',
    },
    {
        lessonId: 'length_basic_01',
        concept: 'LENGTH',
        title: 'Dài / Ngắn',
        subtitle: 'So sánh độ dài',
    },
    {
        lessonId: 'width_basic_01',
        concept: 'WIDTH',
        title: 'Rộng / Hẹp',
        subtitle: 'So sánh độ rộng',
    },
];

export class LessonSelectScene extends Phaser.Scene {
    constructor() {
        super('LessonSelectScene');
    }

    preload() {
        // panel & icon cần dùng trong menu
        if (!this.textures.exists('panel_bg')) {
            this.load.image('panel_bg', 'assets/ui/panel_bg.webp');
        }

        if (!this.textures.exists('speaker-icon')) {
            this.load.image('speaker-icon', 'assets/ui/speaker.png');
        }
    }

    create() {
        domBackgroundManager.setBackgroundByKey('DEFAULT');
        // Tiêu đề
        this.add
            .text(GAME_WIDTH / 2, 80, 'Chọn bài so sánh', {
                fontSize: '32px',
                color: '#000',
            })
            .setOrigin(0.5);

        this.add
            .text(
                GAME_WIDTH / 2,
                120,
                'Con muốn luyện Cao/Thấp, To/Nhỏ, Dài/Ngắn hay Rộng/Hẹp?',
                {
                    fontSize: '18px',
                    color: '#555',
                    align: 'center',
                    wordWrap: { width: GAME_WIDTH - 120 },
                }
            )
            .setOrigin(0.5);

        this.renderLessonOptions();
    }

    private renderLessonOptions() {
        const centerX = GAME_WIDTH / 2;
        const centerY = GAME_HEIGHT / 2 + 20;

        const colSpacing = 260;
        const rowSpacing = 180;

        // 4 ô: 2x2
        const positions = [
            { x: centerX - colSpacing / 2, y: centerY - rowSpacing / 2 },
            { x: centerX + colSpacing / 2, y: centerY - rowSpacing / 2 },
            { x: centerX - colSpacing / 2, y: centerY + rowSpacing / 2 },
            { x: centerX + colSpacing / 2, y: centerY + rowSpacing / 2 },
        ];

        LESSON_OPTIONS.forEach((opt, idx) => {
            const pos = positions[idx] ?? positions[positions.length - 1];

            // Panel nền
            const panel = this.add
                .image(pos.x, pos.y, 'panel_bg')
                .setOrigin(0.5)
                .setDisplaySize(260, 180);

            // Vùng click to hơn tí cho dễ bấm
            panel.setInteractive({ useHandCursor: true });

            // Text tiêu đề
            const titleText = this.add
                .text(pos.x, pos.y - 25, opt.title, {
                    fontSize: '22px',
                    color: '#000',
                })
                .setOrigin(0.5);

            // Text mô tả
            const subText = this.add
                .text(pos.x, pos.y + 20, opt.subtitle, {
                    fontSize: '16px',
                    color: '#555',
                })
                .setOrigin(0.5);

            // Click: start PreloadScene với lessonId
            panel.on('pointerdown', () => {
                this.openDifficultyPopup(opt);
            });
        });
    }

    private openDifficultyPopup(option: LessonOption) {
        const { title, lessonId } = option;

        // Overlay mờ che nền
        const overlay = this.add
            .rectangle(
                0,
                0,
                this.scale.width,
                this.scale.height,
                0x000000,
                0.45
            )
            .setOrigin(0, 0)
            .setInteractive(); // chặn click xuống dưới

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // Khung popup
        const popupBg = this.add
            .rectangle(centerX, centerY, 520, 320, 0xffffff, 1)
            .setStrokeStyle(2, 0xcccccc)
            .setOrigin(0.5);

        const titleText = this.add
            .text(centerX, centerY - 110, `Chọn độ khó\n${title}`, {
                fontSize: '24px',
                color: '#000',
                align: 'center',
            })
            .setOrigin(0.5);

        const btnWidth = 140;
        const btnHeight = 60;
        const btnSpacing = 170;
        const btnY = centerY + 40;

        type BtnCfg = { label: string; level: DifficultyLevel; color: number };

        const btnConfigs: BtnCfg[] = [
            { label: 'Dễ', level: 1, color: 0x81c784 }, // <= difficulty 1
            { label: 'Vừa', level: 2, color: 0xffb74d }, // <= difficulty 2
            { label: 'Khó', level: 3, color: 0xe57373 }, // <= difficulty 3
        ];

        const popupObjects: Phaser.GameObjects.GameObject[] = [
            overlay,
            popupBg,
            titleText,
        ];

        btnConfigs.forEach((cfg, idx) => {
            const x = centerX + (idx - 1) * btnSpacing;

            const btnRect = this.add
                .rectangle(x, btnY, btnWidth, btnHeight, cfg.color, 1)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true });

            const btnText = this.add
                .text(x, btnY, cfg.label, {
                    fontSize: '22px',
                    color: '#ffffff',
                })
                .setOrigin(0.5);

            popupObjects.push(btnRect, btnText);

            btnRect.on('pointerover', () => {
                this.tweens.add({
                    targets: [btnRect, btnText],
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 100,
                });
            });

            btnRect.on('pointerout', () => {
                this.tweens.add({
                    targets: [btnRect, btnText],
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100,
                });
            });

            btnRect.on('pointerdown', () => {
                const difficultyLevel = cfg.level; // 1 / 2 / 3

                // xoá popup
                popupObjects.forEach((obj) => obj.destroy());

                // sang PreloadScene, truyền lessonId + difficulty
                this.scene.start('PreloadScene', {
                    lessonId,
                    difficulty: difficultyLevel,
                });
            });
        });

        // optional: click ra ngoài để đóng popup
        overlay.on('pointerdown', () => {
            popupObjects.forEach((obj) => obj.destroy());
        });
    }
}
