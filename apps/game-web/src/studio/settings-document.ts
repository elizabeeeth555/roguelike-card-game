// Small reusable envelope/JSON codec. Screen-specific validation is injected.
export const MAX_SETTINGS_BYTES = 32768;
export function createSettingsCodec<T>(format: string, version: number, validate: (value: unknown) => T) {
  return {
    parse(text: string): T {
      if (new TextEncoder().encode(text).length > MAX_SETTINGS_BYTES) throw new Error('設定ファイルは32KiB以下にしてください。');
      let value: unknown;
      try { value = JSON.parse(text); } catch { throw new Error('JSONが破損しています。'); }
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('設定ファイルの形式が不正です。');
      const doc = value as Record<string, unknown>;
      if (doc.format !== format) throw new Error('対応していない設定形式です。');
      if (doc.version !== version) throw new Error('対応していない設定バージョンです。');
      if (Object.keys(doc).some(key => !['format', 'version', 'settings'].includes(key))) throw new Error('未知の項目を含む設定ファイルです。');
      return validate(doc.settings);
    },
    stringify(settings: T) { return JSON.stringify({ format, version, settings: validate(settings) }, null, 2); }
  };
}
export interface SettingsStorage { getItem(key: string): string | null; setItem(key: string, value: string): void }
export function createSettingsRepository<T>(storage: () => SettingsStorage, key: string, codec: ReturnType<typeof createSettingsCodec<T>>) {
  return {
    load(): { value?: T; error?: string } {
      try { const text = storage().getItem(key); return text === null ? {} : { value: codec.parse(text) }; }
      catch (error) { return { error: error instanceof Error ? error.message : '保存データを読み込めません。' }; }
    },
    save(value: T): string | null {
      try { storage().setItem(key, codec.stringify(value)); return null; }
      catch { return 'ローカル保存を利用できません。編集は継続できます。JSONを書き出して保管してください。'; }
    }
  };
}
