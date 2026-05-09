import { Hint } from '../types/story.types.ts';

export const hints: Hint[] = [
  { id: 'stage0-start-1', stageId: 'stage-0', order: 1, text: '팀 코드는 진행 기록을 묶기 위한 장치입니다.' },
  { id: 'stage1-faith-1', stageId: 'stage-1', order: 1, text: '낡은 문 주변의 조각난 문장을 먼저 맞춰 보세요.' },
  { id: 'stage1-faith-2', stageId: 'stage-1', order: 2, text: '흔들리는 마음과 반대되는 단어를 찾으세요.' },
  { id: 'stage2-name-1', stageId: 'stage-2', order: 1, text: '성과, 비교, 스펙은 사람의 이름이 될 수 없습니다.' },
  { id: 'stage2-name-2', stageId: 'stage-2', order: 2, text: '정답은 “이름”을 부정하는 문장입니다.' },
  { id: 'stage3-message-1', stageId: 'stage-3', order: 1, text: '소음 속에서 반복되는 짧은 문장을 찾으세요.' },
  { id: 'stage3-message-2', stageId: 'stage-3', order: 2, text: '발견한 문장을 누군가에게 전달하는 행동이 필요합니다.' },
  { id: 'stage4-route-1', stageId: 'stage-4', order: 1, text: '지금까지 얻은 방향 조각은 전체 지도가 아니라 기억의 파편입니다.' },
  { id: 'stage4-route-2', stageId: 'stage-4', order: 2, text: '겹쳐 보았을 때 떠오르는 신앙의 상징을 입력하세요.' },
  { id: 'final-confession-1', stageId: 'final', order: 1, text: '베드로의 고백을 떠올리세요.' },
];

export const getHintsByIds = (ids: string[] = []) => hints.filter((hint) => ids.includes(hint.id));
