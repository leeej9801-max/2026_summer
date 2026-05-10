import Phaser from 'phaser';

export const createSmallInteractionPrompt = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  promptText: string,
  onSubmit: (answer: string) => void
) => {
  const container = scene.add.container(x, y);

  const html = `
    <div style="box-sizing:border-box; text-align:center; padding:10px; background:transparent;">
      <div style="color:#e0e0e0; font-family:serif; font-size:15px; margin-bottom:12px; letter-spacing:1px; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">${promptText}</div>
      <input type="text" name="answer" placeholder="단어 입력" autocomplete="off"
        style="width:140px; font-size:18px; padding:6px 8px; border-bottom:1px solid rgba(255,255,255,0.6); border-top:0; border-left:0; border-right:0; background:transparent; color:#fff; text-align:center; outline:none; font-family:serif; text-shadow: 0 1px 3px rgba(0,0,0,0.8);" />
    </div>
  `;

  const element = scene.add.dom(0, 0).createFromHTML(html);
  
  element.addListener('keydown');
  element.on('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      const input = element.getChildByName('answer') as HTMLInputElement;
      onSubmit(input.value.trim());
    }
  });

  container.add(element);
  return { container, element };
};
