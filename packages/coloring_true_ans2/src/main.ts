import Phaser from 'phaser';
import Scene1 from './scenes/Scene1';
import PreloadScene from './scenes/PreloadScene';
import UIScene from './scenes/UIScene';

import EndGameScene from './scenes/EndgameScene';
import { initRotateOrientation } from './utils/rotateOrientation';
import AudioManager from './audio/AudioManager';
import { game } from "@iruka-edu/mini-game-sdk";

    declare global {
        interface Window {
            gameScene: any;
            irukaHost: any; // Khai báo thêm để TS không báo lỗi
            irukaGameState: any;
        }
    }

    // --- 0. HELPER FUNCTIONS ---
    function applyResize(width: number, height: number) {
        const gameDiv = document.getElementById('game-container');
        if (gameDiv) {
            gameDiv.style.width = `${width}px`;
            gameDiv.style.height = `${height}px`;
        }
        if (gamePhaser) {
             gamePhaser.scale.resize(width, height);
        }
    }

    function broadcastSetState(payload: any) {
        // chuyển xuống scene đang chạy
        if (!gamePhaser) return;
        const scene = gamePhaser.scene.getScenes(true)[0] as any;
        scene?.applyHubState?.(payload);
    }

    function getHubOrigin(): string {
      const qs = new URLSearchParams(window.location.search);
      const o = qs.get("hubOrigin");
      if (o) return o;
      try {
        const ref = document.referrer;
        if (ref) return new URL(ref).origin;
      } catch {}
      return "*"; 
    }

    // --- 1. BIẾN GLOBAL CHO GAME PHASER ---
    // Khai báo trước để SDK callback có thể tham chiếu (dù lúc đầu là undefined)
    let gamePhaser: Phaser.Game;

    // --- 2. KHỞI TẠO SDK TRƯỚC (Để hook E2E có ngay lập tức) ---
    import { installIrukaE2E } from './e2e/installIrukaE2E';

    export const sdk = game.createGameSdk({
      hubOrigin: getHubOrigin(),

      onInit(ctx: any) {
        // Có thể gamePhaser chưa ready ở đây nếu init quá nhanh, nhưng thường thì ok
        // Reset stats session nếu cần
        
        sdk.ready({
          capabilities: ["resize", "score", "complete", "save_load", "set_state", "stats", "hint"],
        });
      },

      onStart() {
        if(gamePhaser) {
            gamePhaser.scene.resume("Scene1");
            gamePhaser.scene.resume("EndGameScene");
        }
      },

      onPause() {
        if(gamePhaser) gamePhaser.scene.pause("Scene1");
      },

      onResume() {
        if(gamePhaser) gamePhaser.scene.resume("Scene1");
      },

      onResize(size: any) {
        applyResize(size.width, size.height);
      },

      onSetState(state: any) {
        broadcastSetState(state);
      },

      onQuit() {
        game.finalizeAttempt("quit");
        sdk.complete({
          timeMs: Date.now() - ((window as any).irukaGameState?.startTime ?? Date.now()),
          extras: { reason: "hub_quit", stats: game.prepareSubmitData() },
        });
      },
    });

    // Cài đặt Hook ngay lập tức!
    installIrukaE2E(sdk);

    // --- 3. CẤU HÌNH & KHỞI TẠO GAME PHASER ---
    // --- CẤU HÌNH GAME (Theo cấu trúc mẫu: FIT) ---
    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 1920,
        height: 1080,
        parent: 'game-container',
        scene: [PreloadScene, Scene1, EndGameScene, UIScene],
        backgroundColor: '#ffffff',
        scale: {
            mode: Phaser.Scale.FIT,       // Dùng FIT để co giãn giữ tỉ lệ
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
            default: 'arcade',
            arcade: { debug: false }
        },
        render: {
            transparent: true,
        },
    };

    // Khởi tạo Game sau khi SDK đã sẵn sàng hook
    gamePhaser = new Phaser.Game(config);

    // --- 4. CẤU HÌNH UI & XOAY MÀN HÌNH (SETUP SAU KHI GAME ĐÃ KHỞI TẠO) ---
    // Tuy nhiên, vì gamePhaser mới được new, scene chưa chạy ngay lập tức.
    // Các logic DOM listener có thể giữ ở đây hoặc chuyển vào Scene Boot/Preload.
    // Để giữ tương thích code cũ, ta giữ lại các helper UI.

    export function showGameButtons() {
        const reset = document.getElementById('btn-reset');
        if (reset) reset.style.display = 'block';
    }

    export function hideGameButtons() {
        const reset = document.getElementById('btn-reset');
        if (reset) reset.style.display = 'none';
    }

    function updateUIButtonScale() {
        const resetBtn = document.getElementById('btn-reset') as HTMLImageElement;
        if (!resetBtn) return;
        const h = window.innerHeight;
        const newSize = h / 9;
        resetBtn.style.width = `${newSize}px`;
        resetBtn.style.height = `${newSize}px`;
    }

    function attachResetHandler() {
        const resetBtn = document.getElementById('btn-reset') as HTMLImageElement;
        if (resetBtn) {
            resetBtn.onclick = () => {
                console.log('Restart button clicked.');
                game.retryFromStart(); 
                gamePhaser.sound.stopByKey('bgm-nen');
                AudioManager.stopAll();
                try {
                    AudioManager.play('sfx-click'); 
                } catch (e) { console.error(e); }

                if (window.gameScene && window.gameScene.scene) {
                    window.gameScene.scene.stop();
                    // Nếu đang ở Scene nào thì nên restart Scene đó hoặc về Scene1
                    // Ở đây mặc định về Scene1 theo logic cũ
                    window.gameScene.scene.start('Scene1', { isRestart: true }); 
                }
                hideGameButtons();
            };
        }
    }

    // Init Logic
    initRotateOrientation(gamePhaser);
    attachResetHandler();
    updateUIButtonScale();
    window.addEventListener('resize', updateUIButtonScale);
    window.addEventListener('orientationchange', updateUIButtonScale);

    document.getElementById('btn-reset')?.addEventListener('sfx-click', () => {
        window.gameScene?.scene.restart();
    });