import Phaser from 'phaser';
import UIScene from './UIScene';
import { SceneKeys, TextureKeys, AudioKeys, DataKeys } from '../consts/Keys';
import { GameConstants } from '../consts/GameConstants';
import { GameUtils } from '../utils/GameUtils';
import { changeBackground } from '../utils/BackgroundManager';
import AudioManager from '../audio/AudioManager';
import { showGameButtons } from '../main';
import { setGameSceneReference, resetVoiceState, playVoiceLocked } from '../utils/rotateOrientation';
import { IdleManager } from '../utils/IdleManager';

// Managers
import { LassoManager } from '../managers/LassoManager';
import { ObjectManager } from '../managers/ObjectManager';
import { LassoValidation } from '../utils/LassoValidation';
import { game } from "@iruka-edu/mini-game-sdk";
import { sdk } from '../main';

export default class Scene1 extends Phaser.Scene {
    private bgm!: Phaser.Sound.BaseSound;
    private lassoManager!: LassoManager;
    private objectManager!: ObjectManager;

    // Trạng thái Logic
    private isIntroductionPlayed: boolean = false;
    private idleManager!: IdleManager;
    // private handHint!: Phaser.GameObjects.Image; // Đã xóa reference local
    private isWaitingForIntroStart: boolean = true;
    
    // List lưu các mục tiêu chưa được khoanh (để random hint)
    private unfinishedTargets: Phaser.GameObjects.Image[] = [];
    
    // Lưu trữ graphics objects của vòng tròn xanh để xóa khi restart
    private greenCircleGraphics: Phaser.GameObjects.Graphics[] = [];

    private get uiScene(): UIScene {
        return this.scene.get(SceneKeys.UI) as UIScene;
    }
    
    // Logic "Tìm Tất Cả"
    private foundTargets: number[] = [];
    private totalTargets: number = 0;
    private currentLevelIndex: number = 0;

    // Trạng thái Hướng Dẫn & Gợi Ý
    private isIntroActive: boolean = false;
    private activeHintTween: Phaser.Tweens.Tween | null = null;
    private activeHintTarget: Phaser.GameObjects.Image | null = null;

    constructor() {
        super(SceneKeys.Scene1);
    }

    init(data?: { isRestart: boolean; fromEndGame?: boolean }) {
        resetVoiceState();
        
        // Reset trạng thái logic
        this.isIntroActive = false;
        this.activeHintTween = null;
        this.activeHintTarget = null;
        // this.handHint = undefined as any; // Ép buộc reset reference
        
        this.foundTargets = [];
        this.totalTargets = 0;
        this.currentLevelIndex = 0;
        this.unfinishedTargets = [];
        
        // Xóa tất cả vòng tròn xanh cũ
        this.greenCircleGraphics.forEach(g => g.destroy());
        this.greenCircleGraphics = [];

        if (data?.isRestart) {
            this.isWaitingForIntroStart = false;
            if (!data.fromEndGame) {
                game.retryFromStart(); 
            }
        } else {
            this.isWaitingForIntroStart = true;
        }
    }

    create() {
        showGameButtons();
        
        this.setupSystem();
        this.setupBackgroundAndAudio();
        this.createUI();

        // 4. Load dữ liệu Level & Spawn Objects
        const levelConfig = this.cache.json.get(DataKeys.LevelS1Config);
        this.objectManager.spawnObjectsFromConfig(levelConfig);
        
        // Đếm tổng số target đúng
        this.totalTargets = this.objectManager.getAllObjects().filter(obj => this.objectManager.isCorrectAnswer(obj)).length;
        console.log(`[Scene1] Tổng số target cần tìm: ${this.totalTargets}`);

        // Tích hợp SDK
        game.setTotal(2); 
        (window as any).irukaGameState = {
            startTime: Date.now(),
            currentScore: 0,
        };
        sdk.score(0, 2);
        sdk.progress({ levelIndex: 0, total: 2 });
        game.startQuestionTimer();

        // Khởi tạo danh sách chưa khoanh
        this.initUnfinishedTargets();

        this.setupInput();

        // Nếu là restart (không cần chờ tap), chạy intro luôn
        if (!this.isWaitingForIntroStart) {
            const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
            if (soundManager.context && soundManager.context.state === 'suspended') {
                soundManager.context.resume();
            }
            this.playIntroSequence();
        }

        // 6. Khởi chạy UI Overlay
        if (!this.scene.get(SceneKeys.UI).scene.isActive()) {
            this.scene.launch(SceneKeys.UI, { sceneKey: SceneKeys.Scene1 });
            this.scene.bringToTop(SceneKeys.UI);
        }
    }

    update(time: number, delta: number) {
        if (this.idleManager) {
            this.idleManager.update(delta);
        }
    }

    shutdown() {
        // 1. Dọn dẹp Âm thanh (Audio Cleanup)
        if (this.bgm) {
            this.bgm.stop();
        }
        // Dừng tất cả âm thanh SFX khác đang chạy qua Howler
        AudioManager.stopAll();

        // 2. Dọn dẹp các Manager
        if (this.lassoManager) {
            this.lassoManager.disable();
             // Nếu có hàm destroy thì gọi luôn tại đây để chắc chắn
        }
        if (this.idleManager) {
            this.idleManager.stop();
        }
        
        // Reset các reference đến object đã bị destroy
        this.activeHintTarget = null;
        this.activeHintTween = null;
        
        // Xóa tất cả vòng tròn xanh
        this.greenCircleGraphics.forEach(g => g.destroy());
        this.greenCircleGraphics = [];

        // 3. Dọn dẹp hệ thống
        this.tweens.killAll(); // Dừng mọi animation đang chạy
        this.input.off('pointerdown'); // Gỡ bỏ event listener ở Scene context
        
        // 4. Xóa tham chiếu global
        if (window.gameScene === this) {
            window.gameScene = undefined;
        }

        console.log("Scene1: Shutdown hoàn tất. Đã dọn dẹp resources.");
    }

    // =================================================================
    // PHẦN 1: CÀI ĐẶT HỆ THỐNG (SYSTEM SETUP)
    // =================================================================

    private setupSystem() {
        resetVoiceState();
        (window as any).gameScene = this;
        setGameSceneReference(this);

        this.lassoManager = new LassoManager(this);
        this.lassoManager.onLassoComplete = (polygon: Phaser.Geom.Polygon) => {
            this.handleLassoSelection(polygon);
        };

        this.objectManager = new ObjectManager(this);

        this.idleManager = new IdleManager(GameConstants.IDLE.THRESHOLD, () => {
            this.showHint();
        });
    }

    // Khởi tạo danh sách chưa khoanh
    private initUnfinishedTargets() {
        this.unfinishedTargets = this.objectManager.getAllObjects().filter(obj => 
            this.objectManager.isCorrectAnswer(obj)
        );
        Phaser.Utils.Array.Shuffle(this.unfinishedTargets); // Xáo trộn để random ngay từ đầu
        console.log(`[Scene1] Đã khởi tạo unfinishedTargets: ${this.unfinishedTargets.length}`);
    }

    private setupInput() {
        this.input.on('pointerdown', () => {
            if (this.isWaitingForIntroStart) {
                this.isWaitingForIntroStart = false;
                
                const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
                if (soundManager.context && soundManager.context.state === 'suspended') {
                    soundManager.context.resume();
                }

                this.playIntroSequence();
                return;
            }

            this.idleManager.reset();
            this.stopIntro();
            this.stopActiveHint();
        });
    }

    private setupBackgroundAndAudio() {
        // 1. Đổi Background
        changeBackground('assets/images/bg/background.jpg');

        // 2. Phát nhạc nền (BGM)
        if (this.sound.get(AudioKeys.BgmNen)) {
            this.sound.stopByKey(AudioKeys.BgmNen);
        }
        this.bgm = this.sound.add(AudioKeys.BgmNen, {
            loop: true,
            volume: 0.25,
        });
        this.bgm.play();
    }

    public restartIntro() {
        this.stopIntro();
        this.time.delayedCall(GameConstants.SCENE1.TIMING.RESTART_INTRO, () =>
            this.playIntroSequence()
        );
    }

    private playIntroSequence() {
        this.isIntroActive = true;
        
        // Sử dụng hàm playVoiceLocked nếu có (từ utils/rotateOrientation), hoặc fallback
        playVoiceLocked(this.sound, AudioKeys.VoiceIntro);

        // Nếu restart → Enable lasso NGAY, không delay
        if (!this.isWaitingForIntroStart) {
            this.lassoManager.enable();
            console.log("Gameplay đã kích hoạt ngay lập tức (restart mode).");
        }

        // Nếu là restart, không cần delay intro quá lâu (hoặc 0)
        const delay = this.isWaitingForIntroStart ? GameConstants.SCENE1.TIMING.INTRO_DELAY : 500;

        // Đợi 1 chút rồi chạy animation tay hướng dẫn
        this.time.delayedCall(delay, () => {
            if (this.isIntroActive) {
               if (this.isWaitingForIntroStart) {
                   this.setupGameplay(); // Kích hoạt gameplay (enable lasso) cho lần đầu
               }
               this.runHandTutorial();
            }
        });
    }

    private stopIntro() {
        this.isIntroActive = false;
        this.idleManager.start();

        if (this.uiScene && this.uiScene.handHint) {
            this.uiScene.handHint.setAlpha(0).setPosition(-200, -200);
            this.tweens.killTweensOf(this.uiScene.handHint);
        }
    }

    // =================================================================
    // PHẦN 2: TẠO GIAO DIỆN & LEVEL (UI & LEVEL CREATION)
    // =================================================================

    private createUI() {
        const UI = GameConstants.SCENE1.UI;
        const cx = GameUtils.pctX(this, 0.5);
        
        // Cấu hình Banner
        const bannerTexture = this.textures.get(TextureKeys.S1_Banner);
        let bannerHeight = 100;
        if (bannerTexture && bannerTexture.key !== '__MISSING') {
            bannerHeight = bannerTexture.getSourceImage().height * 0.7;
        }
        const boardY = bannerHeight + GameUtils.pctY(this, UI.BOARD_OFFSET);
        
        // Board
        //  const scl = [1, 0.72];
        // const board = this.add.image(cx, boardY, TextureKeys.S1_Board)
        //     .setOrigin(0.5, 0)
        //     .setScale(scl[0], scl[1])
        //     .setDepth(0);
        //  board.displayWidth = GameUtils.getW(this) * 0.93;

        const board = this.add.image(cx, boardY, TextureKeys.S1_Board)
            .setOrigin(0.5, 0).setScale(0.7).setDepth(0);
            
        // Tính toán bounds của board (giới hạn vẽ lasso)
        const boardWidth = board.displayWidth;
        const boardHeight = board.displayHeight;
        const boardX = board.x - boardWidth / 2;  // origin(0.5, 0) nghĩa là tâm ngang, đỉnh trên
        const boardY_start = board.y;             // Vị trí Y bắt đầu từ đỉnh
        const boardBounds = new Phaser.Geom.Rectangle(boardX, boardY_start, boardWidth, boardHeight);
        
        // Truyền bounds (giới hạn vùng) vào LassoManager
        this.lassoManager.setBoardBounds(boardBounds);
        
        console.log(`Board Bounds (giới hạn): x=${boardX}, y=${boardY_start}, w=${boardWidth}, h=${boardHeight}`);
    }

    // =================================================================
    // PHẦN 3: LOGIC GAMEPLAY (GAMEPLAY LOGIC)
    // =================================================================
    
    private setupGameplay() {
        // Đợi một chút rồi mới cho phép chơi (để nghe intro hoặc chuẩn bị)
        // Nếu restart thì delay ngắn hơn hoặc 0
        const delay = this.isWaitingForIntroStart ? GameConstants.SCENE1.TIMING.GAME_START_DELAY : 0;
        
        this.time.delayedCall(delay, () => {
            // Kích hoạt tính năng vẽ Lasso
            this.lassoManager.enable();
            
            console.log("Gameplay đã kích hoạt sau delay.");
        });

        // ✅ Đã xóa duplicate listener - Logic reset IdleManager và stopActiveHint đã có trong setupInput()
    }

    private handleLassoSelection(polygon: Phaser.Geom.Polygon) {
        // 1. Validate (kiểm tra) Selection bằng Utility Class
        const result = LassoValidation.validateSelection(polygon, this.objectManager);
        
        const selectedObjects = result.selectedObjects;
        const isSuccess = result.success;
        const failureReason = result.failureReason;

        if (isSuccess && selectedObjects.length === 1) {
            const target = selectedObjects[0] as Phaser.GameObjects.Image;
            const targetId = target.getData('id');
            console.log(`Kiểm tra Target ID: ${targetId} (Kiểu: ${typeof targetId}) vs Đã tìm: ${this.foundTargets}`);

            // Kiểm tra xem đã khoanh chưa
            if (this.foundTargets.includes(targetId)) {
                console.log("⚠️ Hình này đã khoanh rồi!");
                // Có thể play sound nhắc nhở nhẹ hoặc ignore
                return;
            }

            // --- TRƯỜNG HỢP THÀNH CÔNG ---
            
            // Xóa nét vẽ lasso của user trước khi hiện vòng tròn đúng
            this.lassoManager.clear();

            // Vẽ vòng tròn bao quanh hình đúng
            const graphics = this.add.graphics();
            graphics.setDepth(100); 
            graphics.lineStyle(10, 0x00ff00); // Nét xanh lá, dày 10px
            const radius = (Math.max(target.displayWidth, target.displayHeight) / 2);
            graphics.strokeCircle(target.x, target.y, radius);
            
            // Lưu graphics để xóa khi restart
            this.greenCircleGraphics.push(graphics);

            console.log("✅ Khoanh ĐÚNG!");
            AudioManager.play("sfx-ting");
            
            this.objectManager.highlightObjects([target], true);
            this.foundTargets.push(targetId);
            
            // Xóa khỏi danh sách chưa khoanh để không gợi ý lại (dùng ID để so sánh chắc chắn)
            this.unfinishedTargets = this.unfinishedTargets.filter(obj => {
                const objId = obj.getData('id');
                return objId !== targetId;
            });
            console.log(`[Scene1] Đã xóa target ${targetId} khỏi unfinishedTargets. Còn lại: ${this.unfinishedTargets.length}`);

            // Ẩn gợi ý nếu đang hiện
            this.stopActiveHint();

            // SDK: Ghi nhận điểm trung gian
            // Mỗi lần khoanh đúng 1 hình, ghi nhận điểm
            this.currentLevelIndex += 1;
            game.finishQuestionTimer(); 
            game.recordCorrect({ scoreDelta: 1 });
            sdk.score(this.foundTargets.length, this.totalTargets);
            sdk.progress({ levelIndex: this.currentLevelIndex, total: this.totalTargets, score: this.foundTargets.length });

            // Kiểm tra điều kiện thắng
            if (this.foundTargets.length >= this.totalTargets) {
                console.log("🎉 CHIẾN THẮNG! Đã tìm tất cả targets.");
                AudioManager.play("sfx-correct"); // Âm thanh thành công cuối cùng

                // Vô hiệu hóa input
                this.lassoManager.disable();

                // --- HOÀN THÀNH GAME ---
                game.finalizeAttempt();

                // Đợi WIN_DELAY rồi chuyển cảnh
                const t = GameConstants.SCENE1.TIMING.WIN_DELAY;
                this.time.delayedCall(t, () => {
                    this.scene.stop(SceneKeys.UI);
                    this.scene.start(SceneKeys.EndGame);
                });
            } else {
                console.log(`👍 Đã tìm ${this.foundTargets.length}/${this.totalTargets}. Tiếp tục!`);
                // AudioManager.play("sfx-correct"); // Âm thanh thành công trung gian
                const randomSFX = Phaser.Math.Between(1, 4);
                AudioManager.play(`sfx-${randomSFX}`);
                game.startQuestionTimer(); // Bắt đầu timer cho target tiếp theo
                // Không disable lasso manager, để người chơi khoanh tiếp
            }

        } else {
            // --- TRƯỜNG HỢP THẤT BẠI ---
            console.log(`❌ Khoanh SAI: ${failureReason}`);
            
            // Rung các hình ảnh
            const allObjects = this.objectManager.getAllObjects();
            allObjects.forEach(obj => {
                this.tweens.add({
                    targets: obj,
                    x: obj.x + 10,
                    duration: 50,
                    yoyo: true,
                    repeat: 3,
                    ease: 'Linear'
                });
            });
            
            AudioManager.play("sfx-wrong");
            game.recordWrong();
            // Cooldown: Phạt người chơi phải đợi 
            this.lassoManager.disable();
            
            this.time.delayedCall(500, () => {
                this.lassoManager.enable();
            });
        }
    }

    // =================================================================
    // PHẦN 4: HƯỚNG DẪN & GỢI Ý (TUTORIAL & HINT)
    // =================================================================
    /**
     * Tutorial đầu game: Hiển thị gợi ý bàn tay xoay vòng tròn
     * tay khoanh tròn mẫu quanh đáp án đúng
     */
    private runHandTutorial() {
        if (!this.isIntroActive) return;

        // 1. Tìm target đúng chưa được khoanh (filter theo foundTargets)
        const unfinishedCorrectTargets = this.objectManager.getAllObjects().filter(obj => {
            if (!this.objectManager.isCorrectAnswer(obj)) return false;
            const objId = obj.getData('id');
            return !this.foundTargets.includes(objId);
        });
        
        if (unfinishedCorrectTargets.length === 0) {
            console.log('[Scene1] Không còn target chưa hoàn thành cho tutorial!');
            return;
        }
        
        // Lấy target đầu tiên chưa khoanh (Tutorial nên cố định, không random)
        const target = unfinishedCorrectTargets[0];
        
        const targetId = target.getData('id');
        console.log(`[Scene1] Tutorial gợi ý target ID: ${targetId}`);

        const image = target as Phaser.GameObjects.Image;
        const radius = (Math.max(image.displayWidth, image.displayHeight) / 2);

        // Lấy bàn tay từ UIScene
        const handHint = this.uiScene.handHint;
        if (!handHint) return;

        // Set origin (0.1,0.1) để ngón tay chỉ chính xác
        handHint.setOrigin(0.1, 0.1);
        handHint.setVisible(true);
        handHint.setAlpha(0);
        handHint.setScale(0.7);

        // Lấy hintPoints nếu có (danh sách các điểm cần hint)
        const hintPoints = target.getData('hintPoints');
        const originScale = target.getData('originScale') || 1;

        const tweensChain: any[] = [];
        
        if (hintPoints && hintPoints.length > 0) {
            // Logic mới: Di chuyển qua các điểm hint
            const baseX = image.x;
            const baseY = image.y;

            // Điểm bắt đầu
            const firstP = hintPoints[0];
            const startX = baseX + (firstP.x * originScale);
            const startY = baseY + (firstP.y * originScale);

            handHint.setPosition(startX, startY);

            // 1. Hiện ra tại điểm đầu tiên
            tweensChain.push({ alpha: 1, duration: 500 });

            // 2. Vẽ vòng tròn tại điểm đầu tiên (3 vòng nhỏ)
            for (let loop = 0; loop < 3; loop++) {
                const circleRadius = radius * 0.8;
                const steps = 8; // Số bước để tạo vòng tròn mượt
                
                for (let step = 0; step < steps; step++) {
                    const angle = (step / steps) * Phaser.Math.PI2 - Phaser.Math.PI2 / 4;
                    const offsetX = circleRadius * Math.cos(angle);
                    const offsetY = circleRadius * Math.sin(angle);
                    
                    tweensChain.push({
                        x: startX + offsetX,
                        y: startY + offsetY,
                        duration: 2000 / steps / 3, // 2s cho 3 vòng
                        ease: 'Linear'
                    });
                }
            }

            // 3. Di chuyển đến các điểm còn lại và vẽ vòng tròn
            for (let i = 1; i < hintPoints.length; i++) {
                const p = hintPoints[i];
                const destX = baseX + (p.x * originScale);
                const destY = baseY + (p.y * originScale);
                
                // Di chuyển đến điểm mới
                tweensChain.push({ x: destX, y: destY, duration: 300 });
                
                // Vẽ vòng tròn tại điểm mới (2 vòng)
                for (let loop = 0; loop < 2; loop++) {
                    const circleRadius = radius * 0.8;
                    const steps = 8;
                    
                    for (let step = 0; step < steps; step++) {
                        const angle = (step / steps) * Phaser.Math.PI2 - Phaser.Math.PI2 / 4;
                        const offsetX = circleRadius * Math.cos(angle);
                        const offsetY = circleRadius * Math.sin(angle);
                        
                        tweensChain.push({
                            x: destX + offsetX,
                            y: destY + offsetY,
                            duration: 1500 / steps / 2,
                            ease: 'Linear'
                        });
                    }
                }
            }

        } else {
            // Logic cũ: Vẽ vòng tròn xung quanh target
            const startX = image.x + radius * Math.cos(-Phaser.Math.PI2 / 4);
            const startY = image.y + radius * Math.sin(-Phaser.Math.PI2 / 4);
            
            handHint.setPosition(startX, startY);

            // 1. Hiện ra
            tweensChain.push({ alpha: 1, duration: 500 });

            // 2. Xoay 2 vòng tròn - Dùng onUpdate để mượt mà hơn
            const circleData = { angle: 0 };
            tweensChain.push({
                targets: circleData,
                angle: Phaser.Math.PI2 * 2, // 2 vòng tròn
                duration: 4000, // 4 giây cho 2 vòng (2s mỗi vòng)
                ease: 'Linear',
                onUpdate: () => {
                    const currentAngle = circleData.angle - Phaser.Math.PI2 / 4;
                    handHint.x = image.x + radius * Math.cos(currentAngle);
                    handHint.y = image.y + radius * Math.sin(currentAngle);
                }
            });
        }

        // 4. Biến mất và lặp lại
        tweensChain.push({
            alpha: 0,
            duration: 500,
            onComplete: () => {
                handHint.setPosition(-200, -200);
                // Lặp lại nếu Intro chưa kết thúc
                if (this.isIntroActive) {
                    this.time.delayedCall(1000, () => this.runHandTutorial());
                }
            },
        });

        // Chạy chuỗi animation
        this.tweens.chain({
            targets: handHint,
            tweens: tweensChain,
        });
    }

    /**
     * Gợi ý khi rảnh (Idle Hint)
     */
    private showHint() {
        game.addHint();
        
        // Lấy tất cả target đúng (role=correct) từ objectManager
        const allCorrectTargets = this.objectManager.getAllObjects().filter(obj => 
            this.objectManager.isCorrectAnswer(obj)
        );
        
        // Lọc ra những target chưa được khoanh (chưa có trong foundTargets)
        const remainingTargets = allCorrectTargets.filter(obj => {
            const objId = obj.getData('id');
            return !this.foundTargets.includes(objId);
        });
        
        if (remainingTargets.length === 0) {
            console.log('[Scene1] Tất cả target đã được khoanh, không cần hint nữa!');
            return;
        }

        console.log(`[Scene1] Hiển thị gợi ý. Target còn lại: ${remainingTargets.length}, Đã tìm: [${this.foundTargets}]`);

        // Random chọn 1 target từ danh sách chưa khoanh
        const randomIndex = Phaser.Math.Between(0, remainingTargets.length - 1);
        const target = remainingTargets[randomIndex] as Phaser.GameObjects.Image;
        
        const targetId = target.getData('id');
        console.log(`[Scene1] Gợi ý target ID: ${targetId}`);

        AudioManager.play('hint');

        const IDLE_CFG = GameConstants.IDLE;

        // Hiệu ứng 1: Nhấp nháy đối tượng đó

        // Hiệu ứng 2: Bàn tay khoanh tròn
        const handHint = this.uiScene.handHint;
        if (!handHint) return;

        // Set origin (0.1,0.1) để ngón tay chỉ chính xác
        handHint.setOrigin(0.1, 0.1);
        handHint.setScale(0.7);

        const radius = (Math.max(target.displayWidth, target.displayHeight) / 2);
        const startX = target.x + radius * Math.cos(-Phaser.Math.PI2 / 4);
        const startY = target.y + radius * Math.sin(-Phaser.Math.PI2 / 4);
        
        handHint.setPosition(startX, startY).setAlpha(0);

        const tweensChain: any[] = [];

        // 1. Hiện ra
        tweensChain.push({ alpha: 1, duration: IDLE_CFG.FADE_IN });

        // 2. Vẽ 2 vòng tròn xung quanh target - Dùng onUpdate để mượt mà hơn
        const circleData = { angle: 0 };
        tweensChain.push({
            targets: circleData,
            angle: Phaser.Math.PI2 * 2, // 2 vòng tròn
            duration: 3000, // 3 giây cho 2 vòng (1.5s mỗi vòng)
            ease: 'Linear',
            onUpdate: () => {
                const currentAngle = circleData.angle - Phaser.Math.PI2 / 4;
                handHint.x = target.x + radius * Math.cos(currentAngle);
                handHint.y = target.y + radius * Math.sin(currentAngle);
            }
        });

        // 3. Biến mất
        tweensChain.push({ alpha: 0, duration: IDLE_CFG.FADE_OUT });

        this.tweens.chain({
            targets: handHint,
            tweens: tweensChain
        });
    }

    private stopActiveHint() {
        if (this.activeHintTween) {
            this.activeHintTween.stop();
            this.activeHintTween = null;
        }

        if (this.activeHintTarget) {
            this.tweens.killTweensOf(this.activeHintTarget);
            const originScale = this.activeHintTarget.getData('originScale') || this.activeHintTarget.scale;
            this.activeHintTarget.setScale(originScale);
            this.activeHintTarget.setAlpha(1);
            this.activeHintTarget = null;
        }

        const handHint = this.uiScene?.handHint;
        if (handHint) {
            this.tweens.killTweensOf(handHint);
            handHint.setAlpha(0).setPosition(-200, -200);
        }
    }
}
