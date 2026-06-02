import { seasonProfiles } from "../data/personalColors.js";
import { baseScore, naturalTonePairs, partRules, toneNeighbors } from "../data/scoringRules.js";

function getToneState(toneDetail) {
  return {
    preferredTones: [toneDetail],
    closeTones: toneNeighbors[toneDetail] ?? []
  };
}

function scoreTone(colorTone, rule, toneState) {
  if (toneState.preferredTones.includes(colorTone)) return rule.tone;
  if (toneState.closeTones.includes(colorTone)) return Math.round(rule.tone * 0.55);
  return 0;
}

function scorePart(part, color, skinTone, toneState) {
  const rule = partRules[part];

  if (!color) {
    return {
      part,
      label: rule.label,
      score: 0,
      max: rule.max,
      color: null,
      details: ["색상 미선택"]
    };
  }

  const profile = seasonProfiles[skinTone.season];
  const seasonScore = color.season === skinTone.season ? rule.season : 0;
  const undertoneScore = color.undertone === profile.undertone ? rule.undertone : 0;
  const toneScore = scoreTone(color.tone, rule, toneState);
  const bridgeScore =
    color.season !== skinTone.season && toneState.preferredTones.includes(color.tone) ? rule.toneBridge : 0;
  const score = Math.min(rule.max, seasonScore + undertoneScore + toneScore + bridgeScore);

  return {
    part,
    label: rule.label,
    score,
    max: rule.max,
    color,
    details: [
      seasonScore ? "계절 일치" : "계절 다름",
      undertoneScore ? "웜/쿨 일치" : "웜/쿨 다름",
      toneScore === rule.tone ? "세부 톤 일치" : toneScore > 0 ? "인접 톤" : "먼 톤",
      bridgeScore ? "동일 톤 보정" : null
    ].filter(Boolean)
  };
}

function pairKey(a, b) {
  return [a, b].sort().join(":");
}

function scoreHarmony(colors) {
  if (colors.length < 2) {
    return {
      score: 0,
      max: 6,
      details: ["두 가지 이상 선택하면 조화 점수가 계산됩니다."]
    };
  }

  let naturalPairs = 0;
  let totalPairs = 0;

  for (let i = 0; i < colors.length; i += 1) {
    for (let j = i + 1; j < colors.length; j += 1) {
      totalPairs += 1;
      if (colors[i].tone === colors[j].tone || naturalTonePairs.has(pairKey(colors[i].tone, colors[j].tone))) {
        naturalPairs += 1;
      }
    }
  }

  const seasonCounts = colors.reduce((acc, color) => {
    acc[color.season] = (acc[color.season] ?? 0) + 1;
    return acc;
  }, {});
  const maxSeasonCount = Math.max(...Object.values(seasonCounts));
  const seasonScore = maxSeasonCount === colors.length ? 2 : maxSeasonCount >= 2 ? 1 : 0;
  const undertoneScore = new Set(colors.map((color) => color.undertone)).size === 1 ? 2 : 0;
  const toneScore = naturalPairs === totalPairs ? 2 : naturalPairs > 0 ? 1 : 0;

  return {
    score: Math.min(6, seasonScore + undertoneScore + toneScore),
    max: 6,
    details: [
      seasonScore === 2 ? "계절 통일" : seasonScore === 1 ? "일부 계절 통일" : "계절 혼합",
      undertoneScore ? "웜/쿨 통일" : "웜/쿨 혼합",
      toneScore === 2 ? "자연스러운 톤 흐름" : toneScore === 1 ? "일부 자연스러운 톤 흐름" : "톤 대비"
    ]
  };
}

export function calculateScore(skinTone, selectedColors) {
  const toneState = getToneState(skinTone.toneDetail);
  const partScores = {
    lip: scorePart("lip", selectedColors.lip, skinTone, toneState),
    blusher: scorePart("blusher", selectedColors.blusher, skinTone, toneState),
    eyeshadow: scorePart("eyeshadow", selectedColors.eyeshadow, skinTone, toneState)
  };

  const activeColors = Object.values(selectedColors).filter(Boolean);
  const harmony = scoreHarmony(activeColors);
  const partsTotal = Object.values(partScores).reduce((sum, part) => sum + part.score, 0);

  return {
    baseScore,
    score: Math.min(100, baseScore + partsTotal + harmony.score),
    partScores,
    harmony,
    activeColorCount: activeColors.length,
    toneState
  };
}
