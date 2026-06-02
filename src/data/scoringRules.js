export const baseScore = 60;

export const partRules = {
  lip: {
    label: "립",
    max: 14,
    season: 5,
    undertone: 5,
    tone: 4,
    toneBridge: 2
  },
  blusher: {
    label: "블러셔",
    max: 10,
    season: 4,
    undertone: 3,
    tone: 3,
    toneBridge: 1
  },
  eyeshadow: {
    label: "아이섀도우",
    max: 10,
    season: 4,
    undertone: 3,
    tone: 3,
    toneBridge: 1
  }
};

export const toneNeighbors = {
  light: ["soft"],
  soft: ["light", "true"],
  true: ["soft", "clear"],
  clear: ["true", "deep"],
  deep: ["clear"]
};

export const naturalTonePairs = new Set(["light:soft", "soft:true", "true:clear", "clear:deep"]);
