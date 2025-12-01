import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Backgrounds
        this.load.image('bg_game', 'assets/bg/bg2.webp');
        this.load.image('bg_overlay', 'assets/bg/bg1.webp');
        this.load.image('bg_end', 'assets/bg/bg3.webp');

        // Characters
        this.load.image('balloon', 'assets/char/compressed_BALLON.webp');
        this.load.image('girl_balloon', 'assets/char/compressed_GIRL 1 BALLON.webp');
        this.load.image('boy_balloon', 'assets/char/compressed_BOY.webp');
        this.load.image('girl_flower', 'assets/char/compressed_FLOWER 1.webp');
        this.load.image('boy_flower', 'assets/char/compressed_FLOWER 2.webp');
        this.load.image('flower', 'assets/char/flower.webp');
        this.load.image('girl_balloon_plus', 'assets/char/ballon2.png');
        this.load.image('girl_flower_plus', 'assets/char/flower2.png');

        // UI & Banner
        this.load.image('banner_question', 'assets/button/Rectangle 1.png');
        this.load.image('answer_correct', 'assets/button/V.png');
        this.load.image('answer_wrong', 'assets/button/X.png');
        this.load.image('btn_next', 'assets/button/next.png');
        this.load.image('answer_default', 'assets/button/DRAW.png');
        this.load.image('btn_primary_pressed', 'assets/button/HTU.png');

        // Audio
        this.load.audio('bgm_main', 'assets/audio/bgm_main.mp3');
        this.load.audio('sfx_click', 'assets/audio/click.mp3');
        this.load.audio('sfx_correct', 'assets/audio/correct.mp3');
        this.load.audio('sfx_wrong', 'assets/audio/error.mp3');
    }

    create() {
        this.scene.start('OverlayScene');
    }
}
