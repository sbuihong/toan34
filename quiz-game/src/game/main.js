let gameInstance = null;

export const initPhaserGame = async (parentId) => {
  // Nếu game đã tồn tại, không tạo lại
  if (gameInstance) return gameInstance;

  const Phaser = await import("phaser");

  // Import scene bất đồng bộ
  const { default: IntroScene } = await import("./scenes/IntroScene.js");
  const { default: MainMenu } = await import("./scenes/MainMenu.js");
  const { default: MapScene } = await import("./scenes/MapScene.js");
  const { default: GameScene } = await import("./scenes/GameScene.js");

  // Cấu hình giữ đúng tỉ lệ 16:9 (1280x720)
  const config = {
    type: Phaser.AUTO,
    parent: parentId,
    backgroundColor: "#000000",

    // Tỉ lệ thiết kế gốc
    width: 1280,
    height: 720,

    scene: [IntroScene, MainMenu, MapScene, GameScene],

    scale: {
      mode: Phaser.Scale.FIT, // Giữ nguyên tỉ lệ (aspect ratio)
      autoCenter: Phaser.Scale.CENTER_BOTH, // Căn giữa canvas
      width: 1280,
      height: 720,
    },

    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
    },

    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },

    dom: { createContainer: true },
  };

  // Khởi tạo game
  gameInstance = new Phaser.Game(config);
  return gameInstance;
};
