import Phaser from 'phaser';
import { SceneKeys, TextureKeys } from '../consts/Keys';
import { GameConstants } from '../consts/GameConstants';
import { GameUtils } from '../utils/GameUtils';

export default class UIScene extends Phaser.Scene {
    private sceneKey!: string;
    private paletteButtons: Phaser.GameObjects.Image[] = [];
    private firstColorBtn!: Phaser.GameObjects.Image;
    public handHint!: Phaser.GameObjects.Image;

    constructor() {
        super(SceneKeys.UI);
    }

    init(data: { sceneKey: string }) {
        this.sceneKey = data.sceneKey;
        this.paletteButtons = [];
    }

    create() {
        this.createUI();
    }

    private bannerImage!: Phaser.GameObjects.Image;
    private bannerText!: Phaser.GameObjects.Image;

    private createUI() {
        const UI = GameConstants.SCENE1.UI;
        const cx = GameUtils.pctX(this, 0.5);

        // Tính toán vị trí Board dựa trên Banner
        const bannerY = GameUtils.pctY(this, UI.BANNER_Y);
        // Xác định TextureKeys dựa trên SceneKey
        let bannerKey = TextureKeys.S1_Banner;
        let titleKey = TextureKeys.Title1;
        // Hiển thị Banner và Text
        this.bannerImage = this.add.image(cx, bannerY, bannerKey).setScale(0.8,0.7).setOrigin(0.5, -0.1);
        
        // Title
        this.add.image(cx, bannerY, titleKey).setOrigin(0.5, -0.6).setScale(1);
        
        // Decor
        this.add.image(cx * 0.155, bannerY + 180, TextureKeys.Number).setScale(1).setOrigin(0.5, -0.1);
        this.add.image(cx * 0.275, bannerY + 170, TextureKeys.Dice).setScale(1).setOrigin(0.5, -0.1);
        
        // Tạo bàn tay gợi ý (ẩn đi, set depth cao nhất để đè lên mọi thứ)
        this.handHint = this.add
            .image(0, 0, TextureKeys.HandHint)
            .setDepth(2000)
            .setAlpha(0)
            .setOrigin(0.1, 0.1)
            .setScale(0.8);
    }
    // --- Các phương thức Animation ---
    
    public playHandAnimation(x: number, y: number, radius: number, onComplete?: () => void) {
        if (!this.handHint) return;
        
        // Dừng các tween hiện tại trên bàn tay
        this.stopHandAnimation();

        // Tính toán vị trí bắt đầu
        const startX = x + radius * Math.cos(-Phaser.Math.PI2 / 4);
        const startY = y + radius * Math.sin(-Phaser.Math.PI2 / 4);

        this.handHint.setPosition(startX, startY);
        this.handHint.setVisible(true);
        this.handHint.setAlpha(0);

        // Chuỗi: Hiện dần -> Xoay vòng
        this.tweens.add({
            targets: this.handHint,
            alpha: 1,
            duration: 300,
            onComplete: () => {
                const circleData = { angle: 0 };
                this.tweens.add({
                    targets: circleData,
                    angle: Phaser.Math.PI2,
                    duration: 2000,
                    repeat: 1,
                    onUpdate: () => {
                        const a = circleData.angle - Phaser.Math.PI2 / 4;
                        this.handHint.x = x + radius * Math.cos(a);
                        this.handHint.y = y + radius * Math.sin(a);
                    },
                    onComplete: () => {
                        if (onComplete) onComplete();
                    }
                });
            }
        });
    }

    public stopHandAnimation() {
        if (this.handHint) {
            this.tweens.killTweensOf(this.handHint);
            this.handHint.setVisible(false);
            this.handHint.setAlpha(0);
        }
    }
}
