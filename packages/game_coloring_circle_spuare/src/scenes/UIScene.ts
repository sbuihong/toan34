import Phaser from 'phaser';
import { SceneKeys, TextureKeys } from '../consts/Keys';
import { GameConstants } from '../consts/GameConstants';
import { GameUtils } from '../utils/GameUtils';
import { PaintManager } from '../utils/PaintManager';

export default class UIScene extends Phaser.Scene {
    private paintManager!: PaintManager;
    private sceneKey!: string;
    private paletteButtons: Phaser.GameObjects.Image[] = [];
    private firstColorBtn!: Phaser.GameObjects.Image;
    public handHint!: Phaser.GameObjects.Image;
    constructor() {
        super(SceneKeys.UI);
    }

    init(data: { paintManager: PaintManager; sceneKey: string }) {
        this.paintManager = data.paintManager;
        this.sceneKey = data.sceneKey; // Lưu sceneKey để dùng
        this.paletteButtons = [];
    }

    public setPaintManager(paintManager: PaintManager) {
        this.paintManager = paintManager;
    }

    create() {
        this.createUI();
    }

    private bannerImage!: Phaser.GameObjects.Image;
    private bannerText!: Phaser.GameObjects.Image;
    private cloud1!: Phaser.GameObjects.Image;
    private cloud2!: Phaser.GameObjects.Image;
    private cloud3!: Phaser.GameObjects.Image;
    private smoke1!: Phaser.GameObjects.Image;
    private smoke2!: Phaser.GameObjects.Image;
    private smoke3!: Phaser.GameObjects.Image;

    private createUI() {
        const UI = GameConstants.SCENE1.UI;
        const cx = GameUtils.pctX(this, 0.5);
        const cy = GameUtils.pctY(this, 0.5);

        // Tính toán vị trí Board dựa trên Banner
        const bannerY = GameUtils.pctY(this, UI.BANNER_Y);
        const bX = GameUtils.pctX(this, UI.BOARD_OFFSET);
        
        // Xác định TextureKeys dựa trên SceneKey
        let bannerKey = TextureKeys.S1_Banner;
        let textBannerKey = TextureKeys.S1_BannerText;
        let textOriginY = -0.9;

        
        this.cloud1 = this.add.image(cx * 0.5, cy * 1.4, TextureKeys.S1_Cl1);
        this.cloud2 = this.add.image(cx * 1.4, cy * 0.7, TextureKeys.S1_Cl2);
        this.cloud3 = this.add.image(cx * 1.5, cy * 1.5, TextureKeys.S1_Cl3);
        

        // Hiển thị Banner và Text
        this.bannerImage = this.add.image(cx, bannerY, bannerKey).setScale(0.8,0.75).setOrigin(0.5, -0.1);
        this.bannerText = this.add.image(cx, bannerY, textBannerKey).setScale(0.9).setOrigin(0.5, textOriginY);

        // Tạo bàn tay gợi ý (ẩn đi, set depth cao nhất để đè lên mọi thứ)
        this.handHint = this.add
            .image(0, 0, TextureKeys.HandHint)
            .setDepth(2000) // Đảm bảo nó nằm trên các phần tử UI khác
            .setAlpha(0)
            .setScale(0.7);
        
        this.createPalette();
    }

    private createPalette() {
        const UI = GameConstants.SCENE1.UI;
        // Chọn bộ màu dựa trên SceneKey
        const paletteData = GameConstants.PALETTE_DATA;

        const spacingX = GameUtils.pctX(this, UI.PALETTE_SPACING_X);
        const paletteY = GameUtils.pctY(this, UI.PALETTE_Y);
        
        // Tính toán vị trí bắt đầu để căn giữa
        const totalItems = paletteData.length + 1; // +1 cho Eraser
        const totalWidth = (totalItems - 1) * spacingX;
        const startX = (GameUtils.getW(this) - totalWidth) / 2;

        paletteData.forEach((item, i) => {
            const btnX = startX + i * spacingX;
            const btnY = paletteY;

            const btn = this.add.image(btnX, btnY, item.key).setInteractive().setDepth(1);

            // Logic visual: Nút đầu tiên to hơn (đang chọn)
            if (i === 0) {
                this.firstColorBtn = btn;
                btn.setScale(0.9).setAlpha(1);
                this.paintManager.setColor(item.color); // ✅ Sync màu cọ với nút đầu tiên
            } else {
                btn.setAlpha(0.8).setScale(0.7);
            }

            btn.on('pointerdown', () => {
                this.updatePaletteVisuals(btn);
                this.paintManager.setColor(item.color); // Đổi màu cọ
            });
            this.paletteButtons.push(btn);
        });

        // Tạo nút Tẩy (Eraser) - Nằm tiếp theo trong hàng ngang
        const eraserIndex = paletteData.length;
        const eraserX = startX + eraserIndex * spacingX;
        const eraserY = paletteY;

        const eraser = this.add
            .image(eraserX, eraserY, TextureKeys.BtnEraser)
            .setInteractive()
            .setAlpha(0.8)
            .setScale(0.7)
            .setDepth(1);
        eraser.on('pointerdown', () => {
            this.updatePaletteVisuals(eraser);
            this.paintManager.setEraser();
        });
        this.paletteButtons.push(eraser);
    }

    // Cập nhật hiệu ứng to/nhỏ của các nút màu khi được chọn
    private updatePaletteVisuals(activeBtn: Phaser.GameObjects.Image) {
        this.paletteButtons.forEach((b) => b.setScale(0.7).setAlpha(0.8));
        activeBtn.setScale(0.9).setAlpha(1);
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

    public updateBanner(sceneKey: string) {
        this.sceneKey = sceneKey;
        const UI = GameConstants.SCENE1.UI;
        const cx = GameUtils.pctX(this, 0.5);
        const cy = GameUtils.pctY(this, 0.5);
        const bannerY = GameUtils.pctY(this, UI.BANNER_Y);

        let textBannerKey = TextureKeys.S1_BannerText;
        let textOriginY = -0.9;
        if (this.sceneKey === SceneKeys.Scene2) {
            if (this.cloud1) this.cloud1.destroy();
            if (this.cloud2) this.cloud2.destroy();
            if (this.cloud3) this.cloud3.destroy();
            textBannerKey = TextureKeys.S2_BannerText;
            textOriginY = -1.1;
            this.smoke1 = this.add.image(cx * 0.7, cy * 0.5, TextureKeys.S2_Sm1);
            this.smoke2 = this.add.image(cx * 0.9, cy * 0.6, TextureKeys.S2_Sm2);
            this.smoke3 = this.add.image(cx * 1.15, cy * 0.45, TextureKeys.S2_Sm3);
        }

        if (this.bannerText) {
            this.bannerText.destroy();
        }
        this.bannerText = this.add.image(cx, bannerY, textBannerKey).setScale(0.9).setOrigin(0.5, textOriginY);
    }

    public hideBanners() {
        if (this.bannerImage) this.bannerImage.destroy();
        if (this.bannerText) this.bannerText.destroy();
    }

    public hideDecor(){
        if (this.cloud1) this.cloud1.destroy();
        if (this.cloud2) this.cloud2.destroy();
        if (this.cloud3) this.cloud3.destroy();
        if (this.smoke1) this.smoke1.destroy();
        if (this.smoke2) this.smoke2.destroy();
        if (this.smoke3) this.smoke3.destroy();
    }

    public resetPaletteSelection() {
        // 1. Reset visual cho tất cả nút
        this.paletteButtons.forEach((b) => b.setScale(0.7).setAlpha(0.8));
        
        // 2. Chọn nút đầu tiên (Màu đỏ)
        if (this.firstColorBtn) {
            this.firstColorBtn.setScale(0.9).setAlpha(1);
        }

        // 3. Reset màu cọ vẽ về màu đầu tiên
        // Lấy màu từ GameConstants nếu có thể, hoặc hardcode màu đỏ của palette đầu tiên
        const paletteData = GameConstants.PALETTE_DATA;
        if (paletteData && paletteData.length > 0) {
            this.paintManager.setColor(paletteData[0].color);
        }
    }
}
