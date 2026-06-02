import { useMemo, useState } from "react";
import { Sparkles, SlidersHorizontal, UserRound, Wand2 } from "lucide-react";
import { getColorById, getPaletteForPart, getRecommendationCandidates } from "./data/colorPalette.js";
import { defaultMakeupSelection, defaultSkinTone } from "./data/defaultSelection.js";
import { seasonOrder, seasonProfiles, toneDetails, toneLabels, getAllowedRecommendationTones } from "./data/personalColors.js";
import { selectedPartLabels } from "./data/uiLabels.js";
import { calculateScore } from "./utils/calculateScore.js";
import { generateLocalAnalysis } from "./utils/generateAnalysis.js";
import { getSkinColor } from "./utils/getSkinColor.js";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

function buildSelectedColors(selection) {
  return {
    lip: selection.lip === "none" ? null : getColorById("lip", selection.lip),
    blusher: selection.blusher === "none" ? null : getColorById("blusher", selection.blusher),
    eyeshadow: selection.eyeshadow === "none" ? null : getColorById("eyeshadow", selection.eyeshadow)
  };
}

function getScoreTone(score) {
  if (score >= 92) return "excellent";
  if (score >= 82) return "strong";
  if (score >= 72) return "balanced";
  return "experimental";
}

function HomeView({ skinTone, onNavigate }) {
  const isReady = Boolean(skinTone);

  return (
    <section className="home-view">
      <div>
        <p className="eyebrow">AI 기반 메이크업 플래너</p>
        <h1>AI 기반 개인 메이크업 스타일 플래너</h1>
        <p className="home-copy">
          사용자의 피부 톤에 맞추어, 추천 모드 혹은 조합 모드로 메이크업 색조를 확인합니다.
        </p>
        {skinTone && (
          <p className="current-tone">
            현재 피부 톤: <strong>{seasonProfiles[skinTone.season].label} {toneLabels[skinTone.toneDetail]}</strong>
          </p>
        )}
      </div>

      <div className="home-actions">
        <button className="mode-card" type="button" onClick={() => onNavigate("skin")}>
          <UserRound size={28} />
          <span>피부 톤 설정</span>
          <small>퍼스널 컬러 및 세부 톤을 저장합니다.</small>
        </button>
        <button className="mode-card" type="button" disabled={!isReady} onClick={() => onNavigate("recommend")}>
          <Sparkles size={28} />
          <span>추천 모드</span>
          <small>상황을 입력하면, AI가 조합을 추천해 줍니다.</small>
        </button>
        <button className="mode-card" type="button" disabled={!isReady} onClick={() => onNavigate("combine")}>
          <SlidersHorizontal size={28} />
          <span>조합 모드</span>
          <small>색상을 자유롭게 선택하면, AI가 설명해 줍니다.</small>
        </button>
      </div>
    </section>
  );
}

function SkinSetup({ initialTone, onSave, onBack }) {
  const [draft, setDraft] = useState(initialTone ?? defaultSkinTone);

  return (
    <section className="setup-view">
      <div className="setup-panel">
        <div className="setup-heading">
          <div>
            <h1>피부 톤 설정</h1>
            <p>추천 모드와 조합 모드에서 사용할 기준 퍼스널 컬러를 설정합니다.</p>
          </div>
          <button className="secondary-action compact-action" type="button" onClick={() => setDraft(defaultSkinTone)}>
            초기화
          </button>
        </div>

        <div className="field-group">
          <h2>퍼스널 컬러</h2>
          <div className="segmented-grid four">
            {seasonOrder.map((season) => (
              <button
                className={draft.season === season ? "selected" : ""}
                key={season}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, season }))}
              >
                {seasonProfiles[season].label}
              </button>
            ))}
          </div>
        </div>

        <div className="field-group">
          <h2>세부 톤</h2>
          <div className="segmented-grid tone">
            {toneDetails.map((tone) => (
              <button
                className={draft.toneDetail === tone.id ? "selected" : ""}
                key={tone.id}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, toneDetail: tone.id }))}
              >
                {tone.label}
              </button>
            ))}
          </div>
        </div>

        <div className="action-row">
          <button className="secondary-action" type="button" onClick={onBack}>처음으로</button>
          <button className="primary-action" type="button" onClick={() => onSave(draft)}>피부 톤 저장하기</button>
        </div>
      </div>
    </section>
  );
}

function FacePreview({ selectedColors, skinTone, score }) {
  const skinColor = getSkinColor(skinTone);
  const lip = selectedColors.lip?.hex ?? "#C99A8A";
  const blusher = selectedColors.blusher?.hex ?? "transparent";
  const eyeshadow = selectedColors.eyeshadow?.hex ?? "transparent";

  return (
    <section className="face-card" aria-label="메이크업 얼굴 시각화">
      <div className={`score-orbit ${getScoreTone(score)}`}>
        <span>{score}</span>
        <small>/ 100</small>
      </div>
      <svg className="face-svg" viewBox="0 0 520 620" role="img" aria-label="얼굴 메이크업 미리보기">
        <defs>
          <filter id="blushBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <filter id="shadowBlur" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <path d="M220 434h80l15 119H205l15-119Z" fill={skinColor} opacity="0.86" />
        <path d="M144 528c37-32 196-32 232 0 20 18 34 48 40 81H104c6-33 20-63 40-81Z" fill="#EFE3D8" />
        <path d="M145 252c-21 8-30 30-21 52 7 18 21 31 36 33" fill={skinColor} stroke="#2B211F" strokeWidth="1.7" />
        <path d="M375 252c21 8 30 30 21 52-7 18-21 31-36 33" fill={skinColor} stroke="#2B211F" strokeWidth="1.7" />
        <path d="M143 236C143 139 190 91 260 91s117 48 117 145c0 112-47 210-117 210S143 348 143 236Z" fill={skinColor} stroke="#241B1A" strokeWidth="2.1" />

        {selectedColors.blusher && (
          <>
            <ellipse cx="199" cy="329" rx="46" ry="29" fill={blusher} opacity="0.22" filter="url(#blushBlur)" />
            <ellipse cx="321" cy="329" rx="46" ry="29" fill={blusher} opacity="0.22" filter="url(#blushBlur)" />
          </>
        )}
        {selectedColors.eyeshadow && (
          <>
            <path d="M162 263C180 235 237 233 257 263C232 254 190 254 162 263Z" fill={eyeshadow} opacity="0.28" filter="url(#shadowBlur)" />
            <path d="M263 263C283 233 340 235 358 263C330 254 288 254 263 263Z" fill={eyeshadow} opacity="0.28" filter="url(#shadowBlur)" />
          </>
        )}
        <path d="M167 226c27-13 59-10 81 7" fill="none" stroke="#2D211F" strokeWidth="4" strokeLinecap="round" />
        <path d="M272 233c22-17 54-20 81-7" fill="none" stroke="#2D211F" strokeWidth="4" strokeLinecap="round" />
        <path d="M166 266c17-23 58-27 80 1-22 15-60 14-80-1Z" fill="#FFF8F0" />
        <path d="M274 267c22-28 63-24 80-1-20 15-58 16-80 1Z" fill="#FFF8F0" />
        <path d="M166 266c17-23 58-27 80 1" fill="none" stroke="#1F1716" strokeWidth="3.7" strokeLinecap="round" />
        <path d="M274 267c22-28 63-24 80-1" fill="none" stroke="#1F1716" strokeWidth="3.7" strokeLinecap="round" />
        <circle cx="212" cy="263" r="10.2" fill="#5A4038" />
        <circle cx="308" cy="263" r="10.2" fill="#5A4038" />
        <circle cx="212" cy="263" r="5.2" fill="#171313" />
        <circle cx="308" cy="263" r="5.2" fill="#171313" />
        <path d="M260 286c-3 24-7 42-3 50 4 5 12 4 18 0" fill="none" stroke="#A97866" strokeWidth="2.4" strokeLinecap="round" opacity="0.45" />
        <path d="M228 385c13-8 24-5 32-1 8-4 19-7 32 1-7 17-22 27-32 27s-25-10-32-27Z" fill={lip} opacity={selectedColors.lip ? "0.82" : "0.28"} />
      </svg>
      <div className="face-caption">
        <strong>{seasonProfiles[skinTone.season].label} {toneLabels[skinTone.toneDetail]}</strong>
        <span>립, 블러셔, 아이섀도우 색상이 얼굴에 반영됩니다.</span>
      </div>
    </section>
  );
}

function ScorePanel({ scoreResult }) {
  return (
    <section className="result-panel">
      <h2>점수 결과</h2>
      <div className={`score-badge ${getScoreTone(scoreResult.score)}`}>
        <span>{scoreResult.score}</span>
        <small>최종 점수</small>
      </div>
      <div className="breakdown">
        <div className="breakdown-row"><span>기본 점수</span><strong>{scoreResult.baseScore}점</strong></div>
        {Object.values(scoreResult.partScores).map((part) => (
          <div className="breakdown-row" key={part.part}>
            <span>{part.label}</span>
            <strong>{part.score} / {part.max}</strong>
          </div>
        ))}
        <div className="breakdown-row">
          <span>조화</span>
          <strong>{scoreResult.harmony.score} / {scoreResult.harmony.max}</strong>
        </div>
      </div>
    </section>
  );
}

function AppliedPalette({ selectedColors }) {
  return (
    <section className="result-panel">
      <h2>현재 적용 색상</h2>
      <div className="applied-palette">
        {Object.entries(selectedColors).map(([part, color]) => (
          <div className="palette-item" key={part}>
            <span className="palette-dot" style={{ background: color?.hex ?? "#f3eee8" }} />
            <div>
              <small>{color ? `${selectedPartLabels[part]} (${color.label})` : selectedPartLabels[part]}</small>
              <strong>{color ? color.family : "미선택"}</strong>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SeasonColorRow({ part, season, value, onChange }) {
  const colors = getPaletteForPart(part).filter((color) => color.season === season);

  return (
    <div className="season-color-row">
      <div className="season-row-label">{seasonProfiles[season].shortLabel}</div>
      <div className="season-row-colors">
        {colors.map((color) => (
          <button
            className={`color-option ${value === color.id ? "selected" : ""}`}
            key={`${part}-${color.id}`}
            type="button"
            onClick={() => onChange(color.id)}
            title={`${color.label} - ${color.family}`}
          >
            <span style={{ background: color.hex }} />
            <strong>{toneLabels[color.tone]}</strong>
            <small>{color.family}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function ColorSelect({ part, value, onChange }) {
  return (
    <div className="color-select">
      <h3>{selectedPartLabels[part]} 선택</h3>
      <div className="season-color-grid">
        {seasonOrder.map((season) => (
          <SeasonColorRow
            key={`${part}-${season}`}
            part={part}
            season={season}
            value={value}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
}

function RecommendationMode({ skinTone, selection, setSelection, onBack }) {
  const [requestText, setRequestText] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const selectedColors = useMemo(() => buildSelectedColors(selection), [selection]);
  const scoreResult = useMemo(() => calculateScore(skinTone, selectedColors), [skinTone, selectedColors]);
  const allowedTones = getAllowedRecommendationTones(skinTone.toneDetail);

  const requestRecommendation = async () => {
    setLoading(true);
    try {
      const candidates = getRecommendationCandidates(skinTone.season, allowedTones);
      const response = await fetch(`${API_BASE}/api/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skinTone, requestText, candidates })
      });
      if (!response.ok) throw new Error("AI recommendation request failed");
      const result = await response.json();
      setAiResult(result);
      setSelection({
        lip: result.lip ?? selection.lip,
        blusher: result.blusher ?? selection.blusher,
        eyeshadow: result.eyeshadow ?? selection.eyeshadow
      });
    } catch {
      setAiResult({
        concept: "추천 생성 실패",
        summary: "서버 실행 상태를 확인해주세요.",
        reason: "화면은 실행 중이지만 서버 또는 인공지능 연결에 문제가 있을 수 있습니다.",
        avoid: "",
        alternatives: []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModeLayout title="추천 모드" skinTone={skinTone} selectedColors={selectedColors} scoreResult={scoreResult} onBack={onBack}>
      <section className="input-panel">
        <label className="textarea-field">
          <span>상황과 원하는 분위기</span>
          <textarea
            value={requestText}
            onChange={(event) => setRequestText(event.target.value)}
            placeholder="예: 발표라서 차분하지만 얼굴이 흐려 보이지 않았으면 좋겠어."
          />
        </label>
        <button className="primary-action" type="button" onClick={requestRecommendation} disabled={loading || !requestText.trim()}>
          <Wand2 size={18} />
          {loading ? "추천 생성 중..." : "인공지능 추천받기"}
        </button>
      </section>

      {aiResult && (
        <section className="result-panel">
          <h2>{aiResult.concept}</h2>
          <p className="summary">{aiResult.summary}</p>
          <p>{aiResult.reason}</p>
          {aiResult.avoid && <p><strong>피하면 좋은 조합:</strong> {aiResult.avoid}</p>}
          {aiResult.source === "demo" && <p className="api-note">예시 응답입니다. 설정 파일에 키를 넣으면 실제 인공지능 응답으로 바뀝니다.</p>}
          {Array.isArray(aiResult.alternatives) && aiResult.alternatives.length > 0 && (
            <div className="alternative-list">
              <h3>대체 조합</h3>
              {aiResult.alternatives.map((item, index) => (
                <div className="alternative-item" key={`${item.title}-${index}`}>
                  <strong>{item.title}</strong>
                  <span>{item.note}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </ModeLayout>
  );
}

function CombinationMode({ skinTone, selection, setSelection, onBack }) {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const selectedColors = useMemo(() => buildSelectedColors(selection), [selection]);
  const scoreResult = useMemo(() => calculateScore(skinTone, selectedColors), [skinTone, selectedColors]);
  const localAnalysis = generateLocalAnalysis(skinTone, selectedColors, scoreResult);

  const requestAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/analyze-combination`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skinTone, selectedColors, scoreResult })
      });
      if (!response.ok) throw new Error("AI analysis request failed");
      setAiAnalysis(await response.json());
    } catch {
      setAiAnalysis({
        analysis: "서버 실행 상태를 확인해주세요.",
        strengths: [],
        weaknesses: [],
        suggestion: "서버가 켜져 있어야 인공지능 설명을 생성할 수 있습니다."
      });
    } finally {
      setLoading(false);
    }
  };

  const resetCombination = () => {
    setSelection(defaultMakeupSelection);
    setAiAnalysis(null);
  };

  return (
    <ModeLayout title="조합 모드" skinTone={skinTone} selectedColors={selectedColors} scoreResult={scoreResult} onBack={onBack}>
      <section className="input-panel">
        <p className="mode-note">조합 모드는 톤 단계 제한 없이 전체 팔레트에서 자유롭게 선택합니다.</p>
        <div className="mode-toolbar">
          <button className="secondary-action compact-action" type="button" onClick={resetCombination}>
            선택 초기화
          </button>
        </div>
        {["lip", "blusher", "eyeshadow"].map((part) => (
          <ColorSelect
            key={part}
            part={part}
            value={selection[part]}
            onChange={(id) => {
              setSelection((current) => ({ ...current, [part]: id }));
              setAiAnalysis(null);
            }}
          />
        ))}
        <button className="primary-action" type="button" onClick={requestAnalysis} disabled={loading}>
          <Sparkles size={18} />
          {loading ? "설명 생성 중..." : "인공지능 설명 생성"}
        </button>
      </section>

      <section className="result-panel analysis">
        <h2>{aiAnalysis ? "인공지능 설명" : "기본 분석"}</h2>
        {aiAnalysis ? (
          <>
            <p>{aiAnalysis.analysis}</p>
            {aiAnalysis.strengths?.length > 0 && <p><strong>장점:</strong> {aiAnalysis.strengths.join(" ")}</p>}
            {aiAnalysis.weaknesses?.length > 0 && <p><strong>아쉬운 점:</strong> {aiAnalysis.weaknesses.join(" ")}</p>}
            {aiAnalysis.suggestion && <p><strong>제안:</strong> {aiAnalysis.suggestion}</p>}
            {aiAnalysis.source === "demo" && <p className="api-note">예시 응답입니다. 설정 파일에 키를 넣으면 실제 인공지능 설명으로 바뀝니다.</p>}
          </>
        ) : (
          localAnalysis.map((line) => <p key={line}>{line}</p>)
        )}
      </section>
    </ModeLayout>
  );
}

function ModeLayout({ title, skinTone, selectedColors, scoreResult, onBack, children }) {
  return (
    <section className="mode-view">
      <header className="topbar">
        <button className="text-button" type="button" onClick={onBack}>처음으로</button>
        <div>
          <p className="eyebrow">{title}</p>
          <h1>{seasonProfiles[skinTone.season].label} {toneLabels[skinTone.toneDetail]}</h1>
        </div>
      </header>
      <div className="workspace">
        <div className="preview-column">
          <FacePreview selectedColors={selectedColors} skinTone={skinTone} score={scoreResult.score} />
          <AppliedPalette selectedColors={selectedColors} />
        </div>
        <aside className="control-panel">
          {children}
          <ScorePanel scoreResult={scoreResult} />
        </aside>
      </div>
    </section>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [skinTone, setSkinTone] = useState(null);
  const [makeupSelection, setMakeupSelection] = useState(defaultMakeupSelection);

  const saveSkinTone = (nextSkinTone) => {
    setSkinTone(nextSkinTone);
    setMakeupSelection(defaultMakeupSelection);
    setView("home");
  };

  return (
    <main className="app-shell">
      {view === "home" && <HomeView skinTone={skinTone} onNavigate={setView} />}
      {view === "skin" && <SkinSetup initialTone={skinTone} onSave={saveSkinTone} onBack={() => setView("home")} />}
      {view === "recommend" && skinTone && (
        <RecommendationMode
          skinTone={skinTone}
          selection={makeupSelection}
          setSelection={setMakeupSelection}
          onBack={() => setView("home")}
        />
      )}
      {view === "combine" && skinTone && (
        <CombinationMode
          skinTone={skinTone}
          selection={makeupSelection}
          setSelection={setMakeupSelection}
          onBack={() => setView("home")}
        />
      )}
    </main>
  );
}
