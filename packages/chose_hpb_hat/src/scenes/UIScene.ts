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
        this.sceneKey = data.sceneKey; // Lưu sceneKey để dùng
        this.paletteButtons = [];
    }

    create() {
        this.createUI();
    }

    private bannerImage!: Phaser.GameObjects.Image;
    private bannerText!: Phaser.GameObjects.Image;
    private decorImage!: Phaser.GameObjects.Image;
    private so1Image!: Phaser.GameObjects.Image;
    private diceImage!: Phaser.GameObjects.Image;

    private createUI() {
        const UI = GameConstants.SCENE1.UI;
        const cx = GameUtils.pctX(this, 0.5);

        // Tính toán vị trí Board dựa trên Banner
        const bannerY = GameUtils.pctY(this, UI.BANNER_Y);
        const bX = GameUtils.pctX(this, UI.BOARD_OFFSET);
        // Xác định TextureKeys dựa trên SceneKey
        let bannerKey = TextureKeys.S1_Banner;
        let textBannerKey = TextureKeys.S1_BannerText;
        // Hiển thị Banner và Text
        this.bannerImage = this.add.image(cx, bannerY, bannerKey).setScale(0.7).setOrigin(0.5, -0.1);
        this.bannerText = this.add.image(cx, bannerY, textBannerKey).setScale(0.9).setOrigin(0.5, -0.7);

        this.so1Image = this.add.image(cx * 0.39, bannerY + 180, TextureKeys.So1).setScale(1).setOrigin(0.5, -0.1);
        this.diceImage = this.add.image(cx * 0.53, bannerY + 170, TextureKeys.Dice).setScale(1).setOrigin(0.5, -0.1);
        
        // Tạo bàn tay gợi ý (ẩn đi, set depth cao nhất để đè lên mọi thứ)
        this.handHint = this.add
            .image(0, 0, TextureKeys.HandHint)
            .setDepth(2000) // Đảm bảo nó nằm trên các phần tử UI khác
            .setAlpha(0)
            .setScale(0.7);
        
    }

    public hidePalette() {
        this.tweens.add({
            targets: this.paletteButtons,
            scale: 0,
            alpha: 0,
            duration: 500,
            ease: 'Back.In'
        });
    }

    public hideBanners() {
        if (this.bannerImage) this.bannerImage.destroy();
        if (this.bannerText) this.bannerText.destroy();
        if (this.decorImage) this.decorImage.destroy();
        if (this.so1Image) this.so1Image.destroy();
        if (this.diceImage) this.diceImage.destroy();
    }
}
