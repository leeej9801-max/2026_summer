import Phaser from 'phaser';

type AnswerInputOptions = {
  placeholder?: string;
  buttonLabel?: string;
  width?: number;
  inputWidth?: number;
  fontSize?: number;
  buttonFontSize?: number;
  inputPadding?: string;
  buttonPadding?: string;
  buttonMarginTop?: number;
  onSubmit: (answer: string) => void;
};

export const createAnswerInput = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  options: AnswerInputOptions,
): Phaser.GameObjects.DOMElement => {
  const width = options.width ?? 420;
  const inputWidth = options.inputWidth ?? 360;
  const fontSize = options.fontSize ?? 22;
  const buttonFontSize = options.buttonFontSize ?? 15;
  const inputPadding = options.inputPadding ?? '14px 16px';
  const buttonPadding = options.buttonPadding ?? '11px 22px';
  const buttonMarginTop = options.buttonMarginTop ?? 14;

  const html = `
    <div style="text-align:center; width: ${width}px;">
      <input type="text" name="answer" placeholder="${options.placeholder || '정답을 입력하세요'}"
        style="box-sizing:border-box; width:${inputWidth}px; font-size:${fontSize}px; padding:${inputPadding}; border:1px solid #555; background:rgba(0,0,0,0.72); color:#fff; text-align:center; outline:none; font-family:serif;" />
      <br />
      <button type="button" name="submit"
        style="margin-top:${buttonMarginTop}px; font-size:${buttonFontSize}px; padding:${buttonPadding}; cursor:pointer; background:#111; color:#eee; border:1px solid #777; letter-spacing:1px;">
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
