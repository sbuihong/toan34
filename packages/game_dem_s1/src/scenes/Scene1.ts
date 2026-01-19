import Phaser from 'phaser';
import { SceneKeys, TextureKeys, AudioKeys, DataKeys } from '../consts/Keys';
import { GameConstants } from '../consts/GameConstants';
import { GameUtils } from '../utils/GameUtils';
import { changeBackground } from '../utils/BackgroundManager';
import { VoiceRecorder } from '../utils/VoiceRecorder';
import AudioManager from '../audio/AudioManager';
import { showGameButtons, hideGameButtons } from '../main';
import { useVoiceEvaluation } from '../hooks/useVoiceEvaluation';
import { playVoiceLocked, setGameSceneReference, resetVoiceState } from '../utils/rotateOrientation';
import { IdleManager } from '../utils/IdleManager';

export default class Scene1 extends Phaser.Scene {
    private bgm!: Phaser.Sound.BaseSound;
    private voiceRecorder!: VoiceRecorder;
    private objectsToCount: Phaser.GameObjects.Image[] = [];
    private currentQuota: number = 0;
    private currentQuestionIndex: number = 0;
    private levelTarget: any = null;

    private isIntroActive: boolean = false;
    private isWaitingForIntroStart: boolean = true;
    private static hasInteracted: boolean = false;

    // --- LOGIC STATES ---
    private isProcessing: boolean = false; // Chặn spam request
    private isSessionActive: boolean = false; // Check session status
    private submissionCount: number = 0; // Check valid submissions

    private testMode: boolean = true; // Bật Test Mode để debug

    // Voice Evaluation Hook (Helper)
    private voiceHelper = useVoiceEvaluation({
        childId: 'sonbui_8386',
        gameId: 'game_dem_so_1',
        gameVersion: '1.0.0',
        ageLevel: '3-4'
    });
    
    // Các phần tử UI
    private btnMic!: Phaser.GameObjects.Image;
    private btnPlayback!: Phaser.GameObjects.Image; // Nút nghe lại
    private textHint!: Phaser.GameObjects.Text;
    private totalQuestions: number = 3; 

    // Idle
    private idleManager!: IdleManager;
    private handCursor!: Phaser.GameObjects.Image;
    private handTween!: Phaser.Tweens.Tween;

    constructor() {
        super(SceneKeys.Scene1);
    }

    init() {
        this.objectsToCount = [];
        this.currentQuestionIndex = 0;
        this.isProcessing = false;
        this.submissionCount = 0;
        this.isSessionActive = false;
        resetVoiceState();
    }

    create() {
        window.gameScene = this;
        setGameSceneReference(this);
        showGameButtons();

        this.setupBackgroundAndAudio();
        this.createUI();
        this.loadLevel(DataKeys.LevelS1Config);
        
        // Setup Voice Recorder
        this.setupVoiceRecorder();

        // Setup Idle Manager
        this.setupIdleManager();

        // Setup Lifecycle Listeners (Exit/Reload/Offline)
        this.setupLifecycleListeners();

        // Launch UI Scene
        if (!this.scene.get(SceneKeys.UI).scene.isActive()) {
            this.scene.launch(SceneKeys.UI, { sceneKey: SceneKeys.Scene1 });
            this.scene.bringToTop(SceneKeys.UI);
        }

        this.input.on('pointerdown', () => {
            // Bắt đầu luồng Game
            this.runGameFlow();
        });

        // Xử lý Logic Intro (Tap to start cho lần đầu)
        if (Scene1.hasInteracted) {
             this.isWaitingForIntroStart = false;
             
             // Auto play
             const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
             if (soundManager.context && soundManager.context.state === 'suspended') {
                soundManager.context.resume();
            }
            setTimeout(() => {
                this.playIntroSequence();
            }, 500);

        } else {
             this.isWaitingForIntroStart = true;
             // Hiển thị gợi ý chạm màn hình (Option)
             // console.log("Chạm vào màn hình để bắt đầu");
             
             this.input.once('pointerdown', () => {
            Scene1.hasInteracted = true;
            this.isWaitingForIntroStart = false;

            const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
            if (soundManager.context && soundManager.context.state === 'suspended') {
                soundManager.context.resume();
            }

                 this.playIntroSequence();
             });
        }
    }

    private setupLifecycleListeners() {
        // 1. Xử lý khi reload/tắt tab
        window.addEventListener('beforeunload', this.handleUnload);

        // 2. Xử lý khi mất mạng
        window.addEventListener('offline', this.handleOffline);
        
        // Cleanup khi scene shutdown
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
             window.removeEventListener('beforeunload', this.handleUnload);
             window.removeEventListener('offline', this.handleOffline);
        });
    }

    private handleUnload = async (e: BeforeUnloadEvent) => {
        // Cố gắng gửi request End Session (Best effort)
        // Lưu ý: Browser có thể kill request nếu không dùng keepalive (cần update SDK nếu cần)
        // Ở đây ta gọi hàm helper, hy vọng kịp gửi đi.
        if (this.isSessionActive) {
             await this.finishGameSession(true); 
        } 
    }

    private handleOffline = () => {
        console.log("Mất kết nối mạng!");
        this.textHint.setColor('#ff0000');
        this.btnMic.disableInteractive().setTint(0x555555);
        
        // Chỉ end session nếu đang active
        if (!this.isSessionActive) return;

        // Có thể gọi finish luôn hoặc đợi user reconnect (tuỳ logic)
        // Ở đây ta chọn kết thúc an toàn để bảo toàn điểm
        this.finishGameSession();
        this.isSessionActive = false;
    }
    
    private async runGameFlow() {
        // --- Bước 1: Kiểm tra quyền Mic trước ---
        const hasMicPermission = await this.voiceRecorder.checkPermission();
        if (!hasMicPermission) {
            console.log("Cần quyền truy cập Micro để chơi!");
            this.textHint.setColor('#ff0000');
            return;
        }

        // --- Bước 2: Bắt đầu phiên (Start Session) ---
        
        try {
            let sessionRes;
            if (this.testMode) {
                 console.log("--- TEST MODE ACTIVE: MOCK SESSION START ---");
                 sessionRes = {
                     allowPlay: true,
                     quotaRemaining: 999,
                     index: 0
                 };
            } else {
                 sessionRes = await this.voiceHelper.startEvaluation();
            }

            // Kiểm tra kết quả
            if (!sessionRes.allowPlay) {
                console.log(sessionRes.message || "Không thể bắt đầu game (Hết lượt/Banned)");
                this.btnMic.disableInteractive().setTint(0x555555);
                return;
            }

            // Success
            this.currentQuota = sessionRes.quotaRemaining;
            this.currentQuestionIndex = sessionRes.index; // 0 nếu mới, >0 nếu resume
            
            // --- UPDATE STATE ---
            this.isSessionActive = true;
            this.btnMic.setVisible(true);

            console.log(`Sẵn sàng! Lượt: ${this.currentQuota}`);

            // Nếu resume
            if (sessionRes.index > 0) {
                console.log(`Resuming game at index ${sessionRes.index}`);
            }

        } catch (err: any) {
            console.error("Start Session Error:", err);
            console.log("Lỗi kết nối máy chủ");
            this.btnMic.setVisible(false);
            this.btnMic.disableInteractive().setTint(0x555555);
        }
    }

    private setupBackgroundAndAudio() {
        // 1. Đổi Background dùng Manager
        changeBackground('assets/images/bg/background.jpg');

        // 2. Phát nhạc nền (BGM)
        // Dừng BGM cũ nếu có
        try {
             if (this.sound.get(AudioKeys.BgmNen)) {
                this.sound.stopByKey(AudioKeys.BgmNen);
            }
            // Init và phát BGM mới
            this.bgm = this.sound.add(AudioKeys.BgmNen, {
                loop: true,
                volume: 0.25,
            });
            this.bgm.play();
        } catch (e) {
            console.warn("Audio Context issue:", e);
        }



        // 3. Phát Voice Hướng dẫn (Intro) sẽ được xử lý ở create()
    }

    private createUI() {
        const UI = GameConstants.SCENE1.UI;
        const cx = GameUtils.pctX(this, 0.5);
        const scl = [1, 0.72]; // Scale từ user snippet

        // 1. Logic BANNER & BOARD từ User Snippet
        
        // Lấy kích thước Banner
        const bannerTexture = this.textures.get(TextureKeys.S1_Banner);
        let bannerHeight = 100; // Fallback mặc định
        if (bannerTexture && bannerTexture.key !== '__MISSING') {
            bannerHeight = bannerTexture.getSourceImage().height * 0.7;
        }

        const boardY = bannerHeight + GameUtils.pctY(this, UI.BOARD_OFFSET);
        
        // Tâm bảng (Board Center)
        const board = this.add
            .image(cx, boardY, TextureKeys.S1_Board)
            .setOrigin(0.5, 0)
            .setScale(scl[0], scl[1])
            .setDepth(0);

        board.displayWidth = GameUtils.getW(this) * 0.95;
            
        // 2. Text gợi ý
        // this.textHint = this.add.text(cx, boardY + 50, "Nhấn nút để đếm", {
        //     fontSize: '40px',
        //     color: '#000000',
        //     fontFamily: 'Arial'
        // }).setOrigin(0.5);

        // 3. Nút Mic
        this.btnMic = this.add.image(cx, GameUtils.pctY(this, 0.85), TextureKeys.Mic) 
             .setScale(1)
             .setInteractive()
             .setVisible(false); // Mặc định ẩn, chỉ hiện khi Session Start thành công

        // 4. Nút nghe lại (Ẩn ban đầu)
        this.btnPlayback = this.add.image(cx + 100, GameUtils.pctY(this, 0.85), TextureKeys.Mic) // Dùng icon Mic làm placeholder
             .setScale(0.7)
             .setInteractive()
             .setVisible(false) // Ẩn cho đến khi ghi âm xong
             .setTint(0x0000ff);

        // 5. Số 1
        this.add.image(GameUtils.pctX(this, 0.07), boardY + 100, TextureKeys.Number)
             .setOrigin(0.5)
             .setScale(1);

        // 6. Xúc xắc
        this.add.image(GameUtils.pctX(this, 0.15), boardY + 100, TextureKeys.Dice)
             .setOrigin(0.5)
             .setScale(1);
    }

    private loadLevel(configKey: string) {
        // Unlock processing for new level
        this.isProcessing = false;

        // Cleanup old objects
        this.objectsToCount.forEach(obj => obj.destroy());
        this.objectsToCount = [];

        // Load Config
        const data = this.cache.json.get(configKey);
        if (!data || !data.images) return;

        // Tạo objects
        data.images.forEach((def: any) => {
             // Xử lý texture key. Fallback về S1_Ball nếu thiếu
             let key = def.textureKey;

             const x = GameUtils.pctX(this, def.baseX_pct);
             const y = GameUtils.pctY(this, def.baseY_pct);
             
             const img = this.add.image(x, y, key).setScale(def.baseScale || 0.5);
             this.objectsToCount.push(img);
        });

        // Load Target Text Config
        this.levelTarget = data.targetText;
        
    }

    // --- LOGIC MICROPHONE & VOICE RECORDER ---

    private setupVoiceRecorder() {
        this.voiceRecorder = new VoiceRecorder({
            onRecordingStart: () => {
                // Mute Audio Context hoặc Pause BGM
                if (this.bgm && this.bgm.isPlaying) {
                    this.bgm.pause();
                }
                AudioManager.stopAll();

                // UI Update
                this.btnMic.setTint(0x00ff00); // Xanh lá
                console.log("Đang nghe... (Nói số lượng)");
            },
            onRecordingStop: (audioBlob, duration) => {
                // Ignore short noise
                if (duration < 500) {
                    console.log("Audio too short (Noise), ignored.");
                    return;
                }

                // Resume BGM
                if (this.bgm && this.bgm.isPaused) {
                    this.bgm.resume();
                }

                // UI Update
                this.btnMic.setTint(0xff0000); // Đỏ lại
                console.log("Đã ghi xong.");
                this.btnPlayback.setVisible(true);

                // Auto Submit Logic
                // Use targetText from JSON config (Counting format: {start: x, end: y})
                const targetText = this.levelTarget || { start: 1, end: 1 };
                this.sendAudioToBackend(audioBlob, targetText);
            },
            onVolumeChange: (vol) => {
                 // Scale Mic button based on volume
                 const scale = 0.5 + (vol * 0.2);
                 this.btnMic.setScale(Math.min(scale, 0.7)); 
            },
            onSilenceDetected: () => {
                console.log("Auto-submit: Silence detected");
                // VoiceRecorder will auto call stop(), which triggers onRecordingStop
            },
            onError: (err) => {
                console.error("Mic Error:", err);
                console.log("Không thể truy cập Mic");
            }
        });
        
        // Re-implement button logic with local flag ref
        this.btnMic.on('pointerdown', () => {
             this.resetIdle(); // Reset idle timer
             if (this.btnMic.tintTopLeft === 0x00ff00) { // Check Green tint
                 this.voiceRecorder.stop();
             } else {
                 this.voiceRecorder.start();
             }
        });
    }

    // --- API LOGIC (Updated to use Hook) ---
    
    private async sendAudioToBackend(audioBlob: Blob, inputTarget: string | object) {
        // --- BLOCKING LOGIC ---
        if (this.isProcessing) {
             console.log("Ignoring request: Previous request processing or transition...");
             return;
        }

        if (!this.voiceHelper.sessionId) {
             console.error("No active session");
             console.log("Lỗi phiên làm việc! (Vui lòng reload)");
             return;
        }
        
        this.isProcessing = true; // LOCK

        // Log Session ID cho mỗi lần submit
        console.log(`[Submit Audio] SessionID: ${this.voiceHelper.sessionId} | Question Index: ${this.currentQuestionIndex + 1}`);

        console.log("Đang chấm điểm...");
        this.btnPlayback.setVisible(false); // Ẩn nút nghe lại khi submit

        try {
            // Tính duration (Optional or removed if not needed)
            const durationMs = 0; // VoiceRecorder provides duration in callback if needed

            // Xử lý Input Target: Tự động gói vào Object nếu là String
            let finalTargetText;
            if (typeof inputTarget === 'string') {
                finalTargetText = { text: inputTarget };
            } else {
                finalTargetText = inputTarget; // Dùng luôn Object cấu hình
            }

            // Gọi Hook
            const result = await this.voiceHelper.submitAudio(
                audioBlob,
                finalTargetText,
                this.currentQuestionIndex + 1,
                durationMs
            );
            
            this.processResult(result);
            this.submissionCount++; // Valid submission

            // Logic chuyển tiếp
            this.currentQuestionIndex++;
            
            // Show Popup
            const uiScene = this.scene.get(SceneKeys.UI) as any; 
            if (uiScene && uiScene.showScorePopup) {
                uiScene.showScorePopup(result.score, result.feedback);
            }

            // Switch Level Logic (Auto after delay)
            if (this.currentQuestionIndex < this.totalQuestions) {
                 setTimeout(() => {
                     // Hide popup
                     if (uiScene && uiScene.hideScorePopup) {
                         uiScene.hideScorePopup();
                     }

                     // Demo logic: Chuyển màn 2, 3
                     if (this.currentQuestionIndex === 1) {
                        this.loadLevel(DataKeys.LevelS2Config);
                        console.log("Màn 2: Hãy đếm số lượng!");
                     } else if (this.currentQuestionIndex === 2) {
                        this.loadLevel(DataKeys.LevelS3Config);
                        console.log("Màn 3: Hãy đếm số lượng!");
                     }
                 }, 3000); // 3s delay for user to read feedback
            } else {
                 // Đã hết câu hỏi -> Kết thúc game (BẮT BUỘC ĐỂ XÓA CACHE)
                 setTimeout(() => {
                     if (uiScene && uiScene.hideScorePopup) {
                         uiScene.hideScorePopup();
                     }
                     this.finishGameSession();
                 }, 3000);
            }

        } catch (e: any) {
            console.error("Evaluation Error:", e);
            this.isProcessing = false; // UNLOCK on Error so user can retry

            // Xử lý lỗi mạng
            if (e.message && (e.message.includes('Network') || e.message.includes('offline'))) {
                this.handleOffline();
            } else {
                console.log("Lỗi chấm điểm!");
            }
        }
    }

    private async finishGameSession(isUnload: boolean = false) {
        // --- GUARD: Require at least 1 valid submission ---
        if (this.submissionCount < 1) {
             console.log("No submissions yet, skipping EndSession (Cleaner data)");
             return;
        }

        console.log("Ending Session (Cleanup)...");
        
        if (!isUnload) {
            console.log("Đang tổng kết điểm...");
        }
        
        try {
            // REQUIRED: Gọi EndSession để nhận điểm cuối cùng (thang 10) và XÓA CACHE
            // isUnload = true means we handle it as "UserAborted" conceptually or just silent cleanup
            const endRes = await this.voiceHelper.finishEvaluation(
                this.totalQuestions,
                isUnload // Truyền cờ isUserAborted nếu thoát ngang
            );

            if (!endRes) return;
            
            // Nếu là unload (đóng tab) thì ko cần update UI
            if (isUnload) return;

            console.log("Session Ended Result:", endRes);
            
            let msg = `TỔNG KẾT: ${endRes.finalScore}/10 điểm`;
            if (endRes.quotaDeducted) msg += "\n(Đã trừ lượt)";
            
            console.log(msg);
            this.textHint.setColor('#0000ff'); // Blue Text
            
            // Show Final Score Popup
            const uiScene = this.scene.get(SceneKeys.UI) as any;
            if (uiScene && uiScene.showFinalScorePopup) {
                uiScene.showFinalScorePopup(endRes.finalScore);
            }
            
            this.btnMic.disableInteractive().setTint(0x555555);

            // Chuyển sang EndGameScene sau khi xem điểm (ví dụ 4s)
            this.time.delayedCall(4000, () => {
                 this.scene.stop(SceneKeys.UI);
                 this.scene.start('EndGameScene');
            });

        } catch (e) {
            console.error("End Session Error", e);
            if (!isUnload) console.log("Lỗi tổng kết!");
        }
    }

    private processResult(result: any) {
        // Logic xử lý kết quả trả về
        console.log("API Result:", result);
        
        // Popup call moved to sendAudioToBackend to capture 'this' context better with callbacks
        // or we can remove this block if it's redundant. 
        // Logic was moved up. We just keep SFX here.

        // SFX
        if (result.score >= 60) { 
            AudioManager.play("sfx-correct"); 
        } else {
             AudioManager.play("sfx-wrong");
        }
    }


    // --- IDLE LOGIC ---

    private setupIdleManager() {
        this.idleManager = new IdleManager(10000, () => {
             this.handleIdle();
        });

        // Tạo tay hướng dẫn (ẩn ban đầu)
        // Dùng TextureKeys.HandHint đã check trong Preload
        this.handCursor = this.add.image(0, 0, TextureKeys.HandHint)
             .setVisible(false)
             .setDepth(100);
    }

    private handleIdle() {
        if (!this.btnMic) return;
        
        console.log("User Idle -> Show Hint");

        // 1. Play Audio Hint
        AudioManager.play('hint');

        // 2. Show Hand pointing to Mic
        const targetX = this.btnMic.x;
        const targetY = this.btnMic.y;

        this.handCursor.setPosition(targetX + 50, targetY + 50); // Xuất hiện bên cạnh
        this.handCursor.setVisible(true);

        // Tween chỉ tay
        if (this.handTween) this.handTween.stop();
        
        this.handTween = this.tweens.add({
            targets: this.handCursor,
            x: targetX,
            y: targetY,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private resetIdle() {
        if (this.idleManager) {
            this.idleManager.reset();
        }
        this.hideIdleHint();
    }

    private hideIdleHint() {
        if (this.handCursor) {
            this.handCursor.setVisible(false);
        }
        if (this.handTween) {
            this.handTween.stop();
        }
        AudioManager.stopSound('hint'); 
    }

    update(time: number, delta: number) {
        if (this.idleManager) {
            this.idleManager.update(delta);
        }
    }

    private playIntroSequence() {
        this.isIntroActive = true;
        // Start Idle Manager khi intro bắt đầu hoặc sau intro?
        // Thường là sau khi intro nói xong, hoặc bắt đầu từ đây nhưng user chưa interact thì chưa tính.
        // User phải interact lần đầu (intro) rồi mới tính idle.
        // Nhưng logic Tap-to-start đã handle việc user interact.
        
        if (this.idleManager) this.idleManager.start();

        playVoiceLocked(null, 'voice_intro_s2');
        // Đợi 1 chút rồi chạy animation tay hướng dẫn
        this.time.delayedCall(GameConstants.SCENE1.TIMING.INTRO_DELAY, () => {
            if (this.isIntroActive) this.runHandTutorial();
        });
    }

    private runHandTutorial(){}
}
