import { useEffect, useState, useSyncExternalStore } from 'react';
import { browserAudioPort, DEFAULT_AUDIO_SETTINGS, FirstEraAudio } from './audio';
import type { AudioScene } from './audio';
export function useFirstEraAudio(scene: AudioScene) {
 const [audio] = useState(() => new FirstEraAudio(browserAudioPort()));
 const [settings, setSettings] = useState({ ...DEFAULT_AUDIO_SETTINGS });
 const error = useSyncExternalStore(audio.subscribe, audio.getSnapshot);
 useEffect(() => { audio.setScene(scene); }, [audio, scene]);
 useEffect(() => { audio.setSettings(settings); }, [audio, settings]);
 useEffect(() => {
  const unlock = (event: Event) => { if (event.isTrusted) audio.unlock(); };
  const visibility = () => audio.setHidden(document.hidden);
  document.addEventListener('pointerdown', unlock, true); document.addEventListener('keydown', unlock, true); document.addEventListener('visibilitychange', visibility); visibility();
  return () => { document.removeEventListener('pointerdown', unlock, true); document.removeEventListener('keydown', unlock, true); document.removeEventListener('visibilitychange', visibility); audio.dispose(); };
 }, [audio]);
 return { settings, setSettings, error, retry: audio.unlock };
}
