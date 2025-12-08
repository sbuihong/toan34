import Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import { EndScene } from './scenes/EndScene';
import { initRotateOrientation } from './rotateOrientation';

declare global {
    interface Window {
        gameScene: any;
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    scene: [GameScene, EndScene],
    backgroundColor: '#ffffff',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
        pixelArt: false,
        antialias: true,
        transparent: true,
    },
};

const game = new Phaser.Game(config);

function updateUIButtonScale() {
    const container = document.getElementById('game-container')!;
    const resetBtn = document.getElementById('btn-reset') as HTMLImageElement;

    const w = container.clientWidth;
    const h = container.clientHeight;

    const scale = Math.min(w, h) / 720;
    const baseSize = 80;
    const newSize = baseSize * scale;

    resetBtn.style.width = `${newSize}px`;
    resetBtn.style.height = 'auto';
}

export function showGameButtons() {
    const reset = document.getElementById('btn-reset');
    if (reset) reset.style.display = 'block';
}

export function hideGameButtons() {
    const reset = document.getElementById('btn-reset');
    if (reset) reset.style.display = 'none';
}

// Khởi tạo xoay màn hình
initRotateOrientation(game, {
    mainSceneKey: 'GameScene',
    overlaySceneKey: null,
});

// Scale nút
updateUIButtonScale();
window.addEventListener('resize', updateUIButtonScale);
window.addEventListener('orientationchange', updateUIButtonScale);

document.getElementById('btn-reset')?.addEventListener('click', () => {
    window.gameScene?.restartLevel();
});
