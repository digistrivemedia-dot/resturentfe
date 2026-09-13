// Synthesized notification chime — no audio file to host, so it can never
// silently fail to load the way a missing/broken MP3 URL would (mobile's
// order-placed sound has exactly that problem right now, pointing at a file
// that isn't actually on the server).

let audioCtx = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}

// Browsers block audio (including synthesized tones) until the page has
// received real user input — call this on the first click/keypress so the
// very first genuine "new_order" chime isn't silently dropped.
export function primeNotificationSound() {
  getAudioContext();
}

// Two-tone "ding-dong" chime.
export function playNewOrderChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [
      { freq: 880, start: 0 },
      { freq: 660, start: 0.18 },
    ].forEach(({ freq, start }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.35, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + 0.4);
    });
  } catch {}
}
