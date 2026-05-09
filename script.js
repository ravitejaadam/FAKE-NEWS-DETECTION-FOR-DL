// DOM references
const newsInput = document.getElementById("news-input");
const charCounter = document.getElementById("char-counter");
const analyzeBtn = document.getElementById("analyze-btn");
const clearBtn = document.getElementById("clear-btn");
const loadRealBtn = document.getElementById("load-real");
const loadFakeBtn = document.getElementById("load-fake");
const spinner = analyzeBtn.querySelector(".spinner");
const btnText = analyzeBtn.querySelector(".btn-text");
const resultSection = document.getElementById("result-section");
const resultBadge = document.getElementById("result-badge");
const predictionText = document.getElementById("prediction-text");
const confidenceText = document.getElementById("confidence-text");
const confidenceBar = document.getElementById("confidence-bar");
const progressWrap = document.querySelector(".progress-wrap");

const MAX_CHARS = 6000;
const REALTIME_MIN_CHARS = 40;
const REALTIME_DEBOUNCE_MS = 700;
let realtimeTimer = null;
let latestRealtimeRequestId = 0;

const realNewsSample = `The Ministry of Health announced today that a nationwide immunization campaign has reached 92% coverage among children under five years old, according to the latest public health report. Officials said the campaign focused on rural outreach, mobile vaccine clinics, and digital tracking to improve follow-up appointments.

Independent observers from the National Medical Council verified distribution records across 18 districts and confirmed that cold-chain logistics remained intact during transportation. Health workers reported that over 1.4 million vaccine doses were administered in the past 60 days.

Public health experts noted that increased coordination between district hospitals and local schools helped improve awareness. The ministry stated that follow-up data and district-level performance reports will be published next month on the official government portal to ensure transparency and allow third-party review.`;

const fakeNewsSample = `A shocking secret report claims that city streetlights are now equipped with hidden microchips that can read private thoughts and instantly transfer them to foreign intelligence satellites. The leaked document, shared by anonymous insiders, alleges that the system was activated last week without public consent.

According to unverified online posts, people who walked under these lights experienced sudden memory loss, unusual dreams, and immediate account lockouts on social media platforms. Several viral videos also claim that neighborhood birds changed migration patterns because of the "mind-frequency interference field."

No official agency has confirmed these claims, but users are urged to wear aluminum helmets and avoid all major intersections after sunset. The same sources say the technology will soon be expanded to parks, schools, and shopping centers as part of a global control experiment.`;

updateCounter();

newsInput.addEventListener("input", () => {
  updateCounter();
  newsInput.classList.remove("error-glow");
  scheduleRealtimePrediction();
});

loadRealBtn.addEventListener("click", () => loadSample(realNewsSample));
loadFakeBtn.addEventListener("click", () => loadSample(fakeNewsSample));
clearBtn.addEventListener("click", handleClear);
analyzeBtn.addEventListener("click", handleAnalyze);

function updateCounter() {
  const count = newsInput.value.length;
  charCounter.textContent = `${count} / ${MAX_CHARS} characters`;
}

function loadSample(sampleText) {
  newsInput.value = sampleText;
  updateCounter();
  hideResult();
  newsInput.focus();
}

function handleClear() {
  newsInput.value = "";
  updateCounter();
  hideResult();
  newsInput.classList.remove("error-glow");
  clearTimeout(realtimeTimer);
  newsInput.focus();
}

async function handleAnalyze() {
  const text = newsInput.value.trim();

  if (!text) {
    newsInput.classList.add("error-glow");
    newsInput.focus();
    return;
  }

  setLoadingState(true);
  hideResult();
  clearTimeout(realtimeTimer);

  try {
    const result = await predictNews(text);
    renderResult(result);
  } catch (error) {
    renderResult({
      prediction: "FAKE",
      confidence: 0
    });
    predictionText.textContent = "ERROR";
    confidenceText.textContent = "Could not analyze text";
    resultBadge.textContent = "ERROR";
    resultBadge.className = "prediction-badge badge-fake";
  } finally {
    setLoadingState(false);
  }
}

function setLoadingState(isLoading) {
  analyzeBtn.disabled = isLoading;
  spinner.classList.toggle("hidden", !isLoading);
  btnText.textContent = isLoading ? "Analyzing..." : "Analyze";
}

function hideResult() {
  resultSection.classList.add("hidden");
  confidenceBar.style.width = "0%";
  progressWrap.setAttribute("aria-valuenow", "0");
}

function renderResult({ prediction, confidence }) {
  const normalizedPrediction = prediction.toUpperCase() === "REAL" ? "REAL" : "FAKE";
  const roundedConfidence = Math.max(0, Math.min(100, Number(confidence))).toFixed(1);

  predictionText.textContent = normalizedPrediction;
  confidenceText.textContent = `${roundedConfidence}%`;
  resultBadge.textContent = normalizedPrediction;

  predictionText.classList.remove("prediction-real", "prediction-fake");
  resultBadge.classList.remove("badge-real", "badge-fake");

  if (normalizedPrediction === "REAL") {
    predictionText.classList.add("prediction-real");
    resultBadge.classList.add("badge-real");
  } else {
    predictionText.classList.add("prediction-fake");
    resultBadge.classList.add("badge-fake");
  }

  resultSection.classList.remove("hidden");
  // Restart reveal animation each time results are displayed.
  resultSection.style.animation = "none";
  resultSection.offsetHeight;
  resultSection.style.animation = "";

  requestAnimationFrame(() => {
    confidenceBar.style.width = `${roundedConfidence}%`;
    progressWrap.setAttribute("aria-valuenow", roundedConfidence);
  });
}

/**
 * Backend-ready wrapper for model prediction.
 * Replace `mockPredictApi` with `realPredictApi` once backend is available.
 */
async function predictNews(text) {
  return realPredictApi(text);
}

/**
 * Debounced "real-time" prediction while user types.
 */
function scheduleRealtimePrediction() {
  clearTimeout(realtimeTimer);
  const text = newsInput.value.trim();

  if (text.length < REALTIME_MIN_CHARS || analyzeBtn.disabled) {
    return;
  }

  const requestId = ++latestRealtimeRequestId;
  realtimeTimer = setTimeout(async () => {
    try {
      const result = await predictNews(text);
      if (requestId === latestRealtimeRequestId) {
        renderResult(result);
      }
    } catch (_error) {
      // Keep UI stable for background real-time failures.
    }
  }, REALTIME_DEBOUNCE_MS);
}

/**
 * Real backend integration example.
 * Keep this function unused for now, but ready for immediate integration.
 */
async function realPredictApi(text) {
  const response = await fetch("/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    throw new Error("Prediction request failed");
  }

  return response.json();
}
