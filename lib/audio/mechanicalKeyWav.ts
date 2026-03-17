// Generates a tiny PCM WAV (~2KB) "mechanical key" click.
// We keep it small (<< 50KB) and decode once for low-latency playback.

function writeString(view: DataView, offset: number, value: string) {
  for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
}

export function createMechanicalKeyWav({
  sampleRate = 44100,
  durationMs = 18,
  baseFreqHz = 2200,
}: {
  sampleRate?: number;
  durationMs?: number;
  baseFreqHz?: number;
} = {}) {
  const numSamples = Math.max(1, Math.floor((durationMs / 1000) * sampleRate));
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");

  // fmt chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // PCM
  view.setUint16(20, 1, true); // audio format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  // Synthesize a short click: band-limited noise + a damped sine "tick"
  // with exponential decay to feel "mechanical" without being loud.
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const decay = Math.exp(-t * 180); // fast decay
    const noise = (Math.random() * 2 - 1) * 0.35;
    const tone = Math.sin(2 * Math.PI * baseFreqHz * t) * 0.65;
    const sample = (noise + tone) * decay;
    const s16 = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, Math.round(s16 * 32767), true);
    offset += 2;
  }

  return buffer;
}

