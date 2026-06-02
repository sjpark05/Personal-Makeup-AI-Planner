import { seasonProfiles, toneLabels } from "../data/personalColors.js";

function getScoreSummary(score) {
  if (score >= 92) return "전체적으로 기준 피부 톤과 색조 조화가 매우 안정적인 조합입니다.";
  if (score >= 82) return "대체로 잘 어울리며, 일부 색상이 포인트 역할을 하는 조합입니다.";
  if (score >= 72) return "어울리는 요소와 실험적인 요소가 함께 있는 조합입니다.";
  return "기준 피부 톤과 다른 색감이 많아 개성은 있지만 조화 점수는 낮은 편입니다.";
}

export function generateLocalAnalysis(skinTone, selectedColors, scoreResult) {
  const profile = seasonProfiles[skinTone.season];
  const picked = Object.values(selectedColors).filter(Boolean);

  if (!picked.length) {
    return [
      `${profile.label} ${toneLabels[skinTone.toneDetail]} 기준으로 분석합니다.`,
      "립, 블러셔, 아이섀도우 중 하나 이상을 선택하면 조합 점수를 확인할 수 있습니다."
    ];
  }

  const bestPart = Object.values(scoreResult.partScores)
    .filter((part) => part.color)
    .sort((a, b) => b.score / b.max - a.score / a.max)[0];

  return [
    `${profile.label} ${toneLabels[skinTone.toneDetail]} 기준의 색조 조합입니다.`,
    bestPart ? `${bestPart.label}의 ${bestPart.color.family} 색상이 현재 조합에서 가장 안정적으로 어울립니다.` : "",
    scoreResult.harmony.details.join(", "),
    getScoreSummary(scoreResult.score)
  ].filter(Boolean);
}
