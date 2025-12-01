import BaseScene from './BaseScene';

export default class EndGameScene extends BaseScene {
  private score = 0;
  private total = 0;

  constructor() {
    super('EndGameScene');
  }

  init(data: { score: number; total: number }) {
    this.score = data.score;
    this.total = data.total;
  }

  create() {
    const { width, height } = this.scale;

    this.createFullScreenBg('bg_end');

    this.add
      .text(width / 2, height / 2 - 60, 'Hoàn thành!', {
        fontSize: '36px',
        color: '#333',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2, `Điểm: ${this.score}/${this.total}`, {
        fontSize: '28px',
        color: '#555',
      })
      .setOrigin(0.5);

    this.createButton(width / 2, height / 2 + 80, 'Chơi lại', () => {
      this.scene.start('OverlayScene');
    });
  }
}
