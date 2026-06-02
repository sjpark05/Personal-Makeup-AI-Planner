import { seasonOrder, seasonProfiles, toneLabels, toneOrder } from "./personalColors.js";

const lipColors = {
  spring: {
    light: { hex: "#EFA69B", family: "맑은 피치 핑크" },
    soft: { hex: "#E78D82", family: "소프트 코랄 핑크" },
    true: { hex: "#DB6F61", family: "살몬 코랄" },
    clear: { hex: "#E85C55", family: "맑은 코랄 레드" },
    deep: { hex: "#C7564B", family: "코랄 브릭" }
  },
  summer: {
    light: { hex: "#E7AFC0", family: "쿨 라이트 핑크" },
    soft: { hex: "#C98A9D", family: "뮤트 로즈 핑크" },
    true: { hex: "#BF6F89", family: "로즈 핑크" },
    clear: { hex: "#D85C8B", family: "라즈베리 핑크" },
    deep: { hex: "#9F526F", family: "베리 로즈" }
  },
  autumn: {
    light: { hex: "#D18D72", family: "누드 피치" },
    soft: { hex: "#B96F5B", family: "로즈 베이지" },
    true: { hex: "#A85A48", family: "테라코타 로즈" },
    clear: { hex: "#B9503C", family: "칠리 코랄" },
    deep: { hex: "#843F34", family: "브릭 레드" }
  },
  winter: {
    light: { hex: "#E9A3B7", family: "아이시 핑크" },
    soft: { hex: "#B96D89", family: "로즈 모브" },
    true: { hex: "#B92C56", family: "블루 레드" },
    clear: { hex: "#CC174B", family: "체리 레드" },
    deep: { hex: "#742144", family: "플럼 체리" }
  }
};

const blusherColors = {
  spring: {
    light: { hex: "#F2B9A8", family: "피치 밀크" },
    soft: { hex: "#EAA99A", family: "소프트 살몬" },
    true: { hex: "#DF8F7B", family: "코랄 피치" },
    clear: { hex: "#EA887F", family: "생기 코랄" },
    deep: { hex: "#CA7869", family: "웜 피치 로즈" }
  },
  summer: {
    light: { hex: "#EAC6CF", family: "쿨 밀크 핑크" },
    soft: { hex: "#D8ADB8", family: "소프트 로즈" },
    true: { hex: "#CF98A8", family: "쿨 로즈" },
    clear: { hex: "#D991AD", family: "맑은 로즈 핑크" },
    deep: { hex: "#B77C91", family: "뮤트 베리" }
  },
  autumn: {
    light: { hex: "#DDB092", family: "누드 살구" },
    soft: { hex: "#C9977D", family: "베이지 로즈" },
    true: { hex: "#B98267", family: "웜 로즈 브라운" },
    clear: { hex: "#C77B62", family: "코랄 브라운" },
    deep: { hex: "#9D6354", family: "브릭 베이지" }
  },
  winter: {
    light: { hex: "#E8C1CC", family: "아이시 로즈" },
    soft: { hex: "#C99AAA", family: "모브 로즈" },
    true: { hex: "#B9758D", family: "쿨 베리" },
    clear: { hex: "#C86791", family: "체리 핑크" },
    deep: { hex: "#8C526C", family: "플럼 로즈" }
  }
};

const eyeshadowColors = {
  spring: {
    light: { hex: "#E6C8AA", family: "피치 베이지" },
    soft: { hex: "#D3AA8B", family: "살구 베이지" },
    true: { hex: "#BD8A63", family: "라이트 카멜" },
    clear: { hex: "#C47A58", family: "코랄 브라운" },
    deep: { hex: "#8E6044", family: "웜 브라운" }
  },
  summer: {
    light: { hex: "#E7D4D5", family: "핑크 베이지" },
    soft: { hex: "#CDB4BC", family: "로즈 모브" },
    true: { hex: "#B8929E", family: "로즈 브라운" },
    clear: { hex: "#C88DA8", family: "쿨 로즈" },
    deep: { hex: "#8C6A78", family: "모브 토프" }
  },
  autumn: {
    light: { hex: "#D6B88F", family: "허니 베이지" },
    soft: { hex: "#B8926D", family: "토스트 베이지" },
    true: { hex: "#936C4D", family: "카멜 브라운" },
    clear: { hex: "#A46245", family: "로즈 브릭" },
    deep: { hex: "#5F4534", family: "초콜릿 브라운" }
  },
  winter: {
    light: { hex: "#E4D6D9", family: "쿨 핑크 베이지" },
    soft: { hex: "#C6AAB6", family: "모브 베이지" },
    true: { hex: "#9E7E8A", family: "로즈 토프" },
    clear: { hex: "#B76B91", family: "쿨 로즈 포인트" },
    deep: { hex: "#664B5A", family: "플럼 브라운" }
  }
};

function buildPalette(colors, part) {
  return seasonOrder.flatMap((season) =>
    toneOrder.map((tone) => ({
      id: `${season}-${tone}`,
      label: `${seasonProfiles[season].shortLabel} ${toneLabels[tone]}`,
      season,
      undertone: seasonProfiles[season].undertone,
      tone,
      family: colors[season][tone].family,
      hex: colors[season][tone].hex,
      part
    }))
  );
}

export const allColorPalettes = {
  lip: buildPalette(lipColors, "lip"),
  blusher: buildPalette(blusherColors, "blusher"),
  eyeshadow: buildPalette(eyeshadowColors, "eyeshadow")
};

export function getPaletteForPart(part) {
  return allColorPalettes[part] ?? allColorPalettes.lip;
}

export function getColorById(part, id) {
  return getPaletteForPart(part).find((color) => color.id === id) ?? null;
}

export function getRecommendationCandidates(season, allowedTones) {
  return {
    lip: allColorPalettes.lip.filter((color) => color.season === season && allowedTones.includes(color.tone)),
    blusher: allColorPalettes.blusher.filter((color) => color.season === season && allowedTones.includes(color.tone)),
    eyeshadow: allColorPalettes.eyeshadow.filter((color) => color.season === season && allowedTones.includes(color.tone))
  };
}
