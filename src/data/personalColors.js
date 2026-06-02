export const seasonOrder = ["spring", "summer", "autumn", "winter"];
export const toneOrder = ["light", "soft", "true", "clear", "deep"];

export const seasonProfiles = {
  spring: {
    label: "봄 웜톤",
    shortLabel: "봄",
    undertone: "warm",
    description: "맑고 생기 있는 따뜻한 색감이 잘 어울리는 타입",
    representativeTones: ["light", "true", "clear"],
    skinColors: {
      light: "#F9E4D4",
      soft: "#F8E1D1",
      true: "#F9E1CF",
      clear: "#FAE1CF",
      deep: "#F8E0CE"
    }
  },
  summer: {
    label: "여름 쿨톤",
    shortLabel: "여름",
    undertone: "cool",
    description: "부드럽고 맑은 차가운 색감이 잘 어울리는 타입",
    representativeTones: ["light", "soft", "true"],
    skinColors: {
      light: "#F9E6DD",
      soft: "#F8E4DA",
      true: "#F8E3D9",
      clear: "#F9E3DB",
      deep: "#F8E2D8"
    }
  },
  autumn: {
    label: "가을 웜톤",
    shortLabel: "가을",
    undertone: "warm",
    description: "차분하고 깊이 있는 따뜻한 색감이 잘 어울리는 타입",
    representativeTones: ["soft", "true", "deep"],
    skinColors: {
      light: "#F9E3D0",
      soft: "#F8DECA",
      true: "#F9DDC7",
      clear: "#FADFC6",
      deep: "#F8DCC5"
    }
  },
  winter: {
    label: "겨울 쿨톤",
    shortLabel: "겨울",
    undertone: "cool",
    description: "선명하고 또렷한 차가운 색감이 잘 어울리는 타입",
    representativeTones: ["true", "clear", "deep"],
    skinColors: {
      light: "#F9E6DE",
      soft: "#F8E4DB",
      true: "#F8E3DA",
      clear: "#F9E3DC",
      deep: "#F8E2D9"
    }
  }
};

export const toneDetails = [
  { id: "light", label: "라이트" },
  { id: "soft", label: "소프트" },
  { id: "true", label: "트루" },
  { id: "clear", label: "클리어" },
  { id: "deep", label: "딥" }
];

export const toneLabels = {
  light: "라이트",
  soft: "소프트",
  true: "트루",
  clear: "클리어",
  deep: "딥"
};

export function getAllowedRecommendationTones(toneDetail) {
  const index = toneOrder.indexOf(toneDetail);
  if (index < 0) return [];
  return toneOrder.filter((_, toneIndex) => Math.abs(toneIndex - index) <= 1);
}
