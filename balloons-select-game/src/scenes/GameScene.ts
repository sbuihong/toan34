import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
    rabbit!: Phaser.GameObjects.Image;
    promptText!: Phaser.GameObjects.Text;
    constructor() {
        super("GameScene");
    }

    preload() {
        // IMAGES
        this.load.image("bg_forest", "/assets/images/bg_forest.png");
        this.load.image("rabbit_idle", "/assets/images/rabbit_idle.png");
        this.load.image("rabbit_cheer", "/assets/images/rabbit_cheer.png");
        this.load.image("banner_top", "/assets/images/banner_top.png");

        // this.load.image("balloon_red", "assets/images/balloon_red.png");
        // this.load.image("balloon_blue", "assets/images/balloon_blue.png");
        // this.load.image("balloon_green", "assets/images/balloon_green.png");
        // this.load.image("balloon_purple", "assets/images/balloon_purple.png");

        // AUDIO
        // this.load.audio("vo_prompt_1", "assets/audio/vo_prompt_1.mp3");
        // this.load.audio("sfx_correct", "assets/audio/sfx_correct.mp3");
        // this.load.audio("sfx_wrong", "assets/audio/sfx_wrong.mp3");
        // this.load.audio("sfx_pop", "assets/audio/sfx_pop.mp3");
        // this.load.audio("sfx_flyaway", "assets/audio/sfx_flyaway.mp3");
        }


    create() {
        // Background
        this.add.image(640, 360, "bg_forest").setOrigin(0.5);

        // Rabbit (nhân vật)
        this.rabbit = this.add.image(200, 500, "rabbit_idle").setScale(0.8);

        // Banner top
        this.add.image(640, 120, "banner_top").setScale(0.9);

        // Text hướng dẫn
        this.promptText = this.add.text(640, 120, "Chạm vào số X", {
            fontSize: "48px",
            fontFamily: "Arial",
            color: "#ffffff",
        }).setOrigin(0.5);

        // Play voice instruction
        // this.sound.play("vo_prompt_1");
        
        console.log("UI loaded");
    }
}
