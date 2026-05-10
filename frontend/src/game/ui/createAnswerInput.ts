import Phaser from 'phaser';

type AnswerInputOptions = {
  placeholder?: string;
  buttonLabel?: string;
  panelWidth?: number;
  inputWidth?: number;
  inputFontSize?: number;
  inputPadding?: string;
  buttonFontSize?: number;
  compact?: boolean;
  onSubmit: (answer: string) => void;
};

export const createAnswerInput = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  options: AnswerInputOptions,
): Phaser.GameObjects.DOMElement => {
  const panelWidth = options.panelWidth || 420;
  const inputWidth = options.inputWidth || 360;
  const inputFontSize = options.inputFontSize || 22;
  const inputPadding = options.inputPadding || '14px 16px';
  const buttonFontSize = options.buttonFontSize || 15;
  const buttonMargin = options.compact ? 9 : 14;
  const buttonPadding = options.compact ? '8px 18px' : '11px 22px';

  const html = `
    <div style="box-sizing:border-box; text-align:center; width:${panelWidth}px; padding:${options.compact ? '12px 16px' : '0'}; background:transparent; border:0;">
      <input type="text" name="answer" placeholder="${options.placeholder || '정답을 입력하세요'}"
        style="box-sizing:border-box; width:${inputWidth}px; font-size:${inputFontSize}px; padding:${inputPadding}; border-bottom:1px solid rgba(255,255,255,0.4); border-top:0; border-left:0; border-right:0; background:transparent; color:#fff; text-align:center; outline:none; font-family:serif;" />
      <br />
      <button type="button" name="submit"
        style="margin-top:${buttonMargin}px; font-size:${buttonFontSize}px; padding:${buttonPadding}; cursor:pointer; background:transparent; color:#ccc; border:1px solid rgba(255,255,255,0.3); border-radius:4px; letter-spacing:1px; font-family:serif;">
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
