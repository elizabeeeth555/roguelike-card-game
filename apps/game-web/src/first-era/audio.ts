// Stable IDs isolate scene policy from replaceable URLs. No game/save dependencies.
export const FIRST_ERA_AUDIO = {
 forest: { url: './first-era/audio/bgm-first-era-hub-forest.mp3', bus: 'bgm' },
 fire: { url: './first-era/audio/sfx-first-era-campfire.mp3', bus: 'ambience' },
 king: { url: './first-era/audio/bgm-first-era-old-king.mp3', bus: 'bgm' }
} as const;
export type AudioId = keyof typeof FIRST_ERA_AUDIO;
export type AudioScene = 'hub' | 'battle' | 'silent';
export interface AudioSettings { bgm: number; ambience: number; muted: boolean }
export const DEFAULT_AUDIO_SETTINGS: AudioSettings = { bgm: .5, ambience: .25, muted: false };
export interface TrackPort { play(): Promise<void>; pause(): void; gain(value: number): void; dispose(): void }
export interface AudioPort { create(id: AudioId, url: string, onError: () => void): TrackPort; resume(): Promise<void>; dispose(): void }
export interface AudioClock { now(): number; every(callback: () => void): unknown; cancel(handle: unknown): void }
const clock: AudioClock = { now: () => performance.now(), every: fn => setInterval(fn, 40), cancel: id => clearInterval(id as ReturnType<typeof setInterval>) };
interface Track { port: TrackPort; value: number; pending: boolean; playing: boolean }
export class FirstEraAudio {
 private tracks = new Map<AudioId, Track>(); private scene: AudioScene = 'hub'; private settings = { ...DEFAULT_AUDIO_SETTINGS };
 private unlocked = false; private hidden = false; private disposed = false; private timer: unknown;
 private resumeRevision = 0; private silentUntil = 0; private silenceWaiters = new Set<() => void>();
 private error = ''; private listeners = new Set<() => void>();
 private port: AudioPort; private time: AudioClock; private sources: Record<AudioId, { url: string; bus: string }>;
 constructor(port: AudioPort, time: AudioClock = clock, sources: Record<AudioId, { url: string; bus: string }> = FIRST_ERA_AUDIO) { this.port = port; this.time = time; this.sources = sources; }
 subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
 getSnapshot = () => this.error;
 private status(message: string) { if (message !== this.error) { this.error = message; this.listeners.forEach(fn => fn()); } }
 private targets(): Record<AudioId, number> {
  if (!this.unlocked || this.hidden || this.settings.muted || this.disposed) return { forest: 0, fire: 0, king: 0 };
  return { forest: this.scene === 'hub' ? this.settings.bgm : 0, fire: this.scene === 'hub' ? this.settings.ambience : 0, king: this.scene === 'battle' ? this.settings.bgm : 0 };
 }
 private resume() {
  const revision = ++this.resumeRevision;
  const failed = () => { if (!this.disposed && revision === this.resumeRevision && this.scene !== 'silent' && !this.hidden && !this.settings.muted) this.status('音声を開始できません。操作後に再試行してください。'); };
  try { void this.port.resume().catch(failed); } catch { failed(); }
 }
 unlock = () => {
  if (this.disposed) return;
  const needsSync = !this.unlocked || !!this.error; this.unlocked = true; this.status('');
  if (this.scene === 'silent') { this.resume(); return; }
  // Resume and play originate in the gesture; pending players cannot be duplicated.
  this.resume(); if (needsSync) this.sync();
 };
 private releaseSilence() { this.silenceWaiters.forEach(resolve => resolve()); this.silenceWaiters.clear(); }
 private retire(id: AudioId, track: Track) {
  if (this.tracks.get(id) !== track) return;
  this.tracks.delete(id); track.pending = false; track.playing = false; track.value = 0;
  track.port.gain(0); track.port.pause(); track.port.dispose();
 }
 private failed(id: AudioId, track: Track) {
  if (this.disposed || this.tracks.get(id) !== track) return;
  // A late media error invalidates both the playing flag and pending play promises.
  // Recreate the element/source on retry, so a terminal MediaError is not reused.
  this.retire(id, track);
  if (this.scene !== 'silent') this.status('音声を再生できません。音声を再試行するか、ミュートで続行できます。');
  else if ([...this.tracks.values()].every(t => t.value === 0)) this.releaseSilence();
 }
 setScene(scene: AudioScene) {
  if (this.disposed || this.scene === scene) return;
  this.resumeRevision++; this.releaseSilence(); this.scene = scene; this.status('');
  if (scene === 'silent') this.silentUntil = this.time.now() + 1000;
  if (scene === 'battle') { const king = this.tracks.get('king'); if (king) this.retire('king', king); }
  this.sync();
 }
 finishBattle = (): Promise<void> => {
  if (this.disposed) return Promise.resolve();
  this.setScene('silent');
  return [...this.tracks.values()].every(t => t.value === 0) ? Promise.resolve() : new Promise(resolve => this.silenceWaiters.add(resolve));
 };
 setSettings(settings: AudioSettings) {
  const volume = (n: number, fallback: number) => Number.isFinite(n) && n >= 0 && n <= 1 ? n : fallback;
  this.settings = { bgm: volume(settings.bgm, this.settings.bgm), ambience: volume(settings.ambience, this.settings.ambience), muted: settings.muted === true };
  this.sync();
 }
 setHidden(hidden: boolean) {
  if (this.hidden === hidden || this.disposed) return; this.hidden = hidden;
  if (!hidden && this.unlocked && !this.settings.muted && this.scene !== 'silent') this.resume();
  this.sync();
 }
 private sync() {
  if (this.disposed) return;
  if (this.timer !== undefined) { this.time.cancel(this.timer); this.timer = undefined; }
  const targets = this.targets(), start = this.time.now(), duration = this.scene === 'silent' ? Math.max(0, this.silentUntil - start) : 1200, from = new Map<AudioId, number>();
  for (const id of Object.keys(targets) as AudioId[]) {
   let track = this.tracks.get(id);
   if (targets[id] > 0 && !track) {
    try {
     const created: Track = { port: undefined!, value: 0, pending: false, playing: false };
     created.port = this.port.create(id, this.sources[id].url, () => this.failed(id, created));
     this.tracks.set(id, created); track = created;
    }
    catch { this.status('音源を利用できません。ゲームは音声なしで続行できます。'); continue; }
   }
   if (!track) continue;
   from.set(id, track.value);
   if (targets[id] > 0 && !track.playing && !track.pending) {
    const t = track; t.pending = true;
    try { void t.port.play().then(() => {
     if (this.disposed || this.tracks.get(id) !== t) { t.port.pause(); return; }
     t.pending = false; t.playing = true;
     if (this.targets()[id] === 0 && t.value === 0) { t.port.pause(); t.playing = false; }
    }, () => this.failed(id, t)); }
    catch { this.failed(id, t); }
   }
  }
  const tick = () => {
   if (this.disposed) return;
   const fraction = this.hidden || this.settings.muted || duration === 0 ? 1 : Math.min(1, (this.time.now() - start) / duration);
   for (const [id, t] of this.tracks) {
    t.value = (from.get(id) ?? 0) + (targets[id] - (from.get(id) ?? 0)) * fraction; t.port.gain(t.value);
    if (fraction === 1 && targets[id] === 0) { t.port.pause(); t.playing = false; }
   }
   if (fraction === 1) { if (this.timer !== undefined) { this.time.cancel(this.timer); this.timer = undefined; } if (this.scene === 'silent') this.releaseSilence(); }
  };
  tick();
  if (!this.hidden && !this.settings.muted && this.tracks.size) this.timer = this.time.every(tick);
 }
 dispose() { if (this.disposed) return; this.disposed = true; this.resumeRevision++; this.releaseSilence(); if (this.timer !== undefined) this.time.cancel(this.timer); this.tracks.forEach(t => t.port.dispose()); this.port.dispose(); this.listeners.clear(); }
}
export function browserAudioPort(): AudioPort {
 let context: AudioContext | undefined;
 return {
  resume() {
   const Constructor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
   if (!context && Constructor) context = new Constructor();
   return context?.state === 'suspended' ? context.resume() : Promise.resolve();
  },
  create(id, url, onError) {
   const audio = document.createElement('audio'); audio.src = url; audio.loop = true; audio.preload = 'none'; audio.hidden = true; audio.dataset.firstEraAudio = id;
   const source = context?.createMediaElementSource(audio), gain = context?.createGain();
   if (source && gain && context) { gain.gain.value = 0; source.connect(gain); gain.connect(context.destination); } else audio.volume = 0;
   audio.addEventListener('error', onError); document.body.append(audio);
   return { play: () => audio.play(), pause: () => audio.pause(), gain: n => { if (gain) gain.gain.value = n; else audio.volume = n; }, dispose: () => { audio.removeEventListener('error', onError); audio.pause(); audio.removeAttribute('src'); audio.load(); audio.remove(); source?.disconnect(); gain?.disconnect(); } };
  },
  dispose() { if (context) void context.close().catch(() => {}); }
 };
}
