import { ScenarioStep } from '../types/scenario.types.ts';
import { AssetKeys } from '../config/assetKeys.ts';

export const scenarioSteps: ScenarioStep[] = [
  {
    id: "cut-01",
    title: "멀리 있는 불빛",
    backgroundKey: AssetKeys.Backgrounds.EmptyRoad,
    characterKey: null,
    objects: [
      { key: AssetKeys.Objects.DistantLight, x: 0.8, y: 0.5, scale: 1.0 }
    ],
    text: "길은 이미 놓여 있었다. 저 멀리 아주 작고 희미한 불빛이 보인다.",
    nextTrigger: "click",
  },
  {
    id: "cut-02",
    title: "길 위의 캐릭터",
    backgroundKey: AssetKeys.Backgrounds.EmptyRoad,
    characterKey: AssetKeys.Characters.Stand,
    characterX: 0.2,
    characterY: 0.7,
    characterScale: 0.8,
    objects: [
      { key: AssetKeys.Objects.DistantLight, x: 0.8, y: 0.5, scale: 0.8 }
    ],
    text: "작은 존재가 길 위에 섰다. 어디로 가야 할지 잠시 멈춰 주변을 둘러본다.",
    nextTrigger: "click",
  },
  {
    id: "cut-03",
    title: "걷기 시작",
    backgroundKey: AssetKeys.Backgrounds.LongRoad,
    characterKey: AssetKeys.Characters.Walk,
    characterX: 0.4,
    characterY: 0.7,
    characterScale: 1.0,
    text: "캐릭터는 앞으로 걷기 시작한다. 길은 단조롭게 이어진다.",
    nextTrigger: "click",
  },
  {
    id: "cut-04",
    title: "첫 번째 문",
    backgroundKey: AssetKeys.Backgrounds.OldDoorRoad,
    characterKey: AssetKeys.Characters.Stand,
    characterX: 0.3,
    characterY: 0.7,
    objects: [
      { key: AssetKeys.Objects.OldDoor, x: 0.6, y: 0.6, scale: 1.2 }
    ],
    text: "조용하고 낡은 문이 길 위에 나타났다. 신앙의 익숙함, 그러나 멀어진 마음.",
    nextTrigger: "click",
  },
  {
    id: "cut-05",
    title: "문 안과 복귀",
    backgroundKey: AssetKeys.Backgrounds.LongRoad,
    characterKey: AssetKeys.Characters.Walk,
    characterX: 0.7,
    characterY: 0.7,
    characterFlipX: true,
    text: "문 안의 시간을 지나 다시 길로 돌아왔다. 불빛은 아직 인식하지 못한 채.",
    nextTrigger: "click",
  },
  {
    id: "cut-06",
    title: "두 번째 문 발견",
    backgroundKey: AssetKeys.Backgrounds.GlamourDoorRoad,
    characterKey: AssetKeys.Characters.Stand,
    characterX: 0.3,
    characterY: 0.7,
    objects: [
      { key: AssetKeys.Objects.GlamourDoor, x: 0.7, y: 0.55, scale: 1.3 }
    ],
    text: "더 눈에 띄는 문이 나타났다. 화려하지만 차가운 청보라 빛의 유혹.",
    nextTrigger: "click",
  },
  {
    id: "cut-07",
    title: "두 번째 문으로 들어감",
    backgroundKey: AssetKeys.Backgrounds.GlamourDoorRoad,
    characterKey: AssetKeys.Characters.Walk,
    characterX: 0.55,
    characterY: 0.65,
    characterScale: 0.9,
    objects: [
      { key: AssetKeys.Objects.GlamourDoor, x: 0.7, y: 0.55, scale: 1.3, alpha: 0.8 }
    ],
    text: "망설이다 결국 그 안으로 발을 내디뎠다. 스스로 선택한 증명의 세계.",
    nextTrigger: "click",
  },
  {
    id: "cut-08",
    title: "두 번째 문 밖으로 나옴",
    backgroundKey: AssetKeys.Backgrounds.LongRoad,
    characterKey: AssetKeys.Characters.Tired,
    characterX: 0.4,
    characterY: 0.7,
    text: "다시 밖으로 나왔을 때, 캐릭터의 어깨는 전보다 더 무거워 보였다.",
    nextTrigger: "click",
  },
  {
    id: "cut-09",
    title: "길 위에서 멈춤",
    backgroundKey: AssetKeys.Backgrounds.EmptyRoad,
    characterKey: AssetKeys.Characters.Stand,
    characterX: 0.5,
    characterY: 0.7,
    text: "\"왜 이렇게 됐지?\" 비어 있는 적막 속에 캐릭터가 멈춰 선다.",
    nextTrigger: "click",
  },
  {
    id: "cut-10",
    title: "억지로 다시 걷기",
    backgroundKey: AssetKeys.Backgrounds.LongRoad,
    characterKey: AssetKeys.Characters.Tired,
    characterX: 0.6,
    characterY: 0.7,
    text: "어디로 가는지도 모른 채, 무기력한 발걸음을 다시 뗀다.",
    nextTrigger: "click",
  },
  {
    id: "cut-11",
    title: "폭풍의 시작",
    backgroundKey: AssetKeys.Backgrounds.StormRoad,
    characterKey: AssetKeys.Characters.Tired,
    characterX: 0.5,
    characterY: 0.7,
    effects: [{ type: "storm" }, { type: "shake" }],
    objects: [
      { key: AssetKeys.Objects.StormOverlay, x: 0.5, y: 0.5, scale: 1.0, alpha: 0.5 }
    ],
    text: "불안과 압박이 내면의 폭풍처럼 몰아친다. 세상의 소음이 덮친다.",
    nextTrigger: "click",
  },
  {
    id: "cut-12",
    title: "무너짐",
    backgroundKey: AssetKeys.Backgrounds.CollapsedRoad,
    characterKey: AssetKeys.Characters.Collapsed,
    characterX: 0.4,
    characterY: 0.8,
    objects: [
      { key: AssetKeys.Objects.DistantLight, x: 0.9, y: 0.5, scale: 0.5, alpha: 0.3 }
    ],
    text: "더 이상 버티지 못하고 무너졌다. 완전한 바닥.",
    nextTrigger: "click",
  },
  {
    id: "cut-13",
    title: "빛을 다시 봄",
    backgroundKey: AssetKeys.Backgrounds.CollapsedRoad,
    characterKey: AssetKeys.Characters.LookUp,
    characterX: 0.4,
    characterY: 0.8,
    objects: [
      { key: AssetKeys.Objects.DistantLight, x: 0.9, y: 0.5, scale: 1.2, alpha: 1.0 }
    ],
    effects: [{ type: "glow", target: AssetKeys.Objects.DistantLight }],
    text: "어둠 속에서 문득, 처음부터 있었던 그 빛을 이제야 발견한다.",
    nextTrigger: "click",
  },
  {
    id: "cut-14",
    title: "다시 일어남",
    backgroundKey: AssetKeys.Backgrounds.CollapsedRoad,
    characterKey: AssetKeys.Characters.Stand,
    characterX: 0.4,
    characterY: 0.7,
    text: "천천히 몸을 일으킨다. 시선은 이제 분명히 그 빛을 향한다.",
    nextTrigger: "click",
  },
  {
    id: "cut-15",
    title: "불빛을 향해 달림",
    backgroundKey: AssetKeys.Backgrounds.LongRoad,
    characterKey: AssetKeys.Characters.Run,
    characterX: 0.8,
    characterY: 0.7,
    text: "간절함을 담아 달린다. 불빛이 점점 가까워진다.",
    nextTrigger: "click",
  },
  {
    id: "cut-16",
    title: "모닥불 앞 도착",
    backgroundKey: AssetKeys.Backgrounds.CampfireEmpty,
    characterKey: AssetKeys.Characters.Stand,
    characterX: 0.2,
    characterY: 0.75,
    objects: [
      { key: AssetKeys.Objects.Campfire, x: 0.5, y: 0.8, scale: 1.0 },
      { key: AssetKeys.Objects.WaitingFigureBack, x: 0.7, y: 0.75, scale: 1.0 },
      { key: AssetKeys.Objects.Log, x: 0.7, y: 0.85, scale: 1.0 }
    ],
    text: "도착한 곳엔 모닥불이 있고, 누군가가 이미 그 자리에 앉아 있다.",
    nextTrigger: "click",
  },
  {
    id: "cut-17",
    title: "함께 앉음",
    backgroundKey: AssetKeys.Backgrounds.CampfireFinal,
    characterKey: AssetKeys.Characters.SitBack,
    characterX: 0.4,
    characterY: 0.75,
    objects: [
      { key: AssetKeys.Objects.Campfire, x: 0.5, y: 0.8, scale: 1.0 },
      { key: AssetKeys.Objects.WaitingFigureBack, x: 0.6, y: 0.75, scale: 1.0 },
      { key: AssetKeys.Objects.Log, x: 0.5, y: 0.85, scale: 1.5 },
      { key: AssetKeys.Objects.Blanket, x: 0.4, y: 0.75, scale: 1.0 }
    ],
    effects: [{ type: "warmLight" }],
    text: "그분 곁에 앉는다. 말없이 건네진 담요 속에서 둘은 불을 바라본다.",
    nextTrigger: "click",
  }
];
