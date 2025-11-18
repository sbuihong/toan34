import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
    rabbit!: Phaser.GameObjects.Image;
    promptText!: Phaser.GameObjects.Text;
    balloons: Phaser.GameObjects.Container[] = [];

    levelData = {
    prompt: "Chạm vào số 4",
    correctNumber: 4,
    options: [1, 2, 3, 4],
    };
    constructor() {
        super("GameScene");
    }

    preload() {
        // IMAGES
        this.load.image("bg_forest", "/assets/images/bg_forest.png");
        this.load.image("rabbit_idle", "/assets/images/rabbit_idle.png");
        this.load.image("rabbit_cheer", "/assets/images/rabbit_cheer.png");
        this.load.image("banner_top", "/assets/images/banner_top.png");

        this.load.image("balloon_red", "assets/images/balloon_red.png");
        this.load.image("balloon_blue", "assets/images/balloon_blue.png");
        this.load.image("balloon_green", "assets/images/balloon_green.png");
        this.load.image("balloon_purple", "assets/images/balloon_purple.png");

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
        this.promptText = this.add.text(640, 70, "Chạm vào số X", {
            fontSize: "48px",
            fontFamily: "Arial",
            color: "#ffffff",
        }).setOrigin(0.5);

        this.promptText.setText(this.levelData.prompt);

        // Play voice instruction
        // this.sound.play("vo_prompt_1");
        this.createBalloons();
    }

    createBalloons() {
        const positions = [
            { x: 350, y: 300 },
            { x: 550, y: 300 },
            { x: 750, y: 300 },
            { x: 950, y: 300 },
        ];

        const colors = [
            "balloon_red",
            "balloon_green",
            "balloon_blue",
            "balloon_purple",
        ];

        this.levelData.options.forEach((num, index) => {
            const pos = positions[index];
            const colorKey = colors[index];

            // Tạo container gồm: balloon sprite + text số
            const balloon = this.add.container(pos.x, pos.y);

            const img = this.add.image(0, 0, colorKey).setScale(0.8);
            const text = this.add.text(0, 0, String(num), {
            fontSize: "60px",
            color: "#ffffff",
            fontStyle: "bold",
            }).setOrigin(0.5);

            balloon.add(img);
            balloon.add(text);

            // Để check đúng sai
            (balloon as any).value = num;

            // Set interactive lên image!
            img.setInteractive({ useHandCursor: true });

            // Click
            img.on("pointerdown", () => {
            this.handleSelect(balloon);
            });

            this.balloons.push(balloon);
        });
    }
    handleSelect(balloon: Phaser.GameObjects.Container) {
        const value = (balloon as any).value;

        if (value === this.levelData.correctNumber) {
            this.onCorrect(balloon);
        } else {
            this.onWrong(balloon);
        }
    }

    onWrong(balloon: Phaser.GameObjects.Container) {
        // this.sound.play("sfx_wrong");

        // Lấy sprite bên trong container (child đầu tiên)
        const img = balloon.getAt(0) as Phaser.GameObjects.Image;

        this.tweens.add({
            targets: img,
            angle: { from: -10, to: 10 },
            duration: 80,
            yoyo: true,
            repeat: 2,
            onComplete: () => img.setAngle(0),
        });
    }

    onCorrect(balloon: Phaser.GameObjects.Container) {
        // this.sound.play("sfx_correct");

        // Disable toàn bộ bóng
        this.balloons.forEach(b => {
            const img = b.getAt(0) as Phaser.GameObjects.Image;
            img.disableInteractive();
        });

        // Chuyển sang giai đoạn 5 để xử lý hiệu ứng pop + rabbit cheer
        console.log("Correct! Will animate in next stage.");
    }


}
