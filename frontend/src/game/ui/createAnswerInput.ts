import Phaser from 'phaser';

type AnswerInputOptions = {
  placeholder?: string;
  buttonLabel?: string;
  onSubmit: (answer: string) => void;
};

export const createAnswerInput = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  options: AnswerInputOptions,
): Phaser.GameObjects.DOMElement => {
  const html = `
    <div style="text-align:center; width: 420px;">
      <input type="text" name="answer" placeholder="${options.placeholder || '정답을 입력하세요'}"
        style="box-sizing:border-box; width:360px; font-size:22px; padding:14px 16px; border:1px solid #555; background:rgba(0,0,0,0.72); color:#fff; text-align:center; outline:none; font-family:serif;" />
      <br />
      <button type="button" name="submit"
        style="margin-top:14px; font-size:15px; padding:11px 22px; cursor:pointer; background:#111; color:#eee; border:1px solid #777; letter-spacing:1px;">
        ${options.buttonLabel || '정답 확인'}
      </button>
    </div>
  `;

  const element = scene.add.dom(x, y).createFromHTML(html);
  element.addListener('click');
  element.on('click', (event: Event) => {
    const target = event.target as HTMLButtonElement;
    if (target.name !== 'submit') return;
    const input = element.getChildByName('answer') as HTMLInputElement;
    options.onSubmit(input?.value || '');
  });

  element.addListener('keydown');
  element.on('keydown', (event: KeyboardEvent) => {
    if (event.key !== 'Enter') return;
    const input = element.getChildByName('answer') as HTMLInputElement;
    options.onSubmit(input?.value || '');
  });

  return element;
};
