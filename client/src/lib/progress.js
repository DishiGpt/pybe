// Learner progress persistence — browser-local only.
//
// PyBe is intentionally a no-database, no-auth prototype, so all progress
// (which case, which part, which sub-step, completion state, reflections)
// lives in `localStorage` under a single key. Consequences of that choice,
// kept deliberately:
//   - progress does NOT sync across devices or browsers;
//   - clearing site data resets the journey;
//   - there is no server-side user/session system and none should be added.
const KEY = 'pybe.progress.v1';
const CURRENT_VERSION = 1;

export function loadProgress() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return freshProgress();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || parsed.version !== CURRENT_VERSION) {
      return freshProgress();
    }
    return {
      version: CURRENT_VERSION,
      onboarded: Boolean(parsed.onboarded),
      caseSolved: Boolean(parsed.caseSolved),
      solvedAt: typeof parsed.solvedAt === 'string' ? parsed.solvedAt : null,
      currentCaseId: typeof parsed.currentCaseId === 'string' ? parsed.currentCaseId : null,
      currentPartId: typeof parsed.currentPartId === 'string' ? parsed.currentPartId : null,
      subStepIndex: parsed.subStepIndex && typeof parsed.subStepIndex === 'object' && !Array.isArray(parsed.subStepIndex) ? parsed.subStepIndex : {},
      revealedSuspectIds: Array.isArray(parsed.revealedSuspectIds) ? parsed.revealedSuspectIds : [],
      questionAttempts: parsed.questionAttempts && typeof parsed.questionAttempts === 'object' && !Array.isArray(parsed.questionAttempts) ? parsed.questionAttempts : {},
      completedSlideIds: Array.isArray(parsed.completedSlideIds) ? parsed.completedSlideIds : [],
      completedParts: Array.isArray(parsed.completedParts) ? parsed.completedParts : [],
      reflections: parsed.reflections && typeof parsed.reflections === 'object' && !Array.isArray(parsed.reflections) ? parsed.reflections : {}
    };
  } catch (error) {
    return freshProgress();
  }
}

export function saveProgress(progress) {
  try {
    const safe = progress && typeof progress === 'object' ? progress : freshProgress();
    window.localStorage.setItem(KEY, JSON.stringify({ ...safe, version: CURRENT_VERSION, lastUpdated: new Date().toISOString() }));
  } catch (error) {
    // Storage may be unavailable (private mode, quota) — the app must still
    // run, it simply will not remember anything between visits.
  }
}

export function resetProgress() {
  try {
    window.localStorage.removeItem(KEY);
  } catch (error) {
    // nothing to clean up
  }
  return freshProgress();
}

function freshProgress() {
  return {
    version: CURRENT_VERSION,
    onboarded: false,
    caseSolved: false,
    solvedAt: null,
    currentCaseId: null,
    currentPartId: null,
    subStepIndex: {},
    revealedSuspectIds: [],
    questionAttempts: {},
    completedSlideIds: [],
    completedParts: [],
    reflections: {}
  };
}

export function partStep(progress, partId, fallback = 0) {
  if (!progress || !progress.subStepIndex || typeof progress.subStepIndex !== 'object') return fallback;
  const index = progress.subStepIndex[partId];
  return typeof index === 'number' ? index : fallback;
}
