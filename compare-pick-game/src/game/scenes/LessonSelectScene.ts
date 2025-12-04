import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import type { LessonConcept } from '../types/lesson';
import { domBackgroundManager } from '../domBackground';
import { hideGameButtons } from '../../main';

type DifficultyLevel = 1 | 2 | 3;
type LessonOption = {
    lessonId: string;
    concept: LessonConcept;
    imageKey: string; // 👈 thêm
    title: string;
    difficultyBgKey: string;
};

const LESSON_OPTIONS: LessonOption[] = [
    {
        lessonId: 'height_basic_01',
        concept: 'HEIGHT',
        imageKey: 'card_height', // ảnh card Cao/Thấp
        title: 'Cao/Thấp',
        difficultyBgKey: 'diff_height',
    },
    {
        lessonId: 'size_basic_01',
        concept: 'SIZE',
        imageKey: 'card_size', // ảnh card To/Nhỏ/Bằng nhau
        title: 'To/Nhỏ/Bằng nhau',
        difficultyBgKey: 'diff_size',
    },
    {
        lessonId: 'length_basic_01',
        concept: 'LENGTH',
        imageKey: 'card_length', // ảnh card Dài/Ngắn
        title: 'Dài/Ngắn',
        difficultyBgKey: 'diff_length',
    },
    {
        lessonId: 'width_basic_01',
        concept: 'WIDTH',
        imageKey: 'card_width', // ảnh card Rộng/Hẹp
        title: 'Rộng/Hẹp',
        difficultyBgKey: 'diff_width',
    },
];

export class LessonSelectScene extends Phaser.Scene {
    constructor() {
        super('LessonSelectScene');
    }

    preload() {
        if (!this.textures.exists('menu_panel')) {
            this.load.image('menu_panel', 'assets/ui/menu_panel.webp'); // bảng xanh to
        }

        // 4 card nhỏ bên trong
        if (!this.textures.exists('card_height')) {
            this.load.image('card_height', 'assets/ui/card_height.webp');
        }
        if (!this.textures.exists('card_size')) {
            this.load.image('card_size', 'assets/ui/card_size.webp');
        }
        if (!this.textures.exists('card_length')) {
            this.load.image('card_length', 'assets/ui/card_length.webp');
        }
        if (!this.textures.exists('card_width')) {
            this.load.image('card_width', 'assets/ui/card_width.webp');
        }

        if (!this.textures.exists('diff_height')) {
            this.load.image('diff_height', 'assets/ui/diff_height.webp');
        }
        if (!this.textures.exists('diff_size')) {
            this.load.image('diff_size', 'assets/ui/diff_size.webp');
        }
        if (!this.textures.exists('diff_length')) {
            this.load.image('diff_length', 'assets/ui/diff_length.webp');
        }
        if (!this.textures.exists('diff_width')) {
            this.load.image('diff_width', 'assets/ui/diff_width.webp');
        }
    }

    create() {
        domBackgroundManager.setBackgroundByKey('DEFAULT');

        const centerX = GAME_WIDTH / 2;
        const centerY = GAME_HEIGHT / 2;

        // ===== BẢNG TO =====
        const board = this.add
            .image(centerX, centerY, 'menu_panel')
            .setOrigin(0.5);

        // scale để bảng chiếm khoảng 80% chiều ngang
        const targetWidth = GAME_WIDTH * 0.65;
        const ratio = board.height / board.width;
        board.setDisplaySize(targetWidth, targetWidth * ratio);
        board.setDepth(0);

        // Vẽ 4 card bên trong bảng
        this.renderLessonOptions(board);

        hideGameButtons();
    }

    private renderLessonOptions(board: Phaser.GameObjects.Image) {
        const centerX = board.x;
        const centerY = board.y + 40; // lệch xuống chút cho giống hình

        const colSpacing = board.displayWidth * 0.34; // chỉnh cho khớp layout
        const rowSpacing = board.displayHeight * 0.305;

        const positions = [
            { x: centerX - colSpacing / 2, y: centerY - rowSpacing / 2 },
            { x: centerX + colSpacing / 2, y: centerY - rowSpacing / 2 },
            { x: centerX - colSpacing / 2, y: centerY + rowSpacing / 2 },
            { x: centerX + colSpacing / 2, y: centerY + rowSpacing / 2 },
        ];

        LESSON_OPTIONS.forEach((opt, idx) => {
            const pos = positions[idx] ?? positions[positions.length - 1];

            // ===== CARD ẢNH (có sẵn text + icon) =====
            const card = this.add
                .image(pos.x, pos.y, opt.imageKey)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true });

            // scale các card về cùng kích thước tương đối (nếu cần)
            const targetCardWidth = board.displayWidth * 0.32; // ~1/3 bảng
            const scale = targetCardWidth / card.width;
            card.setScale(scale);

            card.scene.tweens.add({
                targets: card,
                scaleX: scale * 1.02,
                scaleY: scale * 1.02,
                yoyo: true, // lặp lặp
                ease: 'Sine.easeInOut',
                duration: 800,
                repeat: -1, // lặp vô hạn
            });

            // card.setDepth(1); // trên bảng

            // click card: mở popup chọn độ khó (logic cũ)
            card.on('pointerdown', () => {
                this.openDifficultyPopup(opt);
            });
        });
    }

    private openDifficultyPopup(option: LessonOption) {
        const { lessonId, difficultyBgKey } = option;

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
        const centerY = this.scale.height / 2 + 40;

        // 🔥 Ảnh popup riêng cho từng bài (CHỌN ĐỘ KHÓ + icon)
        const popupBg = this.add
            .image(centerX, centerY, difficultyBgKey)
            .setOrigin(0.5);

        // scale để fit màn (có thể chỉnh lại tuỳ file)
        const targetWidth = Math.min(this.scale.width * 1, 620);
        const scale = targetWidth / popupBg.width;
        popupBg.setScale(scale);

        // Tính vị trí nút theo chính cái popup
        const btnAreaY = popupBg.y + popupBg.displayHeight / 2 - 100; // gần đáy card
        const btnWidth = 140;
        const btnHeight = 50;
        const btnSpacing = 170;

        type BtnCfg = { label: string; level: DifficultyLevel; color: number };

        const btnConfigs: BtnCfg[] = [
            { label: 'Dễ', level: 1, color: 0x0a9b35 }, // xanh
            { label: 'Vừa', level: 2, color: 0xf6c515 }, // vàng
            { label: 'Khó', level: 3, color: 0xd62828 }, // đỏ
        ];

        const popupObjects: Phaser.GameObjects.GameObject[] = [
            overlay,
            popupBg,
        ];

        btnConfigs.forEach((cfg, idx) => {
            const x = centerX + (idx - 1) * btnSpacing;
            const y = btnAreaY;

            // vẽ nút bo góc bằng Graphics
            const radius = 14;

            const g = this.add.graphics();
            g.fillStyle(cfg.color, 1);
            g.fillRoundedRect(
                -btnWidth / 2,
                -btnHeight / 2,
                btnWidth,
                btnHeight,
                radius
            );

            const btnText = this.add
                .text(0, 0, cfg.label, {
                    fontSize: '25px',
                    color: '#ffffff',
                    align: 'center',
                    fontFamily: '"Baloo 2"',
                    fontStyle: '700',
                })
                .setOrigin(0.5);

            btnText.setDepth(2);

            // gom lại thành 1 container cho dễ tween + click
            const btn = this.add.container(x, y, [g, btnText]);
            btn.setSize(btnWidth, btnHeight);
            btn.setInteractive({ useHandCursor: true });

            popupObjects.push(btn);

            // hover
            btn.on('pointerover', () => {
                this.tweens.add({
                    targets: btn,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 100,
                });
            });

            btn.on('pointerout', () => {
                this.tweens.add({
                    targets: btn,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100,
                });
            });

            // click
            btn.on('pointerdown', () => {
                const difficultyLevel = cfg.level;

                popupObjects.forEach((obj) => obj.destroy());

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
