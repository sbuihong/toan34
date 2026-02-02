import Phaser from 'phaser';

import { SceneKeys, TextureKeys, DataKeys, AudioKeys } from '../consts/Keys';
import { GameConstants } from '../consts/GameConstants';
import { GameUtils } from '../utils/GameUtils';
import { IdleManager } from '../utils/IdleManager';

import { changeBackground } from '../utils/BackgroundManager';

import {
    playVoiceLocked,
    setGameSceneReference,
    resetVoiceState,
} from '../utils/rotateOrientation';
import AudioManager from '../audio/AudioManager';
import { showGameButtons, sdk } from '../main';
import { game } from "@iruka-edu/mini-game-sdk";


export default class Scene1 extends Phaser.Scene {
    // Đối tượng âm thanh nền (Background Music)
    private bgm!: Phaser.Sound.BaseSound;

    // --- Managers ---
    private idleManager!: IdleManager; 

    // --- Game State ---
    private unfinishedPartsMap: Map<string, Phaser.GameObjects.Image> = new Map();
    private finishedParts: Set<string> = new Set();
    private totalParts: number = 0; 
    private score: number = 0; 
    private isIntroActive: boolean = false; 
    private isWaitingForIntroStart: boolean = true; 
    private answers: Phaser.GameObjects.Image[] = []; 
    private canSelect: boolean = false; 

    // --- UI Components ---
    private get handHint(): Phaser.GameObjects.Image | undefined {
         const uiScene = this.scene.get(SceneKeys.UI) as any;
         return uiScene?.handHint;
    }

    // --- Hint State ---
    private activeHintTween: Phaser.Tweens.Tween | null = null;
    private activeHintTarget: Phaser.GameObjects.Image | null = null;

    constructor() {
        super(SceneKeys.Scene1);
    }

    /**
     * Init data when scene starts/restarts
     */
    init(data?: { isRestart: boolean }) {
        this.unfinishedPartsMap.clear();
        this.finishedParts.clear();
        this.answers = [];
        this.totalParts = 0;
        this.score = 0;
        this.canSelect = false;

        if (data?.isRestart) {
            this.isWaitingForIntroStart = false;
            game.retryFromStart();
        } else {
            this.isWaitingForIntroStart = true;
        }
    }

    create() {
        showGameButtons();

        this.setupSystem(); // Cài đặt hệ thống
        this.setupBackgroundAndAudio(); // Cài đặt hình nền và nhạc nền
        this.createUI(); // Tạo giao diện
        
        // Chạy UI Scene
        this.scene.launch(SceneKeys.UI, { 
            sceneKey: SceneKeys.Scene1 
        });

        this.createLevel(); // Create level objects
        
        // SDK Integration
        game.setTotal(1);
        (window as any).irukaGameState = {
            startTime: Date.now(),
            currentScore: 0,
        };
        sdk.score(this.score, 0);
        sdk.progress({ levelIndex: 0, total: 1 });
        game.startQuestionTimer();

        this.setupInput();

        // this.playIntroSequence(); // Chạy hướng dẫn đầu game (Đã chuyển sang click-to-start)

        // Sự kiện khi quay lại tab game (Wake up)
        this.events.on('wake', () => {
            this.idleManager.reset();
            if (this.input.keyboard) this.input.keyboard.enabled = true;
        });

        // ✅ HIỂN THỊ FPS
        // this.fpsCounter = new FPSCounter(this);

        // Nếu là restart (không cần chờ tap), chạy intro luôn
        if (!this.isWaitingForIntroStart) {
            const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
            if (soundManager.context && soundManager.context.state === 'suspended') {
                soundManager.context.resume();
            }
            setTimeout(() => {
                this.playIntroSequence();
            }, 500);
        }
    }

    update(time: number, delta: number) {
        // Update idle timer if not busy
        if (
            !this.isIntroActive &&
            this.finishedParts.size < this.totalParts
        ) {
            this.idleManager.update(delta);
        }


    }

    shutdown() {
        this.stopIntro();

        this.scene.stop(SceneKeys.UI);
        if (this.bgm) {
            this.bgm.stop();
        }
    }

    // =================================================================
    // SYSTEM SETUP
    // =================================================================

    private setupSystem() {
        resetVoiceState();
        (window as any).gameScene = this;
        setGameSceneReference(this);

        this.idleManager = new IdleManager(GameConstants.IDLE.THRESHOLD, () =>
            this.showHint()
        );
    }

    private setupInput() {
        // Chuyển tiếp các sự kiện input sang cho PaintManager xử lý vẽ
        this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
            this.idleManager.reset();
            this.stopIntro();
            this.stopActiveHint();
        });

        // Khi chạm vào màn hình -> Reset bộ đếm Idle
        this.input.on('pointerdown', () => {
            // Nếu là lần chạm đầu tiên -> Bắt đầu Intro (và unlock Audio)
            if (this.isWaitingForIntroStart) {
                this.isWaitingForIntroStart = false;
                
                // Unlock audio context nếu bị chặn
                const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
                if (soundManager.context && soundManager.context.state === 'suspended') {
                    soundManager.context.resume();
                }
                // AudioManager.unlockAudio(); // ✅ Unlock Howler Audio

                this.playIntroSequence();
                return;
            }

            this.idleManager.reset();
            this.stopIntro();
            this.stopActiveHint();
        });
    }

    /**
     * Cài đặt hình nền và nhạc nền
     */
    private setupBackgroundAndAudio() {
        changeBackground('assets/images/bg/background.jpg');

        // Dừng nhạc nền cũ nếu có (tránh chồng nhạc)
        if (this.sound.get(AudioKeys.BgmNen)) {
            this.sound.stopByKey(AudioKeys.BgmNen);
        }
        // Khởi tạo và phát nhạc nền mới
        this.bgm = this.sound.add(AudioKeys.BgmNen, {
            loop: true,
            volume: 0.25,
        });
        this.bgm.play();
    }
    // =================================================================
    // UI & LEVEL CREATION
    // =================================================================

    private createUI() {
        const UI = GameConstants.SCENE1.UI;
        const cx = GameUtils.pctX(this, 0.5);
        const scl = [1, 0.72];

        // Tính toán vị trí Board dựa trên Banner
        // const bannerY = GameUtils.pctY(this, UI.BANNER_Y);
        const bannerHeight = this.textures.get(TextureKeys.S1_Banner).getSourceImage().height * 0.7; // Scale 0.7

        const boardY = bannerHeight + GameUtils.pctY(this, UI.BOARD_OFFSET);
        const board = this.add
            .image(cx, boardY, TextureKeys.S1_Board)
            .setOrigin(0.5, 0).setScale(0.7).setDepth(0);

        // board.displayWidth = GameUtils.getW(this) * 0.6;
        

    }

    private createLevel() {
        // Load cấu hình level từ JSON
        const data = this.cache.json.get(DataKeys.LevelS1Config);
        
        if (data && data.items && Array.isArray(data.items)) {
            data.items.forEach((item: any, index: number) => {
                // If item has a type, merge with definition
                let config = { ...item };
                if (item.type && data.definitions && data.definitions[item.type]) {
                    config = { ...data.definitions[item.type], ...item };
                }
                this.spawnCharacter(config, index);
            });
        } else if (data) {
             // Fallback for direct object structure
             if (data.parts) {
                this.spawnCharacter(data, 0);
             } else {
                 Object.values(data).forEach((config: any, index: number) => {
                     // Check if it looks like a config object (has parts)
                     if (config && config.parts) {
                        this.spawnCharacter(config, index);
                     }
                 });
             }
        }
    }

    private spawnCharacter(config: any, objectIndex: number = 0) {
        const cx = GameUtils.pctX(this, config.baseX_pct);
        const cy = GameUtils.pctY(this, config.baseY_pct);

        // Vẽ viền (Outline) lên trên cùng
        const outline = this.add
            .image(cx, cy, config.outlineKey)
            .setScale(config.baseScale)
            .setDepth(900)
            .setInteractive({ pixelPerfect: true, useHandCursor: config.correct !== undefined });

        // Correct Answer Logic
        if (config.correct !== undefined) {
             outline.setData('correct', config.correct);
            
             // If correct answer, add to unfinished parts for hint system
             if (config.correct === true) {
                // Set data cho Hand Hint (tự động tính center)
                outline.setData('hintX', 0);
                outline.setData('hintY', 0);
                outline.setData('originScale', config.baseScale);

                // Thêm vào map để hệ thống gợi ý hoạt động
                this.unfinishedPartsMap.set(`answer_${objectIndex}`, outline);
                this.totalParts = 1; 
            }

            outline.on('pointerdown', () => {
                this.onAnswerSelected(outline);
            });

             // Add to answers list
             this.answers.push(outline);
        }
        
    }

    // =================================================================
    // GAMEPLAY LOGIC
    // =================================================================

    /**
     * Xử lý khi người dùng chọn đáp án
     */
    private onAnswerSelected(target: Phaser.GameObjects.Image) {
        if (!this.canSelect) return;
        // Block interaction if level complete
        if (this.finishedParts.size >= this.totalParts && this.totalParts > 0) return;

        // Reset Idle Timer
        this.idleManager.reset();
        this.stopActiveHint();

        const isCorrect = target.getData('correct');

        if (isCorrect) {
            console.log('CORRECT ANSWER SELECTED!');
            game.finishQuestionTimer();
            
            // Đánh dấu đã hoàn thành
            this.finishedParts.add('correct_answer');

            // Hiệu ứng Visual: Phóng to nhẹ
            this.tweens.add({
                targets: target,
                scale: target.scale * 1.15,
                duration: 150,
                yoyo: true,
                repeat: 1
            });

            // Âm thanh đúng
            AudioManager.stopAll();
            AudioManager.play('sfx-correct_s2');
            AudioManager.play('sfx-ting');

            this.stopActiveHint();

            // Handle Win
            this.handleLevelComplete();

        } else {
             console.log('WRONG ANSWER SELECTED!');
             game.recordWrong();
            
            // Visual: Shake
            this.tweens.add({
                targets: target,
                x: '+=10',
                duration: 50,
                yoyo: true,
                repeat: 3
            });

            // Âm thanh sai (hoặc buzz)
           try {
                AudioManager.play('sfx-wrong'); 
           } catch(e) {
                // Fallback nếu không có file âm thanh
                console.warn('Playing wrong sfx failed', e);
           }

        }
    }

    private handleLevelComplete() {
        // --- GAME HUB COMPLETE ---
        this.score += 1;
        game.recordCorrect({ scoreDelta: 1 });
        (window as any).irukaGameState.currentScore = this.score;

        game.finalizeAttempt();
        sdk.requestSave({
            score: this.score,
            levelIndex: 0,
        });
        sdk.progress({
            levelIndex: 0,
            total: 1,
            score: this.score,
        });

        // Hide UI
        const uiScene = this.scene.get(SceneKeys.UI) as any;
        if (uiScene) {
            if (uiScene.hidePalette) uiScene.hidePalette();
            if (uiScene.hideBanners) uiScene.hideBanners();
        }

        this.time.delayedCall(GameConstants.SCENE1.TIMING.WIN_DELAY || 2000, () => {
            this.scene.start(SceneKeys.EndGame);
        });
    }

    // =================================================================
    // TUTORIAL & HINT
    // =================================================================

    public restartIntro() {
        this.stopIntro();
        this.time.delayedCall(GameConstants.SCENE1.TIMING.RESTART_INTRO, () =>
            this.playIntroSequence()
        );
    }

    private playIntroSequence() {
        this.isIntroActive = true;
        this.canSelect = false;
        this.time.delayedCall(5000, () => {
             this.canSelect = true;
        });

        playVoiceLocked(null, 'voice_intro_s2');
        // Đợi 1 chút rồi chạy animation tay hướng dẫn
        this.time.delayedCall(GameConstants.SCENE1.TIMING.INTRO_DELAY, () => {
            if (this.isIntroActive) this.runHandTutorial();
        });
    }

    private stopIntro() {
        this.isIntroActive = false;
        this.idleManager.start();

        if (this.handHint) {
            this.handHint.setAlpha(0).setPosition(-200, -200);
        }
    }

    /**
     * Tutorial đầu game: Tay cầm màu đỏ tô mẫu
     */
    private runHandTutorial() {
        // Kiểm tra: Nếu không phải đang chạy Intro thì thoát hàm luôn (không làm gì cả)
        if (!this.isIntroActive) return;

        // Kiểm tra: Đảm bảo object bàn tay (handHint) đã tồn tại
        if (!this.handHint) return;
        
        // Đặt lại điểm neo (origin) của bàn tay về góc trên-trái (0,0) để tính toán vị trí dễ hơn
        this.handHint.setOrigin(0, 0);

        // Sắp xếp các đáp án theo thứ tự từ TRÁI sang PHẢI (dựa vào tọa độ X)
        // Để bàn tay di chuyển lần lượt từng cái một cách tự nhiên
        const sortedAnswers = [...this.answers].sort((a, b) => a.x - b.x);

        // Nếu không tìm thấy đáp án nào thì thoát
        if (sortedAnswers.length === 0) return;

        // Khởi tạo mảng chứa các bước hiệu ứng (Tween Chain)
        const tweensChain: any[] = [];
        const INTRO = GameConstants.SCENE1.INTRO_HAND; // Lấy thông số cấu hình thời gian

        // Create movement/tap effect for each answer
        sortedAnswers.forEach((ans, index) => {
             const hX = ans.getData('hintX') || 0;
             const hY = ans.getData('hintY') || 0;
             const originScale = ans.getData('originScale') || 1;
             
             const destX = ans.x + (hX * originScale);
             const destY = ans.y + (hY * originScale);

             // 1. Move to answer
             tweensChain.push({
                 targets: this.handHint,
                 alpha: 1, 
                 x: destX,
                 y: destY,
                 duration: index === 0 ? INTRO.MOVE : INTRO.DRAG, 
                 ease: 'Power2', 
             });

             // 2. Tap Tap effect
             tweensChain.push({
                targets: this.handHint,
                scale: 0.5, 
                duration: INTRO.TAP,
                yoyo: true, 
                repeat: 1 
             });
        });

        // Finally fade out
        tweensChain.push({
            targets: this.handHint,
             alpha: 0,
             duration: 500,
             onComplete: () => {
                 this.handHint?.setPosition(-200, -200);
                 
                 // Repeat if intro still active
                 if (this.isIntroActive) {
                     this.time.delayedCall(1000, () => this.runHandTutorial());
                 }
             }
        });

        // Kích hoạt chuỗi hiệu ứng đã xây dựng ở trên
        this.tweens.chain({
            tweens: tweensChain
        });
    }

    /**
     * Idle Hint: Show hint when inactive
     * Logic same as tutorial: Visit each answer
     */
    private showHint() {
        this.idleManager.reset();

        game.addHint();
        const IDLE_CFG = GameConstants.IDLE;
        
        if (!this.handHint) return;
        this.handHint.setOrigin(0, 0);

        // Sort Left -> Right
        const sortedAnswers = [...this.answers].sort((a, b) => a.x - b.x);

        if (sortedAnswers.length === 0) return;

        AudioManager.play('hint');

        const tweensChain: any[] = [];
        
        sortedAnswers.forEach((ans, index) => {
            const hX = ans.getData('hintX') || 0;
            const hY = ans.getData('hintY') || 0;
            const originScale = ans.getData('originScale') || 1;
            
            const destX = ans.x + (hX * originScale);
            const destY = ans.y + (hY * originScale);

            // 1. Teleport to position (No fly-in)
            tweensChain.push({
                targets: this.handHint,
                x: destX,
                y: destY,
                duration: 0 
            });

            // 2. Fade In
            tweensChain.push({
                targets: this.handHint,
                alpha: 1,
                duration: IDLE_CFG.FADE_IN,
                ease: 'Linear',
            });

            // 3. Tap Tap
            tweensChain.push({
                targets: this.handHint,
                scale: 0.5,
                duration: IDLE_CFG.SCALE,
                yoyo: true, 
                repeat: 1 
            });

            // 4. Fade Out
            tweensChain.push({
                targets: this.handHint,
                alpha: 0,
                duration: IDLE_CFG.FADE_OUT,
            });
        });

        // Hide when done
        tweensChain.push({
            targets: this.handHint,
            alpha: 0,
            duration: 100,
            onComplete: () => {
                this.handHint?.setPosition(-200, -200);
                this.idleManager.start(); 
            }
        });

        this.tweens.chain({
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
            this.activeHintTarget.setAlpha(0.01); // Reset alpha
            this.activeHintTarget.setScale(this.activeHintTarget.getData('originScale'));
            this.activeHintTarget = null;
        }

        if (this.handHint) {
            this.tweens.killTweensOf(this.handHint);
            this.handHint.setAlpha(0).setPosition(-200, -200);
        }
    }
}
