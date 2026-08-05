// Web Audio API Synthesizer for game sounds

let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Check if user has interacted with the page (required for audio to play)
export let isMuted = false;
export const setMuted = (muted: boolean) => {
  isMuted = muted;
  if (muted && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

let hasInteracted = false;
window.addEventListener('click', () => { hasInteracted = true; }, { once: true });
window.addEventListener('keydown', () => { hasInteracted = true; }, { once: true });

export const playClick = () => {
  if (!hasInteracted || isMuted) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
};

export const playDispatch = () => {
  if (!hasInteracted || isMuted) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
};

export const playIncident = () => {
  if (!hasInteracted || isMuted) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(250, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
};

export const playFireAlert = () => {
  if (!hasInteracted || isMuted) return;
  try {
    const ctx = getCtx();
    [0, 0.15, 0.3].forEach(offset => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440 + offset * 100, ctx.currentTime + offset);
      osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + offset + 0.12);
      gain.gain.setValueAtTime(0.06, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.13);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.13);
    });
  } catch (e) {}
};

export const playAccidentAlert = () => {
  if (!hasInteracted || isMuted) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.setValueAtTime(180, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(300, ctx.currentTime + 0.2);
    osc.frequency.setValueAtTime(180, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
};

export const playRobberyAlert = () => {
  if (!hasInteracted || isMuted) return;
  try {
    const ctx = getCtx();
    [0, 0.08].forEach(offset => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, ctx.currentTime + offset);
      gain.gain.setValueAtTime(0.05, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.07);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.07);
    });
  } catch (e) {}
};

export const playExplosionAlert = () => {
  if (!hasInteracted || isMuted) return;
  try {
    const ctx = getCtx();
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    noise.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch (e) {}
};

export const playRescueAlert = () => {
  if (!hasInteracted || isMuted) return;
  try {
    const ctx = getCtx();
    [440, 550, 660].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.15);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.15);
    });
  } catch (e) {}
};

export const playMedicalAlert = () => {
  if (!hasInteracted || isMuted) return;
  try {
    const ctx = getCtx();
    [0, 0.2].forEach(offset => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime + offset);
      osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + offset + 0.18);
      gain.gain.setValueAtTime(0.05, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.18);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.18);
    });
  } catch (e) {}
};

export const playIncidentByType = (type: string) => {
  switch (type) {
    case 'fire': return playFireAlert();
    case 'accident': return playAccidentAlert();
    case 'robbery': return playRobberyAlert();
    case 'explosion': return playExplosionAlert();
    case 'rescue': return playRescueAlert();
    case 'medical': return playMedicalAlert();
    default: return playIncident();
  }
};

export const playSuccess = () => {
  if (!hasInteracted || isMuted) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.setValueAtTime(500, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(600, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.05, ctx.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
};

export const playError = () => {
  if (!hasInteracted || isMuted) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.setValueAtTime(100, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
};

export const playSiren = () => {
  if (!hasInteracted || isMuted) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.3);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.6);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.03, ctx.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {}
};

export const playRadioChatter = () => {
  if (!hasInteracted || isMuted) return;
  try {
    const ctx = getCtx();
    const bufferSize = ctx.sampleRate * 0.3; // 300ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // white noise
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    // Bandpass filter for radio effect
    const biquadFilter = ctx.createBiquadFilter();
    biquadFilter.type = "bandpass";
    biquadFilter.frequency.value = 1500;
    biquadFilter.Q.value = 1.0;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    noiseSource.connect(biquadFilter);
    biquadFilter.connect(gain);
    gain.connect(ctx.destination);
    
    noiseSource.start();
  } catch (e) {}
};

export const speak = (text: string) => {
  if (!hasInteracted || !window.speechSynthesis || isMuted) return;
  // Cancel previous speech if still playing to keep it responsive
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ro-RO';
  utterance.rate = 1.1; // Slightly faster for dispatch feel
  utterance.pitch = 0.9;
  
  // Try to find a Romanian voice, or use default
  const voices = window.speechSynthesis.getVoices();
  const roVoice = voices.find(v => v.lang.startsWith('ro'));
  if (roVoice) {
    utterance.voice = roVoice;
  }
  
  window.speechSynthesis.speak(utterance);
};
