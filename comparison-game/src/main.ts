import Phaser from "phaser";
import PreloadScene from "./PreloadScene";
import OverlayScene from "./OverlayScene";
import GameScene from "./GameScene";
import BalanceScene from "./BalanceScene";
import EndGameScene from "./EndGameScene";

// ================== TẠO CONTAINER GAME ==================
const containerId = "game-container";
let container = document.getElementById(containerId);
if (!container) {
  container = document.createElement("div");
  container.id = containerId;
  document.body.appendChild(container);
}

// ================== CSS CHO HTML & BODY ==================
const root = document.documentElement;
root.style.margin = "0";
root.style.padding = "0";
root.style.width = "100%";
root.style.height = "100%";
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.width = "100%";
document.body.style.height = "100%";

// ========== RANDOM BACKGROUND VIEWPORT ==========
const INTRO_VIEWPORT_BGS = [
  "assets/bg/bg1.webp",
  "assets/bg/bg2.webp",
  "assets/bg/bg3.webp",
  "assets/bg/bg4.webp",
  "assets/bg/bg5.webp",
  "assets/bg/bg6.webp",
  "assets/bg/bg7.webp",
];
const GAME_VIEWPORT_BGS = [
  "assets/bg/bg1.webp",
  "assets/bg/bg2.webp",
  "assets/bg/bg3.webp",
  "assets/bg/bg4.webp",
  "assets/bg/bg5.webp",
  "assets/bg/bg6.webp",
  "assets/bg/bg7.webp",
];
const END_VIEWPORT_BGS = [
  "assets/bg/bg1.webp",
  "assets/bg/bg2.webp",
  "assets/bg/bg3.webp",
  "assets/bg/bg4.webp",
  "assets/bg/bg5.webp",
  "assets/bg/bg6.webp",
  "assets/bg/bg7.webp",
];
function setViewportBg(url: string, position: string = "center center") {
  document.body.style.backgroundImage = `url("${url}")`;
  document.body.style.backgroundRepeat = "no-repeat";
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = position;
  document.body.style.boxSizing = "border-box";
}
export function setRandomIntroViewportBg() {
  const url =
    INTRO_VIEWPORT_BGS[Math.floor(Math.random() * INTRO_VIEWPORT_BGS.length)];
  const isLandscape = window.innerWidth > window.innerHeight;
  if (isLandscape) {
    setViewportBg(url, "center top");
  } else {
    setViewportBg(url, "center center");
  }
}
export function setRandomGameViewportBg() {
  const url =
    GAME_VIEWPORT_BGS[Math.floor(Math.random() * GAME_VIEWPORT_BGS.length)];
  setViewportBg(url, "center center");
}
export function setRandomEndViewportBg() {
  const url =
    END_VIEWPORT_BGS[Math.floor(Math.random() * END_VIEWPORT_BGS.length)];
  setViewportBg(url, "center center");
}

// ========== HIỆN / ẨN NÚT VIEWPORT ==========
function setGameButtonsVisible(visible: boolean) {
  const replayBtn = document.getElementById("btn-replay") as
    | HTMLButtonElement
    | null;
  const nextBtn = document.getElementById("btn-next") as
    | HTMLButtonElement
    | null;
  const display = visible ? "block" : "none";
  if (replayBtn) replayBtn.style.display = display;
  if (nextBtn) nextBtn.style.display = display;
}
(Object.assign(window as any, {
  setRandomIntroViewportBg,
  setRandomGameViewportBg,
  setRandomEndViewportBg,
  setGameButtonsVisible,
}));

// ================== CSS CHO CONTAINER (TRONG SUỐT) ==================
if (container instanceof HTMLDivElement) {
  container.style.position = "fixed";
  container.style.inset = "0";
  container.style.margin = "0";
  container.style.padding = "0";
  container.style.display = "flex";
  container.style.justifyContent = "center";
  container.style.alignItems = "center";
  container.style.overflow = "hidden";
  container.style.boxSizing = "border-box";
  container.style.background = "transparent";
}

let game: Phaser.Game | null = null;
let rotateOverlay: HTMLDivElement | null = null;
function ensureRotateOverlay() {
  if (rotateOverlay) return;
  rotateOverlay = document.createElement("div");
  rotateOverlay.id = "rotate-overlay";
  rotateOverlay.style.position = "fixed";
  rotateOverlay.style.inset = "0";
  rotateOverlay.style.zIndex = "9999";
  rotateOverlay.style.display = "none";
  rotateOverlay.style.alignItems = "center";
  rotateOverlay.style.justifyContent = "center";
  rotateOverlay.style.textAlign = "center";
  rotateOverlay.style.background = "rgba(0, 0, 0, 0.6)";
  rotateOverlay.style.padding = "16px";
  rotateOverlay.style.boxSizing = "border-box";
  const box = document.createElement("div");
  box.style.background = "white";
  box.style.borderRadius = "16px";
  box.style.padding = "16px 20px";
  box.style.maxWidth = "320px";
  box.style.margin = "0 auto";
  box.style.fontFamily = '"Fredoka", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  box.style.boxShadow = "0 8px 24px rgba(0,0,0,0.25)";
  const title = document.createElement("div");
  title.textContent = "Bé Hãy Xoay Ngang Màn Hình Để Chơi Nhé 🌈";
  title.style.fontSize = "18px";
  title.style.fontWeight = "700";
  title.style.marginBottom = "8px";
  title.style.color = "#222";
  box.appendChild(title);
  rotateOverlay.appendChild(box);
  document.body.appendChild(rotateOverlay);
}
function updateRotateHint() {
  ensureRotateOverlay();
  if (!rotateOverlay) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const shouldShow = h > w && w < 768;
  rotateOverlay.style.display = shouldShow ? "flex" : "none";
}
function setupRotateHint() {
  ensureRotateOverlay();
  updateRotateHint();
  window.addEventListener("resize", updateRotateHint);
  window.addEventListener("orientationchange", updateRotateHint as any);
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: containerId,
  transparent: true,

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
  scene: [PreloadScene, OverlayScene, GameScene,BalanceScene, EndGameScene],
};

function setupHtmlButtons() {
  const replayBtn = document.getElementById("btn-replay");
  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      if (!game) return;
      const scene = game.scene.getScene("GameScene") as GameScene;
      if (!scene) return;
      scene.scene.restart({ level: scene.level });
    });
  }
  const nextBtn = document.getElementById("btn-next");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (!game) return;
      const scene = game.scene.getScene("GameScene") as GameScene;
      if (!scene) return;
      if (!scene.isLevelComplete()) {
        scene.sound.play("voice_need_finish");
        return;
      }
      const nextIndex = scene.level + 1;
      if (nextIndex >= scene.levels.length) {
        scene.scene.start("EndGameScene");
      } else {
        scene.scene.restart({ level: nextIndex });
      }
    });
  }
  setGameButtonsVisible(false);
}

function waitForFredoka(): Promise<void> {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();
  return new Promise<void>((resolve) => {
    let done = false;
    document.fonts.load('400 20px "Fredoka"').then(() => {
      if (!done) {
        done = true;
        resolve();
      }
    });
    setTimeout(() => {
      if (!done) {
        done = true;
        resolve();
      }
    }, 10);
  });
}

function setupPhaserResize(currentGame: Phaser.Game) {
  const refresh = () => {
    setTimeout(() => {
      currentGame.scale.refresh();
    }, 50);
  };
  window.addEventListener("resize", refresh);
  window.addEventListener("orientationchange", refresh as any);
  refresh();
}

async function initGame() {
  try {
    await waitForFredoka();
  } catch (e) {
    console.warn("Không load kịp font Fredoka, chạy game luôn.");
  }
  if (!game) {
    setRandomIntroViewportBg();
    game = new Phaser.Game(config);
    setupHtmlButtons();
    setupPhaserResize(game);
    setupRotateHint(); 
  }
  setTimeout(() => {
    const canvas =
      document.querySelector<HTMLCanvasElement>("#game-container canvas");
    if (canvas) {
      canvas.style.margin = "0";
      canvas.style.padding = "0";
      canvas.style.display = "block";
      canvas.style.imageRendering = "auto";
      canvas.style.backgroundColor = "transparent";
    }
  }, 50);
}

document.addEventListener("DOMContentLoaded", initGame);
