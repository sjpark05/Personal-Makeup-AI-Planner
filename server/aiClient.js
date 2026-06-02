import OpenAI from "openai";

const fallbackAnalysis = {
  analysis:
    "현재는 연결 키가 없어 예시 설명을 표시합니다. 선택한 색상과 점수 결과를 바탕으로, 실제 연결 시 조합의 장점과 아쉬운 점을 자연어로 분석합니다.",
  strengths: ["선택한 색상이 얼굴 시각화에 반영됩니다.", "점수는 내부 규칙 기반 로직으로 계산됩니다."],
  weaknesses: ["연결 키를 넣기 전에는 실제 생성형 인공지능 설명이 아닙니다."],
  suggestion: "설정 파일에 연결 키를 넣은 뒤 다시 실행하면 실제 인공지능 설명을 받을 수 있습니다."
};

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.FACTCHAT_API_KEY;
  if (!apiKey || apiKey.includes("YOUR_")) return null;

  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || process.env.FACTCHAT_BASE_URL || undefined
  });
}

function safeParseJson(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return fallback;
    try {
      return JSON.parse(match[0]);
    } catch {
      return fallback;
    }
  }
}

const koreanTermMap = new Map([
  ["spring", "봄"],
  ["summer", "여름"],
  ["autumn", "가을"],
  ["winter", "겨울"],
  ["light", "라이트"],
  ["soft", "소프트"],
  ["true", "트루"],
  ["clear", "클리어"],
  ["deep", "딥"],
  ["lip", "립"],
  ["blusher", "블러셔"],
  ["eyeshadow", "아이섀도우"],
  ["api", "연결"],
  ["openai", "인공지능"],
  ["ai", "인공지능"],
  ["json", "정해진 형식"]
]);

const seasonLabelMap = {
  spring: "봄 웜톤",
  summer: "여름 쿨톤",
  autumn: "가을 웜톤",
  winter: "겨울 쿨톤"
};

const toneLabelMap = {
  light: "라이트",
  soft: "소프트",
  true: "트루",
  clear: "클리어",
  deep: "딥"
};

function toKoreanSkinTone(skinTone) {
  return `${seasonLabelMap[skinTone.season] ?? skinTone.season} ${toneLabelMap[skinTone.toneDetail] ?? skinTone.toneDetail}`;
}

function replaceEnglishTerms(text) {
  if (typeof text !== "string") return text;
  let next = text;

  for (const [english, korean] of koreanTermMap) {
    next = next.replace(new RegExp(`\\b${english}\\b`, "gi"), korean);
  }

  return next
    .replace(/\b(?:spring|summer|autumn|winter)-(?:light|soft|true|clear|deep)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function sanitizeTextFields(value) {
  if (Array.isArray(value)) return value.map(sanitizeTextFields);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        ["lip", "blusher", "eyeshadow", "source"].includes(key) ? item : sanitizeTextFields(item)
      ])
    );
  }
  return replaceEnglishTerms(value);
}

async function createJsonResponse(messages, fallback) {
  const client = getClient();
  if (!client) return { ...fallback, source: "demo" };

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || process.env.FACTCHAT_MODEL || "gpt-4o-mini",
    messages
  });

  const content = response.choices?.[0]?.message?.content ?? "";
  return { ...sanitizeTextFields(safeParseJson(content, fallback)), source: "ai" };
}

function firstColor(candidates, part, fallbackPart) {
  return candidates?.[part]?.[0]?.id ?? candidates?.[fallbackPart]?.[0]?.id ?? "none";
}

function secondColor(candidates, part) {
  return candidates?.[part]?.[1]?.id ?? candidates?.[part]?.[0]?.id ?? "none";
}

function buildFallbackRecommendation(candidates) {
  const lip = secondColor(candidates, "lip");
  const blusher = firstColor(candidates, "blusher", "lip");
  const eyeshadow = firstColor(candidates, "eyeshadow", "lip");

  return {
    concept: "상황 맞춤 데모 메이크업",
    summary: "연결 키가 없거나 응답 해석에 실패해, 현재 후보 팔레트 안에서 예시 추천을 표시합니다.",
    lip,
    blusher,
    eyeshadow,
    reason:
      "추천 모드의 톤 제한 규칙을 유지하기 위해 현재 피부 톤에서 허용된 후보 색상만 사용했습니다. 실제 연결 시에는 사용자가 입력한 상황과 분위기를 반영한 설명으로 바뀝니다.",
    avoid: "추천 모드에서는 기준 톤에서 두 단계 이상 떨어진 색상은 후보에서 제외됩니다.",
    alternatives: [
      {
        title: "더 부드러운 버전",
        lip: firstColor(candidates, "lip", "blusher"),
        blusher,
        eyeshadow,
        note: "립의 선명도를 낮춰 전체 인상을 더 자연스럽게 만듭니다."
      }
    ]
  };
}

function normalizeColorId(value, validIds, fallbackId) {
  if (typeof value !== "string") return fallbackId;
  if (validIds.has(value)) return value;

  const matchedId = [...validIds].find((id) => value.includes(id));
  return matchedId ?? fallbackId;
}

function normalizeRecommendation(result, candidates) {
  const fallback = buildFallbackRecommendation(candidates);
  const validIds = {
    lip: new Set(candidates?.lip?.map((color) => color.id) ?? []),
    blusher: new Set(candidates?.blusher?.map((color) => color.id) ?? []),
    eyeshadow: new Set(candidates?.eyeshadow?.map((color) => color.id) ?? [])
  };

  return {
    ...fallback,
    ...result,
    lip: normalizeColorId(result.lip, validIds.lip, fallback.lip),
    blusher: normalizeColorId(result.blusher, validIds.blusher, fallback.blusher),
    eyeshadow: normalizeColorId(result.eyeshadow, validIds.eyeshadow, fallback.eyeshadow),
    alternatives: Array.isArray(result.alternatives)
      ? result.alternatives.map((item) => ({
          ...item,
          lip: normalizeColorId(item.lip, validIds.lip, fallback.lip),
          blusher: normalizeColorId(item.blusher, validIds.blusher, fallback.blusher),
          eyeshadow: normalizeColorId(item.eyeshadow, validIds.eyeshadow, fallback.eyeshadow)
        }))
      : fallback.alternatives
  };
}

export async function createRecommendation(payload) {
  const { skinTone, requestText, candidates } = payload;
  const fallbackRecommendation = buildFallbackRecommendation(candidates);
  const skinToneText = toKoreanSkinTone(skinTone);

  const candidateText = Object.entries(candidates)
    .map(
      ([part, colors]) =>
        `${part}: ${colors.map((color) => `식별자 ${color.id} / 화면 표시 ${color.label} ${color.family}`).join(", ")}`
    )
    .join("\n");

  const result = await createJsonResponse(
    [
      {
        role: "system",
        content:
          "너는 퍼스널 컬러 기반 메이크업 추천 도우미다. 반드시 정해진 객체 형식으로만 출력한다. lip, blusher, eyeshadow 값에는 후보 식별자만 넣는다. concept, summary, reason, avoid, title, note에는 영어와 로마자 식별자를 절대 쓰지 말고 한국어만 쓴다. 추천은 과장하지 말고 근거를 간단히 설명한다."
      },
      {
        role: "user",
        content: `사용자 피부 톤: ${skinToneText}
자연어 요청: ${requestText}

추천 가능한 후보:
${candidateText}

아래 구조로만 답해라. 식별자 필드 외 설명 문장에는 영어를 쓰지 마라.
{
  "concept": "추천 컨셉 이름",
  "summary": "한 문장 요약",
  "lip": "후보 중 립 식별자",
  "blusher": "후보 중 블러셔 식별자",
  "eyeshadow": "후보 중 아이섀도우 식별자",
  "reason": "추천 이유 2~4문장",
  "avoid": "피하면 좋은 조합 1~2문장",
  "alternatives": [
    {"title": "대체안 이름", "lip": "립 식별자", "blusher": "블러셔 식별자", "eyeshadow": "아이섀도우 식별자", "note": "설명"}
  ]
}`
      }
    ],
    fallbackRecommendation
  );

  return normalizeRecommendation(result, candidates);
}

export async function createCombinationAnalysis(payload) {
  const { skinTone, selectedColors, scoreResult } = payload;
  const skinToneText = toKoreanSkinTone(skinTone);

  return createJsonResponse(
    [
      {
        role: "system",
        content:
          "너는 메이크업 조합을 설명하는 도우미다. 점수는 사용자가 제공한 규칙 기반 결과를 그대로 해석하고, 새 점수를 만들지 않는다. 반드시 정해진 객체 형식으로만 출력한다. 모든 설명 문장은 한국어로만 작성하고, 영어와 로마자 식별자를 절대 쓰지 않는다."
      },
      {
        role: "user",
        content: `사용자 피부 톤: ${skinToneText}
선택 색상:
- 립: ${selectedColors.lip ? `${selectedColors.lip.label} / ${selectedColors.lip.family}` : "미선택"}
- 블러셔: ${selectedColors.blusher ? `${selectedColors.blusher.label} / ${selectedColors.blusher.family}` : "미선택"}
- 아이섀도우: ${selectedColors.eyeshadow ? `${selectedColors.eyeshadow.label} / ${selectedColors.eyeshadow.family}` : "미선택"}

규칙 기반 점수:
- 최종 점수: ${scoreResult.score}
- 기본 점수: ${scoreResult.baseScore}
- 립: ${scoreResult.partScores.lip.score}/${scoreResult.partScores.lip.max}
- 블러셔: ${scoreResult.partScores.blusher.score}/${scoreResult.partScores.blusher.max}
- 아이섀도우: ${scoreResult.partScores.eyeshadow.score}/${scoreResult.partScores.eyeshadow.max}
- 조화: ${scoreResult.harmony.score}/${scoreResult.harmony.max}

아래 구조로만 답해라. 모든 값은 한국어 문장으로만 써라.
{
  "analysis": "전체 설명 2~4문장",
  "strengths": ["장점"],
  "weaknesses": ["아쉬운 점"],
  "suggestion": "개선 제안"
}`
      }
    ],
    fallbackAnalysis
  );
}
