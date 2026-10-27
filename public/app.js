const form = document.querySelector('#narration-form');
const durationSelect = document.querySelector('#duration');
const generateButton = document.querySelector('#generate-button');
const formError = document.querySelector('#form-error');
const emptyState = document.querySelector('#empty-state');
const loadingState = document.querySelector('#loading-state');
const resultState = document.querySelector('#result-state');
const durationBadge = document.querySelector('#duration-badge');
const resultTitle = document.querySelector('#result-title');
const scriptOutput = document.querySelector('#script-output');
const wordCount = document.querySelector('#word-count');
const speakingTime = document.querySelector('#speaking-time');
const playButton = document.querySelector('#play-button');
const playLabel = document.querySelector('#play-label');
const stopButton = document.querySelector('#stop-button');
const copyButton = document.querySelector('#copy-button');
const downloadButton = document.querySelector('#download-button');
const playbackStatus = document.querySelector('#playback-status');
const speechSupportNote = document.querySelector('#speech-support-note');

const speechAvailable = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let activeUtterance = null;
let generationController = null;

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function countWords(text) {
  const words = text.trim().match(/\b[\p{L}\p{N}’'-]+\b/gu);
  return words ? words.length : 0;
}

function updateDurationBadge() {
  durationBadge.textContent = `${formatTime(Number(durationSelect.value))} target`;
}

function updateScriptMeta() {
  const words = countWords(scriptOutput.value);
  const seconds = Math.round((words / 130) * 60);
  wordCount.textContent = `${words} ${words === 1 ? 'word' : 'words'}`;
  speakingTime.textContent = `About ${formatTime(seconds)} spoken`;
}

function showError(message) {
  formError.textContent = message;
  formError.hidden = false;
}

function clearError() {
  formError.textContent = '';
  formError.hidden = true;
}

function stopPlayback(status = '') {
  if (speechAvailable) window.speechSynthesis.cancel();
  activeUtterance = null;
  playButton.classList.remove('is-speaking');
  playButton.setAttribute('aria-label', 'Play narration');
  playLabel.textContent = 'Hear it';
  stopButton.disabled = true;
  playbackStatus.textContent = status;
}

function buildRequestBody() {
  return {
    problem: document.querySelector('#problem').value,
    demo: document.querySelector('#demo').value,
    myCode: document.querySelector('#my-code').value,
    aiCode: document.querySelector('#ai-code').value,
    durationSeconds: Number(durationSelect.value),
    tone: document.querySelector('#tone').value,
  };
}

function setLoading(isLoading) {
  generateButton.disabled = isLoading;
  generateButton.querySelector('span').textContent = isLoading ? 'Finding the words…' : 'Shape my narration';
  loadingState.hidden = !isLoading;
  if (isLoading) {
    emptyState.hidden = true;
    resultState.hidden = true;
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError();
  if (!form.reportValidity()) return;
  stopPlayback();
  setLoading(true);
  generationController = new AbortController();
  const timeoutId = window.setTimeout(() => generationController?.abort(), 40_000);

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildRequestBody()),
      signal: generationController.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || 'The narration could not be generated. Please try again.');
    }
    if (typeof payload.script !== 'string' || !payload.script.trim()) {
      throw new Error('The server returned an empty script. Please try again.');
    }

    resultTitle.textContent = payload.title || 'Your first take';
    scriptOutput.value = payload.script;
    updateScriptMeta();
    emptyState.hidden = true;
    loadingState.hidden = true;
    resultState.hidden = false;
    resultTitle.focus();
    playbackStatus.textContent = 'Your draft is ready. Edit anything that does not sound like you.';
  } catch (error) {
    if (error.name === 'AbortError') {
      showError('That request took too long. Check your connection and try again.');
    } else {
      showError(error.message || 'Something went wrong. Please try again.');
    }
    loadingState.hidden = true;
    if (scriptOutput.value.trim()) {
      resultState.hidden = false;
    } else {
      emptyState.hidden = false;
    }
  } finally {
    window.clearTimeout(timeoutId);
    generationController = null;
    generateButton.disabled = false;
    generateButton.querySelector('span').textContent = 'Shape my narration';
  }
});

durationSelect.addEventListener('change', updateDurationBadge);
scriptOutput.addEventListener('input', updateScriptMeta);

playButton.addEventListener('click', () => {
  if (!speechAvailable) {
    speechSupportNote.hidden = false;
    speechSupportNote.textContent = 'Spoken playback is not available in this browser. Your script is still ready to edit, copy, or download.';
    return;
  }

  const text = scriptOutput.value.trim();
  if (!text) {
    playbackStatus.textContent = 'Add a script before playing it.';
    return;
  }

  const synthesis = window.speechSynthesis;
  if (synthesis.speaking && !synthesis.paused) {
    synthesis.pause();
    playLabel.textContent = 'Resume';
    playButton.setAttribute('aria-label', 'Resume narration');
    playbackStatus.textContent = 'Playback paused.';
    return;
  }

  if (synthesis.paused && activeUtterance) {
    synthesis.resume();
    playLabel.textContent = 'Pause';
    playButton.setAttribute('aria-label', 'Pause narration');
    playbackStatus.textContent = 'Playing your draft aloud.';
    return;
  }

  synthesis.cancel();
  activeUtterance = new SpeechSynthesisUtterance(text);
  activeUtterance.rate = 0.96;
  activeUtterance.pitch = 1;
  activeUtterance.onstart = () => {
    playButton.classList.add('is-speaking');
    playLabel.textContent = 'Pause';
    playButton.setAttribute('aria-label', 'Pause narration');
    stopButton.disabled = false;
    playbackStatus.textContent = 'Playing your draft aloud with this browser’s speech voice.';
  };
  activeUtterance.onend = () => stopPlayback('Playback finished. Change any line that does not sound like you.');
  activeUtterance.onerror = (event) => {
    if (event.error !== 'canceled' && event.error !== 'interrupted') {
      stopPlayback('Playback could not start. Try a different browser or use the script text.');
    }
  };
  synthesis.speak(activeUtterance);
  playButton.classList.add('is-speaking');
  playLabel.textContent = 'Pause';
  playButton.setAttribute('aria-label', 'Pause narration');
  stopButton.disabled = false;
  playbackStatus.textContent = 'Preparing spoken playback…';
});

stopButton.addEventListener('click', () => stopPlayback('Playback stopped.'));

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(scriptOutput.value);
    playbackStatus.textContent = 'Script copied to your clipboard.';
  } catch {
    playbackStatus.textContent = 'Clipboard access is unavailable. Select the script and copy it manually.';
  }
});

downloadButton.addEventListener('click', () => {
  const blob = new Blob([scriptOutput.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sayflow-narration.txt';
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  playbackStatus.textContent = 'Text script downloaded.';
});

window.addEventListener('beforeunload', () => {
  if (speechAvailable) window.speechSynthesis.cancel();
  generationController?.abort();
});

if (!speechAvailable) {
  speechSupportNote.hidden = false;
  speechSupportNote.textContent = 'This browser does not support spoken playback. You can still edit, copy, and download your script.';
  playButton.disabled = true;
}

updateDurationBadge();
