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
  const panelWidth = options.panelWidth || 420;
  const inputWidth = options.inputWidth || 360;
  const inputFontSize = options.inputFontSize || 22;
  const inputPadding = options.inputPadding || '14px 16px';
  const buttonFontSize = options.buttonFontSize || 15;
  const buttonMargin = options.compact ? 9 : 14;
  const buttonPadding = options.compact ? '8px 18px' : '11px 22px';

  const html = `
    <div style="box-sizing:border-box; text-align:center; width:${panelWidth}px; padding:${options.compact ? '12px 16px' : '0'}; background:${options.compact ? 'rgba(0,0,0,0.46)' : 'transparent'}; border:${options.compact ? '1px solid rgba(255,188,106,0.18)' : '0'}; border-radius:${options.compact ? '18px' : '0'};">
      <input type="text" name="answer" placeholder="${options.placeholder || '정답을 입력하세요'}"
        style="box-sizing:border-box; width:${inputWidth}px; font-size:${inputFontSize}px; padding:${inputPadding}; border:1px solid ${options.compact ? 'rgba(255,201,139,0.34)' : '#555'}; background:rgba(0,0,0,0.72); color:#fff; text-align:center; outline:none; font-family:serif;" />
      <br />
      <button type="button" name="submit"
        style="margin-top:${buttonMargin}px; font-size:${buttonFontSize}px; padding:${buttonPadding}; cursor:pointer; background:#111; color:#eee; border:1px solid #777; letter-spacing:1px;">
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
