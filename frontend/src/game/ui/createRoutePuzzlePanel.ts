import Phaser from 'phaser';

export const createRoutePuzzlePanel = (
  scene: Phaser.Scene,
  x: number,
  y: number,
): Phaser.GameObjects.Container => {
  const container = scene.add.container(x, y);
  const panel = scene.add.rectangle(0, 0, 500, 190, 0x070707, 0.86).setStrokeStyle(1, 0x444444);
  const title = scene.add.text(0, -74, '경로 조각', {
    fontSize: '17px',
    color: '#d8d8d8',
    fontFamily: 'serif',
  }).setOrigin(0.5);
  const note = scene.add.text(0, 72, '※ 전체 지도는 없다. 조각의 기억만 맞춘다.', {
    fontSize: '13px',
    color: '#777777',
    fontFamily: 'sans-serif',
  }).setOrigin(0.5);

  container.add([panel, title, note]);

  const labels = ['조각 A', '조각 B', '조각 C', '조각 D'];
  labels.forEach((label, index) => {
    const px = -165 + index * 110;
    const piece = scene.add.rectangle(px, -8, 74, 74, 0x101010, 1).setStrokeStyle(2, 0x777777);
    const mark = scene.add.text(px, -8, label, { fontSize: '13px', color: '#bbbbbb', fontFamily: 'sans-serif' }).setOrigin(0.5);
    piece.setInteractive({ useHandCursor: true });
    piece.on('pointerdown', () => {
      piece.angle += 90;
      mark.angle += 90;
      piece.setStrokeStyle(2, 0x9f8cff);
    });
    container.add([piece, mark]);
  });

  return container;
};
