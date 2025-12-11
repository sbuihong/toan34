// src/scenes/PreloadScene.ts

import Phaser from 'phaser';
import AudioManager from '../audio/AudioManager';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // IMAGES
        this.load.image('rabbit_idle', 'assets/images/rabbit_idle.png');
        this.load.image('rabbit_cheer', 'assets/images/rabbit_cheer.png');
        this.load.image('banner_top', 'assets/images/banner_top.png');
        this.load.image('banner_no_text', 'assets/images/banner_no_text.png');

        this.load.image('btn_reset', 'assets/images/btn_reset.png');
        this.load.image('btn_exit', 'assets/images/btn_exit.png');

        this.load.image('balloon_red', 'assets/images/balloon_red.png');
        this.load.image('balloon_blue', 'assets/images/balloon_blue.png');
        this.load.image('balloon_green', 'assets/images/balloon_green.png');
        this.load.image('balloon_purple', 'assets/images/balloon_purple.png');

        this.load.spritesheet('pop_red', 'assets/images/pop_red.png', {
            frameWidth: 384,
            frameHeight: 685,
        });

        this.load.spritesheet('pop_blue', 'assets/images/pop_blue.png', {
            frameWidth: 384,
            frameHeight: 711,
        });

        this.load.spritesheet('pop_green', 'assets/images/pop_green.png', {
            frameWidth: 384,
            frameHeight: 636,
        });

        this.load.spritesheet('pop_purple', 'assets/images/pop_purple.png', {
            frameWidth: 384,
            frameHeight: 754,
        });

        this.load.image('apple', 'assets/images/apple.png');
        this.load.image('flower', 'assets/images/flower.png');
        this.load.image('carrot', 'assets/images/carrot.png');
        this.load.image('leaf', 'assets/images/leaf.png');

        this.load.image('board_bg', 'assets/images/board_bg.png');
    }

    create() {
        // 2. Chờ tải Audio (BẤT ĐỒNG BỘ)
        AudioManager.loadAll()
            .then(() => {
                // console.log('Tất cả tài nguyên (Phaser & Audio) đã tải xong.');

                // 3. Chuyển sang Scene Game chính
                this.scene.start('GameScene'); // Đổi tên scene chính của bạn
            })
            .catch((error) => {
                console.error('Lỗi khi tải Audio:', error);
                // Xử lý lỗi: Vẫn chuyển Scene nếu lỗi không quá nghiêm trọng.
                this.scene.start('GameScene');
            });
    }
}
