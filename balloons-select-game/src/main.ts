import Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import { EndScene } from './scenes/EndScene';

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

// --- Xử lý xoay ngang trên mobile ---
function resizeGame() {
    const gameDiv = document.getElementById('game-container')!;
    const rotateMsg = document.getElementById('rotate-msg')!;

    const w = window.innerWidth;
    const h = window.innerHeight;

    if (h > w) {
        // Điện thoại dọc → hiển thị overlay
        rotateMsg.style.display = 'block';
        gameDiv.style.transform = 'rotate(90deg)';
        gameDiv.style.transformOrigin = 'center center';
        gameDiv.style.width = `${h}px`;
        gameDiv.style.height = `${w}px`;
    } else {
        // Landscape → ẩn overlay
        rotateMsg.style.display = 'none';
        gameDiv.style.transform = '';
        gameDiv.style.width = `${w}px`;
        gameDiv.style.height = `${h}px`;
    }
}

function updateUIButtonScale() {
    const container = document.getElementById('game-container')!;
    const resetBtn = document.getElementById('btn-reset') as HTMLImageElement;
    const exitBtn = document.getElementById('btn-exit') as HTMLImageElement;

    const w = container.clientWidth;
    const h = container.clientHeight;

    // base height = 720 (game design gốc)
    const scale = Math.min(w, h) / 720;

    const baseSize = 80; // kích thước nút thiết kế gốc (80px)
    const newSize = baseSize * scale;

    resetBtn.style.width = `${newSize}px`;
    resetBtn.style.height = 'auto';

    exitBtn.style.width = `${newSize}px`;
    exitBtn.style.height = 'auto';
}

export function showGameButtons() {
    const reset = document.getElementById('btn-reset');
    const exit = document.getElementById('btn-exit');

    reset!.style.display = 'block';
    exit!.style.display = 'block';
}

export function hideGameButtons() {
    const reset = document.getElementById('btn-reset');
    const exit = document.getElementById('btn-exit');

    reset!.style.display = 'none';
    exit!.style.display = 'none';
}

window.addEventListener('resize', resizeGame);
window.addEventListener('orientationchange', resizeGame);

// Gọi lần đầu
window.addEventListener('resize', () => {
    resizeGame();
    updateUIButtonScale();
});
window.addEventListener('orientationchange', () => {
    resizeGame();
    updateUIButtonScale();
});

// Gọi lần đầu
resizeGame();
updateUIButtonScale();

document.getElementById('btn-reset')?.addEventListener('click', () => {
    window.gameScene?.restartLevel();
});

document.getElementById('btn-exit')?.addEventListener('click', () => {
    window.gameScene?.exitGame();
});
